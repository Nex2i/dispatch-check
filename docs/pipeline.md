# Autonomous idea-to-MVP pipeline

For each requested run, the agent selects the idea, defines requirements, implements and verifies the MVP, deploys a customer-ready MVP, adds its iframe preview/modal to the Nex2i portfolio, then informs the founder. Read [the execution runbook](mvp-runbook.md) for the standing founder defaults and release gates. The founder manually tests the delivered result. Idea selection and the requirement brief are decisions delegated to the agent, not approval gates.

## Execution

1. Start a randomized run and read the shared MVP registry using [the novelty contract](novelty-registry.md). Research using `prompts/commercial-opportunity-research.txt` and the current founder context. Preserve dated sources, competing alternatives, skeptical review, and evidence quality. Run this stage for an opportunity search, not every code change.
2. Select the strongest supported opportunity and record why it won, the decision level, assumptions, and kill conditions. A paid-validation experiment may be the commercial decision; the implementation still must be customer-ready. Research SEO buyer intent and competing organic results as major distribution evidence; no ads. If no concrete experiment is supported, report the unresolved evidence gate or rejected set; do not manufacture demand to force a build.
3. Compare the decision against implemented MVPs and active reservations by buyer/task/input/output, not just name. If it overlaps, restart discovery with a new seed and exclusions. Atomically reserve a novel decision, then create a separate public Nex2i repo and sibling checkout at `~/projects/mvp-ideas/<idea-slug>`. Complete `requirements/idea.json` and `requirements/mvp.md` in that checkout. Keep research containing private material outside public repositories. Keep one buyer task with measurable acceptance criteria.
4. Implement the task in `apps/web` and `apps/api`, including the template customer-account and durable-release requirements and the initial SEO brief. Reuse the template's auth, email, billing, and telemetry when implemented and configured. Choose product scope, pricing hypotheses, free limits, and acceptance criteria without requesting founder permission; state the evidence and assumptions. A configured provider is not proof its app integration is implemented.
5. Run requirements validation, relevant tests, and builds. Check the deployed core task, SEO, required auth/email, selected billing, and configured telemetry behavior through MCP or CLI. Record what was actually exercised; never label untested browser behavior as passed.
6. Deploy only after successful CI for the exact revision, using Nex2i GitHub, the existing Netlify account and Ryan's Render workspace, with a unique `<idea-slug>.nex2i.com` domain and isolated secrets. Keep payments in Stripe sandbox/test mode for the founder's first review. Provision within the approved infrastructure and AI budget.
7. Register the implemented MVP and its honest release status in the shared list.
8. Add/upsert it in the existing `nex2i-landing` portfolio following [portfolio publishing](portfolio-publishing.md): working iframe preview, accessible modal with larger iframe and direct app link, compatible restricted framing headers, published browser verification, and registry publication metadata. This is required for pipeline completion.
9. Deliver a concise decision report, repository and deployment links, automated verification results, known gaps, and a manual test checklist with expected outcomes. Include test data prerequisites and cleanup. Record founder review as pending until feedback arrives, then resolve reported defects and update results.

## Ideation TODO: decide how billing works

Complete this before implementation. The agent selects the model autonomously and reports it in the founder handoff; subscriptions are one option, not the default for every idea.

- [ ] Compare subscription, prepaid credits, pay per use, one-time purchase, and a hybrid only when justified. Match the model to purchase frequency, buyer value, accepted output, predictability, and delivery cost. Record the choice and rejected alternatives.
- [ ] Define the payer and billable unit (account, seat, completed task, report, credit, or consumption). State when it becomes billable and how failed, retried, or duplicate work is handled.
- [ ] Set a pricing hypothesis, currency, interval, estimated unit cost and margin, and any minimum spend or cap. Record supporting evidence; proposed prices remain unvalidated until tested with buyers.
- [ ] Define free/trial limits, activation event, upgrade trigger, paid entitlements, and whether payment precedes work or follows measured usage. Make charges and limits visible to users.
- [ ] Specify rules for the selected model: subscription renewal, included allowances/reset timing, overages and cancellation; credit purchase, reservation/debit, expiry, rollover and insufficient balance; pay-per-use metering, settlement and caps; or one-time fulfillment and repeat purchases. Define failed payment/work, access revocation, refunds, and disputes. Mark unrelated rules not applicable.
- [ ] Map the selected model to payment objects, authoritative entitlement/usage/credit records where needed, and idempotent payment/fulfillment updates. Record checkout and billing-management UX, configuration, and observable sandbox tests in `requirements/mvp.md` before coding.

## Access and operating boundaries

Prefer MCP or CLI. If required access or secrets are missing, ask for that access and stop the dependent operation. This is an access blocker, not a request for idea approval. Do not request permission again for actions already authorized in the session.

Existing approved service capacity is available; customer-ready durability must be established, not inferred from a free-tier demo. Expiring databases without backups are not a release option. New paid infrastructure or AI spending requires an approved budget. This workflow does not authorize customer outreach, live charges, or collection of sensitive customer data. Every completed MVP requires the persistence and customer-release requirements in `requirements/template-requirements.md`.

This file defines how an authorized run behaves. It does not start recurring runs or install an unattended cloud AI runtime. GitHub Actions currently performs deterministic checks; research and coding need an authorized AI runtime.

## Manual review handoff

For each generated MVP include:

- Selected buyer, trigger, inputs, accepted output, selection evidence, rejected alternatives, and commercial assumptions.
- Implemented scope, pricing hypothesis, plan limits, architecture choices, operating costs, and unresolved requirements.
- Repo, app URL, published portfolio entry/preview/modal evidence, SEO/Search Console status, and one linked verification ledger with actual automated test/deployment results.
- Numbered manual steps with expected outcomes for the buyer task, required signup/verification/login/reset/logout, sandbox upgrade/billing/cancellation, failure states, and analytics consent.
- Any unexercised flow clearly marked pending manual verification; founder feedback and results recorded after review.
