import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.js';
import { paymentDecision, sandboxStripe, applyEvent, type PaymentSnapshot } from './billing.js';
import { Pool } from 'pg';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import type Stripe from 'stripe';
import Fastify from 'fastify';
import { registerAccountRoutes } from './account-routes.js';
import { registerBilling } from './billing.js';
import type { AccountAuth } from './auth.js';
const now = 1800000000000;
const fixture: PaymentSnapshot = { sessionId:'cs_synthetic',userId:'synthetic-owner',orderId:randomUUID(),live:false,complete:true,paid:true,amount:1900,currency:'usd',product:'dispatch-check-30day',mode:'payment',amountReceived:1900,paymentIntentId:'pi_synthetic',paidAt:now/1000,fullyRefunded:false,disputed:false };

test('paid pass requires authoritative payment, fixed amount and test mode; refund/dispute terminal and expiry bounded', () => {
 assert.equal(paymentDecision(fixture,false,now).active,true);
 assert.equal(paymentDecision({...fixture,paid:false},false,now).active,false);
 assert.equal(paymentDecision({...fixture,complete:false},false,now).active,false);
 assert.equal(paymentDecision({...fixture,fullyRefunded:true},false,now).status,'revoked');
 assert.equal(paymentDecision({...fixture,disputed:true},false,now).status,'revoked');
 assert.equal(paymentDecision(fixture,true,now).active,false);
 assert.equal(paymentDecision(fixture,false,now+30*86400000).active,false);
 assert.throws(() => paymentDecision({...fixture,amount:1}),/configuration/);
 assert.throws(() => paymentDecision({...fixture,product:'other'}),/configuration/);
 assert.throws(() => paymentDecision({...fixture,amountReceived:0}),/configuration/);
 assert.throws(() => paymentDecision({...fixture,live:true}),/configuration/);
 assert.throws(() => sandboxStripe('sk_live_synthetic'),/prohibited/);
 assert.throws(() => sandboxStripe(''),/required/);
});
test('review mode accepts no account, webhook or payment inputs and needs no service credentials', async () => {
 const app = await createApp({});
 try {
  assert.equal((await app.inject('/health')).statusCode,200);
  assert.deepEqual((await app.inject('/api/status')).json(),{mode:'review',customerReleaseEnabled:false});
  for (const url of ['/api/auth/sign-up/email','/api/checkout','/api/billing/webhook','/api/account','/api/entitlement','/api/unknown']) {
   const response = await app.inject({method:'POST',url,payload:{email:'ignored@example.com'}});
   assert.equal(response.statusCode,503,url);
   assert.match(response.body,/no account or payment data is accepted/);
  }
  await assert.rejects(createApp({CUSTOMER_RELEASE_ENABLED:'true'}),/DURABLE_DATABASE_CONFIRMED/);
  await assert.rejects(createApp({CUSTOMER_RELEASE_ENABLED:'true',DURABLE_DATABASE_CONFIRMED:'true',STRIPE_SECRET_KEY:'sk_live_synthetic'}),/prohibited/);
 } finally { await app.close(); }
});
test('Stripe signature verification rejects tampering; fixture only, no provider interaction', () => {
 const stripe = sandboxStripe('sk_test_synthetic');
 const payload = JSON.stringify({id:'evt_synthetic',object:'event',livemode:false,type:'checkout.session.completed',data:{object:{id:'cs_synthetic'}}});
 const secret = 'whsec_synthetic';
 const header = stripe.webhooks.generateTestHeaderString({payload,secret});
 assert.equal(stripe.webhooks.constructEvent(payload,header,secret).id,'evt_synthetic');
 assert.throws(() => stripe.webhooks.constructEvent(payload+' ',header,secret));
});
test('PostgreSQL fulfillment transaction is idempotent, owner-bound and cannot regrant after refund', {skip:!process.env.TEST_DATABASE_URL},async () => {
 const admin = new Pool({connectionString:process.env.TEST_DATABASE_URL});
 const name = `billing_test_${Date.now()}`;
 await admin.query(`CREATE DATABASE "${name}"`);
 const url = new URL(process.env.TEST_DATABASE_URL!);url.pathname=name;
 const pool = new Pool({connectionString:url.toString()});
 try {
  await pool.query(await readFile(new URL('../migrations/schema.sql',import.meta.url),'utf8'));
  await pool.query('INSERT INTO "user" (id,name,email) VALUES ($1,$2,$3)',[fixture.userId,'Synthetic','synthetic@example.com']);
  await pool.query("INSERT INTO customer_order(id,user_id,session_id,status) VALUES($1,$2,$3,'pending')",[fixture.orderId,fixture.userId,fixture.sessionId]);
  const event = (id:string) => ({id,type:'checkout.session.completed',livemode:false} as Stripe.Event);
  assert.equal((await applyEvent(pool,event('evt_first'),{...fixture,paid:false})).duplicate,false);
  assert.equal((await pool.query('SELECT status FROM customer_order')).rows[0].status,'pending');
  await applyEvent(pool,event('evt_paid'),fixture);
  assert.equal((await pool.query('SELECT status FROM customer_order')).rows[0].status,'paid');
  assert.equal((await applyEvent(pool,event('evt_paid'),fixture)).duplicate,true);
  await applyEvent(pool,event('evt_refund'),{...fixture,fullyRefunded:true});
  await applyEvent(pool,event('evt_stale_paid'),fixture);
  assert.equal((await pool.query('SELECT status FROM customer_order')).rows[0].status,'revoked');
  await assert.rejects(applyEvent(pool,event('evt_wrong_owner'),{...fixture,userId:'other'}),/reconciliation/);
  assert.equal((await pool.query("SELECT count(*) FROM billing_event WHERE id='evt_wrong_owner'")).rows[0].count,'0');
  await pool.query('DELETE FROM "user" WHERE id=$1',[fixture.userId]);
  assert.equal((await pool.query('SELECT count(*) FROM customer_order')).rows[0].count,'0');
 } finally {await pool.end();await admin.query(`DROP DATABASE "${name}"`);await admin.end();}
});

test('signed webhook raw bytes pass without browser Origin, invalid signatures reject', async () => {
 const app = Fastify({ logger: false });
 const pool = new Pool();
 const auth = {} as AccountAuth;
 const stripe = sandboxStripe('sk_test_synthetic');
 const origin = 'https://dispatch-check.nex2i.com';
 const secret = 'whsec_synthetic';
 await registerAccountRoutes(app,auth,pool,origin,undefined,'synthetic-pepper-longer-than-thirty-two-characters');
 await registerBilling(app,pool,auth,stripe,origin,secret);
 const payload = JSON.stringify({id:'evt_origin_test',object:'event',livemode:false,type:'irrelevant.fixture',data:{object:{id:'synthetic'}}});
 const signature = stripe.webhooks.generateTestHeaderString({payload,secret});
 try {
  const valid = await app.inject({method:'POST',url:'/api/billing/webhook',headers:{'content-type':'application/json','stripe-signature':signature},payload});
  assert.equal(valid.statusCode,200,valid.body);
  assert.equal(valid.json().ignored,true);
  const invalid = await app.inject({method:'POST',url:'/api/billing/webhook',headers:{'content-type':'application/json','stripe-signature':'invalid'},payload});
  assert.equal(invalid.statusCode,400,invalid.body);
 } finally {await app.close();await pool.end();}
});
