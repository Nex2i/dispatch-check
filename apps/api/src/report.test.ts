import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import Fastify from 'fastify';
import { registerReportRoutes } from './report.js';
import { SYNTHETIC_CSV } from './domain.js';
import type { AccountAuth } from './auth.js';

test('server/client checker sources stay byte-identical', async () => {
 assert.equal(await readFile(new URL('./domain.ts',import.meta.url),'utf8'),await readFile(new URL('../../web/src/domain.ts',import.meta.url),'utf8'));
});
test('paid packet enforces verified account, entitlement, origin, explicit processing consent and bounded complete review',async () => {
 const app = Fastify({logger:false});
 let account = false, paid = false;
 const auth = {api:{getSession:async () => account ? {user:{id:'synthetic-owner',emailVerified:true}} : null}} as unknown as AccountAuth;
 await registerReportRoutes(app,auth,'https://dispatch-check.nex2i.com',async () => paid ? new Date(Date.now()+60000) : null);
 const call = (csv=SYNTHETIC_CSV,consent=true,origin='https://dispatch-check.nex2i.com') => app.inject({method:'POST',url:'/api/report',headers:{origin},payload:{csv,dailyCapacityHours:8,consent}});
 try {
  assert.equal((await call()).statusCode,401);
  account=true;
  assert.equal((await call()).statusCode,402);
  paid=true;
  assert.equal((await call(SYNTHETIC_CSV,true,'https://attacker.example')).statusCode,403);
  assert.equal((await call(SYNTHETIC_CSV,false)).statusCode,400);
  const response=await call();assert.equal(response.statusCode,200,response.body);
  assert.match(response.json().issuesCsv,/CREW_OVERLAP/);assert.match(response.json().jobsCsv,/DEMO-101/);
  assert.equal((await call('bad,file\n1,2')).statusCode,422);
  assert.equal((await call(SYNTHETIC_CSV.replace('DEMO-101','person@example.com'))).statusCode,400);
  assert.equal((await call('x'.repeat(2*1024*1024+1))).statusCode,413);
 } finally {await app.close();}
});
