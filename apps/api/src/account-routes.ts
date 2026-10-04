import { createHmac } from 'node:crypto';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';
import type { Pool } from 'pg';
import type { AccountAuth } from './auth.js';

export function accountHeaders(request: FastifyRequest) {
  const headers = fromNodeHeaders(request.headers);
  // Never trust an IP header submitted by a caller. request.ip follows Fastify's configured proxy policy.
  headers.set('x-account-client-ip', request.ip);
  return headers;
}
export async function requireCustomer(auth: AccountAuth, request: FastifyRequest) {
  const session = await auth.api.getSession({ headers: accountHeaders(request) });
  return session?.user.emailVerified ? session : null;
}

export async function registerAccountRoutes(app: FastifyInstance, auth: AccountAuth, pool: Pool,
  origin: string, exportDomainData: (userId: string) => Promise<unknown> = async () => ({}), identityPepper = '') {
  if (identityPepper.length < 32) throw new Error('Account throttle pepper is required');
  app.addHook('onRequest', async (request, reply) => {
    reply.header('X-Robots-Tag', 'noindex, nofollow');
    reply.header('Cache-Control', 'no-store');
    reply.header('Referrer-Policy', 'no-referrer');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('Content-Security-Policy', "frame-ancestors 'none'");
    if ((request.url.startsWith('/api/auth/') || request.url.startsWith('/api/account')) && !['GET', 'HEAD', 'OPTIONS'].includes(request.method) && request.headers.origin !== origin) {
      return reply.code(403).send({ error: 'Request origin is not allowed.' });
    }
  });
  app.route({ method: ['GET', 'POST'], url: '/api/auth/*', handler: async (request, reply) => {
    // Always construct using configured public origin, never untrusted Host / forwarded-host.
    const url = new URL(request.url, origin);
    if (url.origin !== origin) return reply.code(400).send({ error: 'Invalid request URL.' });
    const operation = url.pathname.slice('/api/auth/'.length);
    const knownEvents: Record<string, string> = { 'sign-up/email': 'signup', 'sign-in/email': 'login',
      'sign-in/username': 'login', 'verify-email': 'email_verification', 'request-password-reset': 'recovery_request',
      'reset-password': 'password_reset', 'sign-out': 'logout', 'revoke-sessions': 'session_revocation',
      'delete-user': 'account_deletion', 'send-verification-email': 'verification_request' };
    const event = knownEvents[operation] ?? 'account_operation';
    const body = request.body as Record<string, unknown> | null;
    const identity = typeof body?.email === 'string' ? body.email.trim().toLowerCase() :
      typeof body?.username === 'string' ? body.username.trim().toLowerCase() : '';
    const actor = identity ? createHmac('sha256', identityPepper).update(identity).digest('hex').slice(0, 32) : undefined;
    if (actor && ['signup', 'login', 'recovery_request', 'verification_request'].includes(event)) {
      const max = event === 'login' ? 5 : 3;
      const windowMs = event === 'login' ? 60000 : 3600000;
      const bucket = Math.floor(Date.now() / windowMs);
      const key = createHmac('sha256', identityPepper).update(`${event}:${identity}:${bucket}`).digest('hex');
      const consumed = await pool.query(`INSERT INTO account_throttle (key, count, expires_at)
        VALUES ($1, 1, now() + ($2 * interval '1 millisecond'))
        ON CONFLICT (key) DO UPDATE SET count = account_throttle.count + 1 RETURNING count`, [key, windowMs]);
      if (consumed.rows[0].count > max) {
        app.log.info({ event, actor, requestId: request.id, status: 429 }, 'Account operation');
        return reply.header('Retry-After', Math.ceil(windowMs / 1000)).code(429).send({ error: 'Too many attempts. Please retry later.' });
      }
      // Remove expired pseudonymous buckets; raw addresses/passwords are never persisted here.
      await pool.query('DELETE FROM account_throttle WHERE expires_at < now()');
    }
    // Destructive deletion always requires the current password, even on a fresh session.
    if (url.pathname === '/api/auth/delete-user') {
      const password = (request.body as { password?: unknown } | null)?.password;
      if (typeof password !== 'string' || !password) return reply.code(400).send({ error: 'Current password is required.' });
    }
    try {
      const response = await auth.handler(new Request(url, { method: request.method,
        headers: accountHeaders(request),
        ...(request.body ? { body: JSON.stringify(request.body) } : {}) }));
      reply.code(response.status);
      response.headers.forEach((value, key) => { if (key !== 'set-cookie') reply.header(key, value); });
      const cookies = response.headers.getSetCookie();
      if (cookies.length) reply.header('set-cookie', cookies);
      // The audit record has only a route template and status; URLs may contain credential tokens.
      app.log.info({ event, actor, requestId: request.id, status: response.status }, 'Account operation');
      return reply.send(response.body ? await response.text() : null);
    } catch {
      app.log.error({ event, actor, requestId: request.id, status: 503 }, 'Account operation failed');
      return reply.code(503).send({ error: 'Account service is temporarily unavailable. Please retry.' });
    }
  } });
  app.get('/api/account', async (request, reply) => {
    const session = await requireCustomer(auth, request);
    if (!session) return reply.code(401).send({ error: 'Sign in with a verified account.' });
    return { id: session.user.id, name: session.user.name, email: session.user.email,
      username: session.user.username, emailVerified: session.user.emailVerified };
  });
  app.get('/api/account/export', async (request, reply) => {
    const session = await requireCustomer(auth, request);
    if (!session) return reply.code(401).send({ error: 'Sign in with a verified account.' });
    const user = await pool.query('SELECT id, name, email, "emailVerified", username, "createdAt", "updatedAt" FROM "user" WHERE id = $1', [session.user.id]);
    reply.header('Content-Disposition', 'attachment; filename="account-export.json"');
    return { exportedAt: new Date().toISOString(), account: user.rows[0], data: await exportDomainData(session.user.id) };
  });
}
