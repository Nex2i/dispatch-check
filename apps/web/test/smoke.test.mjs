import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,existsSync} from 'node:fs';
const dist=new URL('../dist/',import.meta.url);
test('prerendered pages contain task content, one H1 and their own canonical',()=>{
 for(const path of ['','guide/','templates/','pricing/','privacy/','portfolio-preview/']){
  const html=readFileSync(new URL(path+'index.html',dist),'utf8');
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  assert.ok(html.includes(`https://dispatch-check.nex2i.com/${path}`));
  assert.ok(html.includes('Customer launch pending'));
  assert.ok(!html.includes('type="file"'));
  assert.ok(!html.includes('Local account testing'));
 }
});
test('review deployment blocks API and unknown routes without universal SPA fallback',()=>{
 const redirects=readFileSync(new URL('_redirects',dist),'utf8');assert.match(redirects,/\/api\/\* \/release-unavailable.json 503!/);assert.match(redirects,/\/\* \/404.html 404/);assert.ok(!redirects.includes('/index.html 200'));
 const headers=readFileSync(new URL('_headers',dist),'utf8');assert.match(headers,/frame-ancestors 'self' https:\/\/nex2i.com https:\/\/www.nex2i.com/);assert.match(headers,/X-Frame-Options: DENY/);assert.match(headers,/X-Robots-Tag: noindex, nofollow/);
});
test('sitemap has only canonical public product resources and no preview or API',()=>{
 const xml=readFileSync(new URL('sitemap.xml',dist),'utf8');assert.ok(xml.includes('/guide/'));assert.ok(xml.includes('/templates/'));assert.ok(!xml.includes('portfolio-preview'));assert.ok(!xml.includes('/api/'));assert.ok(existsSync(new URL('404.html',dist)));
});
