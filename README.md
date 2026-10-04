# Dispatch Check

A bounded experiment for spreadsheet-based field-service dispatchers. Check synthetic crew schedules for overlaps, buffer gaps and arrival-window exceptions. Customer release is blocked pending isolated durable infrastructure; the hosted review has no customer account/payment controls.

- Review: https://dispatch-check.nex2i.com/
- Decision: [docs/decision-report.md](docs/decision-report.md)
- Actual evidence: [docs/verification.md](docs/verification.md)
- Manual review: [docs/manual-test-checklist.md](docs/manual-test-checklist.md)
- Requirements/billing: [requirements/mvp.md](requirements/mvp.md)

`npm ci`, `npm test`, `npm run build`. Web defaults to synthetic review mode. Do not enable `VITE_CUSTOMER_ENABLED=true` or `CUSTOMER_RELEASE_ENABLED=true` until the customer gates and sandbox configuration pass. API review mode fails closed; health/status remain available. See API configuration for full local account setup. No schedule payload logging or AI.

Production is manually deployed only after exact-commit GitHub CI passes; no independent provider Git push deployment. Public portfolio preview allows only verified Nex2i parent origins.
