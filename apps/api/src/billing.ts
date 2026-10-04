import { registerReportRoutes } from './report.js';
import Stripe from 'stripe';
import { randomUUID, randomBytes } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import type { FastifyInstance } from 'fastify';
import { requireCustomer } from './account-routes.js';
import type { AccountAuth } from './auth.js';

export const PASS_AMOUNT = 1900;
export const PASS_SECONDS = 30 * 24 * 60 * 60;
export type PaymentSnapshot = { sessionId: string; userId: string; orderId: string; live: boolean; complete: boolean;
 paid: boolean; amount: number; currency: string; product: string; mode: string; amountReceived: number; paymentIntentId: string | null;
 paidAt: number | null; fullyRefunded: boolean; disputed: boolean };
export function paymentDecision(snapshot: PaymentSnapshot, revoked = false, now = Date.now()) {
 if (snapshot.live || snapshot.amount !== PASS_AMOUNT || snapshot.currency !== 'usd' || snapshot.product !== 'dispatch-check-30day' || snapshot.mode !== 'payment' || (snapshot.paid && snapshot.amountReceived !== PASS_AMOUNT)) throw new Error('Payment configuration mismatch');
 if (revoked || snapshot.fullyRefunded || snapshot.disputed) return { status: 'revoked', expiresAt: null, active: false };
 if (!snapshot.complete || !snapshot.paid || !snapshot.paidAt || !snapshot.paymentIntentId) return { status: 'pending', expiresAt: null, active: false };
 const expiresAt = new Date((snapshot.paidAt + PASS_SECONDS) * 1000);
 return { status: 'paid', expiresAt, active: expiresAt.getTime() > now };
}
export function sandboxStripe(key: string) {
 if (!/^(sk|rk)_test_/.test(key)) throw new Error('An isolated sandbox test Stripe key is required; live keys are prohibited');
 return new Stripe(key, { apiVersion: '2026-08-26.dahlia', maxNetworkRetries: 2, timeout: 10000 });
}
export async function paymentSnapshot(stripe: Stripe, sessionId: string): Promise<PaymentSnapshot> {
 const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['payment_intent.latest_charge'] });
 const intent = typeof session.payment_intent === 'object' ? session.payment_intent : null;
 const charge = intent && typeof intent.latest_charge === 'object' ? intent.latest_charge : null;
 return { sessionId: session.id, userId: session.metadata?.user_id ?? '', orderId: session.metadata?.order_id ?? '',
  live: session.livemode, complete: session.status === 'complete', paid: session.payment_status === 'paid' && intent?.status === 'succeeded',
  amount: session.amount_total ?? 0, currency: session.currency ?? '', product: session.metadata?.product ?? '', mode: session.mode, amountReceived: intent?.amount_received ?? 0, paymentIntentId: intent?.id ?? null,
  paidAt: charge?.created ?? null, fullyRefunded: Boolean(charge?.refunded || (charge && charge.amount_refunded >= charge.amount)),
  disputed: Boolean(charge?.disputed) };
}
export async function applySnapshot(connection: PoolClient, snapshot: PaymentSnapshot) {
 await connection.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`billing-user:${snapshot.userId}`]);
 const existing = await connection.query('SELECT * FROM customer_order WHERE session_id = $1 FOR UPDATE', [snapshot.sessionId]);
 const row = existing.rows[0];
 // Checkout must have been initiated by this application and this account. Never create an order from a webhook.
 if (!row || row.user_id !== snapshot.userId || row.id !== snapshot.orderId) throw new Error('Payment ownership mismatch');
 const decision = paymentDecision(snapshot, row.status === 'revoked');
 await connection.query(`UPDATE customer_order SET status=$1,payment_intent_id=$2,paid_at=$3,expires_at=$4,updated_at=now() WHERE id=$5`,
  [decision.status, snapshot.paymentIntentId, snapshot.paidAt ? new Date(snapshot.paidAt * 1000) : null, decision.expiresAt, row.id]);
 return decision;
}
export async function applyEvent(pool: Pool, event: Stripe.Event, snapshot: PaymentSnapshot) {
 if (event.livemode) throw new Error('Live events are prohibited');
 const connection = await pool.connect();
 try {
  await connection.query('BEGIN');
  const inserted = await connection.query('INSERT INTO billing_event (id,type) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING RETURNING id', [event.id, event.type]);
  if (inserted.rowCount) await applySnapshot(connection, snapshot);
  await connection.query('COMMIT');
  return { received: true, duplicate: !inserted.rowCount };
 } catch { await connection.query('ROLLBACK'); throw new Error('Payment reconciliation failed'); }
 finally { connection.release(); }
}

export async function registerBilling(app: FastifyInstance, pool: Pool, auth: AccountAuth, stripe: Stripe, origin: string, webhookSecret: string) {
 const activePass = async (userId: string) => {
  const orders = await pool.query("SELECT session_id FROM customer_order WHERE user_id=$1 AND status='paid' AND expires_at>now()", [userId]);
  let expiresAt: Date | null = null;
  for (const row of orders.rows) {
   const snapshot = await paymentSnapshot(stripe, row.session_id);
   const connection = await pool.connect();
   try { await connection.query('BEGIN'); const decision = await applySnapshot(connection, snapshot); await connection.query('COMMIT');
    if (decision.active && decision.expiresAt) expiresAt = decision.expiresAt;
   } catch { await connection.query('ROLLBACK'); throw new Error('Pass status unavailable'); } finally { connection.release(); }
  }
  return expiresAt;
 };
 await registerReportRoutes(app, auth, origin, activePass);
 app.get('/api/entitlement', async (request, reply) => {
  const session = await requireCustomer(auth, request);
  if (!session) return reply.code(401).send({ error: 'Sign in with a verified account.' });
  const expiresAt = await activePass(session.user.id);
  return { active: Boolean(expiresAt), expiresAt, canExport: Boolean(expiresAt), maxRows: expiresAt ? 2000 : 25 };
 });
 app.post('/api/checkout', async (request, reply) => {
  if (request.headers.origin !== origin) return reply.code(403).send({ error: 'Request origin is not allowed.' });
  const session = await requireCustomer(auth, request);
  if (!session) return reply.code(401).send({ error: 'Sign in with a verified account.' });
  if (await activePass(session.user.id)) return reply.code(409).send({ error: 'Your pass is already active.' });
  const connection = await pool.connect();
  try {
   await connection.query('BEGIN');
   await connection.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`billing-user:${session.user.id}`]);
   const active = await connection.query("SELECT id FROM customer_order WHERE user_id=$1 AND status='paid' AND expires_at>now()", [session.user.id]);
   if (active.rowCount) { await connection.query('ROLLBACK'); return reply.code(409).send({ error: 'Your pass is already active.' }); }
   const pending = await connection.query("SELECT id,session_id FROM customer_order WHERE user_id=$1 AND status='pending' ORDER BY created_at DESC LIMIT 1", [session.user.id]);
   if (pending.rowCount) {
    const checkout = await stripe.checkout.sessions.retrieve(pending.rows[0].session_id);
    if (checkout.status === 'open' && checkout.url) { await connection.query('COMMIT'); return { url: checkout.url }; }
    if (checkout.status === 'complete') { await connection.query('ROLLBACK'); return reply.code(409).send({ error: 'Payment is reconciling. Please refresh your pass status.' }); }
   }
   const orderId = randomUUID();
   const suffix = [...randomBytes(8)].map(n => String.fromCharCode(97 + n % 26)).join('');
   const checkout = await stripe.checkout.sessions.create({ mode: 'payment', client_reference_id: session.user.id,
    customer_email: session.user.email, integration_identifier: `dispatch_check_${suffix}`,
    line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: PASS_AMOUNT,
     product_data: { name: 'Dispatch Check — nonrenewing 30-day pass' } } }],
    metadata: { user_id: session.user.id, order_id: orderId, product: 'dispatch-check-30day' },
    success_url: `${origin}/account/?checkout=returned`, cancel_url: `${origin}/pricing/?checkout=cancelled`,
    expires_at: Math.floor(Date.now() / 1000) + 3600 }, { idempotencyKey: `checkout:${orderId}` });
   if (checkout.livemode || !checkout.url) throw new Error('Invalid sandbox Checkout');
   await connection.query('INSERT INTO customer_order (id,user_id,session_id,status) VALUES ($1,$2,$3,$4)', [orderId,session.user.id,checkout.id,'pending']);
   await connection.query('COMMIT');
   return { url: checkout.url };
  } catch { await connection.query('ROLLBACK'); return reply.code(503).send({ error: 'Checkout is temporarily unavailable. No access was granted.' }); }
  finally { connection.release(); }
 });
 // Encapsulated raw parser: only the signed webhook receives unmodified bytes.
 await app.register(async scoped => {
  scoped.removeContentTypeParser('application/json');
  scoped.addContentTypeParser('application/json', { parseAs: 'buffer' }, (_request, body, done) => done(null, body));
  scoped.post('/api/billing/webhook', async (request, reply) => {
   let event: Stripe.Event;
   try { event = stripe.webhooks.constructEvent(request.body as Buffer, request.headers['stripe-signature'] as string, webhookSecret); }
   catch { return reply.code(400).send({ error: 'Invalid payment signature.' }); }
   if (event.livemode) return reply.code(400).send({ error: 'Live events are prohibited.' });
   const supported = ['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired','charge.refunded','charge.dispute.created','charge.dispute.updated','charge.dispute.closed'];
   if (!supported.includes(event.type)) return { received: true, ignored: true };
   const object = event.data.object as unknown as { id: string; payment_intent?: string; charge?: string };
   let sessionId: string | undefined;
   if (event.type.startsWith('checkout.session.')) sessionId = object.id;
   else {
    let intentId = object.payment_intent;
    if (!intentId && object.charge) { const charge = await stripe.charges.retrieve(object.charge); intentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id; }
    if (intentId) sessionId = (await pool.query('SELECT session_id FROM customer_order WHERE payment_intent_id=$1', [intentId])).rows[0]?.session_id;
    // Refund/dispute may beat checkout completion: find originating Checkout by the authoritative intent.
    if (!sessionId && intentId) sessionId = (await stripe.checkout.sessions.list({ payment_intent: intentId, limit: 1 })).data[0]?.id;
   }
   if (!sessionId) return { received: true, ignored: true };
   const owned = await pool.query('SELECT id FROM customer_order WHERE session_id=$1', [sessionId]);
   if (!owned.rowCount) return { received: true, ignored: true };
   // Current provider state, not the signed event's stale snapshot, controls fulfillment/revocation.
   return applyEvent(pool, event, await paymentSnapshot(stripe, sessionId));
  });
 });
}
