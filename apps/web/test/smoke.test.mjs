import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('landing page includes a form and API submission path', () => {
  const source = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
  assert.match(source, /<form onSubmit={submit}>/);
  assert.match(source, /\/api\/waitlist/);
});
