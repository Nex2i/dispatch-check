import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import Fastify from 'fastify';
import { createAccountAuth, type Mail } from './auth.js';
import { registerAccountRoutes } from './account-routes.js';

const origin = 'http://localhost:5173';
const secret = 'local-integration-test-only-secret-with-more-than-32-chars';

test('production auth fails closed without mail credentials and rejects non-HTTPS origin', () => {
 const pool = new Pool();
 assert.throws(() => createAccountAuth(pool, { origin: 'https://example.com', secret, productName: 'Test' }), /email configuration/);
 assert.throws(() => createAccountAuth(pool, { origin, secret, productName: 'Test' }), /HTTPS/);
});

test('actual PostgreSQL account lifecycle and security boundaries', { skip: !process.env.TEST_DATABASE_URL }, async () => {
 const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
 // Require a dedicated empty test DB: schema is dropped at test end.
 const schema = `auth_test_${Date.now()}`;
 await pool.query(`CREATE DATABASE "${schema}"`);
 
 const dbUrl = new URL(process.env.TEST_DATABASE_URL!); dbUrl.pathname = schema;
 const db = new Pool({ connectionString: dbUrl.toString() });
 await db.query(await readFile(new URL('../migrations/schema.sql', import.meta.url), 'utf8'));
 const mail: Mail[] = [];
 const auth = createAccountAuth(db, { origin, secret, productName: 'Test', development: true, supportEmail: 'support@example.com' }, async value => { mail.push(value); });
 const app = Fastify({ logger: false, disableRequestLogging: true });
 await registerAccountRoutes(app, auth, db, origin, async id => ({ owner: id }), secret);
 const call = (path: string, body?: unknown, cookie?: string, requestOrigin = origin) => app.inject({ method: body ? 'POST' : 'GET', url: path, headers: { origin: requestOrigin, ...(cookie ? { cookie } : {}) }, ...(body ? { payload: body } : {}) });
 const extractCookie = (response: { headers: Record<string, unknown> }) => {
  const values = response.headers['set-cookie'];
  return (Array.isArray(values) ? values : [values]).filter(Boolean).map(value => String(value).split(';')[0]).join('; ');
 };
 try {
  const signup = { name: 'Synthetic', username: 'synthetic_user', email: 'synthetic@example.com', password: 'long-test-password-123' };
  assert.equal((await call('/api/auth/sign-up/email', signup, undefined, 'https://attacker.example')).statusCode, 403);
  const created = await call('/api/auth/sign-up/email', signup);
  assert.equal(created.statusCode, 200, created.body);
  assert.equal(mail.length, 1);
  assert.equal((await call('/api/account')).statusCode, 401);
  assert.equal((await call('/api/auth/sign-in/username', { username: signup.username, password: signup.password })).statusCode, 403);
  const verification = mail.find(m => m.subject.startsWith('Verify'))!.text.match(/http:\/\/[^\s]+/)![0];
  const verified = await call(new URL(verification).pathname + new URL(verification).search);
  assert.equal(verified.statusCode, 302, verified.body);
  const login = await call('/api/auth/sign-in/username', { username: signup.username, password: signup.password });
  assert.equal(login.statusCode, 200, login.body);
  const cookie = extractCookie(login);
  assert.ok(cookie);
  const profile = await call('/api/account', undefined, cookie);
  assert.equal(profile.statusCode, 200);
  assert.equal(profile.json().username, signup.username);
  const exported = await call('/api/account/export', undefined, cookie);
  assert.equal(exported.statusCode, 200);
  assert.equal(exported.json().data.owner, profile.json().id);
  assert.ok(!exported.body.includes('password'));
  assert.ok(!exported.body.includes(cookie));
  assert.equal((await call('/api/auth/delete-user', {}, cookie)).statusCode, 400);
  assert.equal((await call('/api/auth/delete-user', { password: 'incorrect' }, cookie)).statusCode, 400);
  const recovery = await call('/api/auth/request-password-reset', { email: signup.email, redirectTo: `${origin}/reset-password` });
  assert.equal(recovery.statusCode, 200, recovery.body);
  const resetLink = mail.find(m => m.subject.startsWith('Reset'))!.text.match(/http:\/\/[^\s]+/)![0];
  const resetToken = new URL(resetLink).pathname.split('/').pop();
  const reset = await call('/api/auth/reset-password', { token: resetToken, newPassword: 'changed-password-test-456' });
  assert.equal(reset.statusCode, 200, reset.body);
  assert.equal((await call('/api/account', undefined, cookie)).statusCode, 401, 'password reset revokes existing session');
  assert.equal((await call('/api/auth/reset-password', { token: resetToken, newPassword: 'other-password-test-789' })).statusCode, 400, 'reset token cannot replay');
  const login2 = await call('/api/auth/sign-in/email', { email: signup.email, password: 'changed-password-test-456' });
  assert.equal(login2.statusCode, 200, login2.body);
  const cookie2 = extractCookie(login2);
  assert.equal((await call('/api/auth/revoke-sessions', {}, cookie2)).statusCode, 200);
  assert.equal((await call('/api/account', undefined, cookie2)).statusCode, 401);
  const login3 = await call('/api/auth/sign-in/email', { email: signup.email, password: 'changed-password-test-456' });
  const cookie3 = extractCookie(login3);
  assert.equal((await call('/api/auth/sign-out', {}, cookie3)).statusCode, 200);
  assert.equal((await call('/api/account', undefined, cookie3)).statusCode, 401);
  const login4 = await call('/api/auth/sign-in/email', { email: signup.email, password: 'changed-password-test-456' });
  const cookie4 = extractCookie(login4);
  const deleted = await call('/api/auth/delete-user', { password: 'changed-password-test-456' }, cookie4);
  assert.equal(deleted.statusCode, 200, deleted.body);
  assert.equal((await db.query('SELECT count(*) FROM "user"')).rows[0].count, '0');
  assert.equal((await db.query('SELECT count(*) FROM session')).rows[0].count, '0');
  assert.equal((await db.query('SELECT count(*) FROM account')).rows[0].count, '0');
  assert.equal((await call('/api/account', undefined, cookie4)).statusCode, 401);
  // A caller changing IP cannot bypass the identity limit.
  for (let n = 0; n < 4; n++) {
   const identityLimited = await app.inject({ method: 'POST', url: '/api/auth/request-password-reset',
    headers: { origin }, remoteAddress: `127.0.1.${n + 1}`,
    payload: { email: 'missing@example.com', redirectTo: `${origin}/reset-password` } });
   assert.equal(identityLimited.statusCode, n < 3 ? 200 : 429);
  }
  const rawKeys = await db.query('SELECT key FROM account_throttle');
  assert.ok(rawKeys.rows.every(row => /^[a-f0-9]{64}$/.test(row.key)));
  // Auth rate limit is durable in the DB, not a disabled or memory-only setting.
  for (let n = 0; n < 5; n++) await call('/api/auth/sign-in/username', { username: 'missing', password: 'wrong-password-123' });
  assert.equal((await call('/api/auth/sign-in/username', { username: 'missing', password: 'wrong-password-123' })).statusCode, 429);
 } finally {
  await app.close();
  await db.end();
  await pool.query(`DROP DATABASE "${schema}"`);
  await pool.end();
 }
});
