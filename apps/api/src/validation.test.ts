import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeEmail } from './validation.js';

test('normalizes usable email input', () => {
  assert.equal(normalizeEmail('  TEST@Example.com '), 'test@example.com');
});

test('rejects malformed input', () => {
  assert.equal(normalizeEmail('not-an-email'), null);
  assert.equal(normalizeEmail(null), null);
});
