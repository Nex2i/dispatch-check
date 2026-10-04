import { readFileSync } from 'node:fs';

const path = new URL('../requirements/idea.json', import.meta.url);
const idea = JSON.parse(readFileSync(path, 'utf8'));
const requiredStrings = ['name', 'buyer', 'trigger', 'accepted_output', 'purchase_reason', 'geography', 'decision_level', 'channel_hypothesis', 'seo_intent'];
const requiredArrays = ['inputs', 'acceptance_criteria', 'kill_conditions'];
const errors = [];

if (!['template', 'ready'].includes(idea.status)) errors.push('status must be template or ready');
for (const key of requiredStrings) {
  if (typeof idea[key] !== 'string' || !idea[key].trim()) errors.push(`${key} must be a non-empty string`);
  else if (idea.status === 'ready' && idea[key].toLowerCase().includes('replace with')) errors.push(`${key} is still a placeholder`);
}
for (const key of requiredArrays) {
  if (!Array.isArray(idea[key]) || idea[key].length === 0 || idea[key].some(x => typeof x !== 'string' || !x.trim())) errors.push(`${key} must contain a non-empty string`);
  else if (idea.status === 'ready' && idea[key].some(x => x.toLowerCase().includes('replace with'))) errors.push(`${key} still contains a placeholder`);
}
if (idea.release_target !== 'customer-ready MVP') errors.push('release_target must be customer-ready MVP');
if (idea.acquisition_model !== 'organic SEO only; no ads') errors.push('acquisition_model must be organic SEO only; no ads');
if (typeof idea.sensitive_data !== 'boolean') errors.push('sensitive_data must be boolean');
if (idea.status === 'ready' && idea.sensitive_data) errors.push('this template is not approved for sensitive customer data');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Requirements valid (${idea.status}).`);
