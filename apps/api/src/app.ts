import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Pool } from 'pg';
import { createAccountAuth } from './auth.js';
import { registerAccountRoutes } from './account-routes.js';
import { sandboxStripe, registerBilling } from './billing.js';

export async function createApp(env: NodeJS.ProcessEnv = process.env) {
 const app = Fastify({ logger: { level: 'info', serializers: { req: () => ({}), res: () => ({}) } },
  disableRequestLogging: true, bodyLimit: 32768, trustProxy: false });
 const customer = env.CUSTOMER_RELEASE_ENABLED === 'true';
 app.setErrorHandler((_error, request, reply) => {
  app.log.error({ event: 'api_failure', requestId: request.id, status: 503 }, 'API operation failed');
  return reply.code(503).send({ error: 'Service temporarily unavailable. Please retry.' });
 });
 app.addHook('onRequest', async (_request, reply) => {
  reply.header('X-Robots-Tag','noindex, nofollow').header('Cache-Control','no-store')
   .header('Referrer-Policy','no-referrer').header('Content-Security-Policy',"frame-ancestors 'none'");
 });
 app.get('/api/status', async () => ({ mode: customer ? 'customer' : 'review', customerReleaseEnabled: customer }));
 if (!customer) {
  app.addHook('onRequest', async (request, reply) => {
   if (request.url.startsWith('/api/') && request.url.split('?')[0] !== '/api/status') return reply.code(503).send({ error: 'Customer release is blocked; no account or payment data is accepted.' });
  });
  app.get('/health', async () => ({ status: 'ok', mode: 'review' }));
  app.all('/api/*', async (_request, reply) => reply.code(503).send({ error: 'Customer release is blocked; no account or payment data is accepted.' }));
  return app;
 }
 const needed = (name: string) => { const value = env[name]; if (!value) throw new Error(`${name} is required`); return value; };
 if (needed('DURABLE_DATABASE_CONFIRMED') !== 'true') throw new Error('Isolated durable database capacity must be verified');
 const stripe = sandboxStripe(needed('STRIPE_SECRET_KEY'));
 const webhookSecret = needed('STRIPE_WEBHOOK_SECRET');
 if (!webhookSecret.startsWith('whsec_')) throw new Error('Signed webhook configuration is required');
 const origin = needed('APP_ORIGIN');
 const pool = new Pool({ connectionString: needed('DATABASE_URL'), max: 5,
  ssl: env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined });
 await app.register(cors, { origin, credentials: true, methods: ['GET','POST'], allowedHeaders: ['Content-Type'] });
 const auth = createAccountAuth(pool, { origin, secret: needed('BETTER_AUTH_SECRET'), productName: 'Dispatch Check',
  resendApiKey: needed('RESEND_API_KEY'), emailFrom: needed('EMAIL_FROM'), supportEmail: needed('SUPPORT_EMAIL'),
  beforeDelete: async userId => {
   const pending = await pool.query("SELECT session_id FROM customer_order WHERE user_id=$1 AND status='pending'", [userId]);
   for (const row of pending.rows) {
    const checkout = await stripe.checkout.sessions.retrieve(row.session_id);
    if (checkout.status === 'open') await stripe.checkout.sessions.expire(checkout.id);
   }
  } });
 await registerAccountRoutes(app, auth, pool, origin, async userId => {
  const orders = await pool.query('SELECT id,status,paid_at,expires_at,created_at FROM customer_order WHERE user_id=$1', [userId]);
  return { orders: orders.rows };
 }, needed('BETTER_AUTH_SECRET'));
 await registerBilling(app, pool, auth, stripe, origin, webhookSecret);
 app.get('/health', async (_request, reply) => { try { await pool.query('SELECT 1'); return { status:'ok',mode:'customer' }; }
  catch { return reply.code(503).send({ status:'unavailable' }); } });
 app.addHook('onClose', async () => pool.end());
 return app;
}
