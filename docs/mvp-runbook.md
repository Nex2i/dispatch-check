# Customer-ready MVP execution runbook

Founder defaults confirmed October 3, 2026. These apply to every idea-to-MVP run unless the founder explicitly changes them. Research-only requests still stop at research deliverables.

## Outcome and boundaries

Always target a customer-ready MVP implementing one narrow buyer task. A commercially unvalidated product can be technically customer-ready; do not confuse those judgments. A selected paid-validation experiment still requires the customer-ready implementation. Never substitute an anonymous disposable demo to declare the pipeline complete. If required access, budget or implementation is missing, finish independent work and report the specific release blocker and remaining work.

Customer readiness includes the template's implemented and deployed signup, verified email, login, password recovery, logout and session-revocation flows; isolated durable customer/order data; recovery and deletion/export where applicable; operational monitoring, safe logs, support path, backup and restore verification; buyer-task and payment failure handling. Do not call specified-but-unimplemented scaffold features reusable integrations. Founder review remains pending until feedback; it does not excuse missing automated release checks. Market demand and pricing remain unvalidated until buyer evidence exists.

Existing approved service capacity may be reused, but these instructions do not authorize unspecified new spending, live charges, outreach or sensitive-data collection. Sandbox verification is required for first founder review; enabling live commerce needs appropriate live account configuration and authorization. If real purchases cannot safely work yet, record the billing launch gate rather than claiming a customer-ready paid launch. Expiring unclaimed sandboxes and expiring unbacked databases do not meet durable release requirements.

## Organic SEO is the acquisition model

All ideas use SEO-led organic discovery. No ads, paid acquisition assumptions or advertising pixels. Treat organic discoverability as a major selection criterion under the distribution/access rubric, not a feature appended after building. Preserve the frozen weights unless explicitly changing and reranking them.

Before choosing finalists, research buyer search intent, relevant queries, current organic results and adequate competing answers/tools. Explain why the proposed tool or content could satisfy a specific intent better and lead to the buyer task. Document sources and overlap. Do not invent search volume, attainable rankings, traffic, conversions or CAC; mark those unknown when unmeasured. Reject or hold candidates whose credible acquisition requires advertising or a channel unsupported by the founder's constraints. Organic SEO still consumes founder content/maintenance time; include it in the five-hour workload scenarios. Pass this constraint to independent research agents and the skeptic before they rank candidates.

Freeze an initial SEO brief before implementation: primary buyer intent, checker/product page, a small set of useful supporting resources, page titles/URLs, internal links and activation event. Build substantial original content grounded in the actual task, such as a practical guide and synthetic downloadable template. Avoid bulk generic pages, unsupported benefit promises and fabricated reviews. Technical readiness is separate from channel validation.

Before delivery, verify on deployed URLs:
- Main product information is present in initial HTML through static rendering or prerendering, with working browser hydration. Read content with JavaScript disabled and retest the interactive task with JavaScript enabled.
- Unique descriptive titles/descriptions, one clear main H1, HTTPS self-referencing canonical URLs, crawlable internal links, appropriate social metadata and truthful structured data where useful.
- robots.txt allows public pages and required assets; sitemap.xml contains only canonical indexable public pages with correct content types. Private/account/payment-result/API pages stay out of search as appropriate. Serve noindex at the API origin for proxied responses; blocking crawl is not a substitute for an index-removal directive.
- Default hosting hostname and index.html aliases consolidate to the custom domain/clean paths without breaking checkout queries. Unknown routes return a real404, not an all-path200 SPA fallback. Implement legitimate app routes deliberately.
- Mobile usability and measured performance; record lab checks separately from field Core Web Vitals. Never claim field performance based on a screenshot or build.
- Use the founder's verified Google Search Console property; verify ownership if needed, submit the sitemap, inspect live rendered pages and record Google's selected canonical/indexing status when available. Check access early. Missing Search Console access is an explicit outstanding SEO handoff item; a sitemap or successful fetch is not proof of indexing or rankings. Indexing can require processing time and is not guaranteed.

## Fixed deployment profile and early access check

Use the same topology for every new idea:
- Public GitHub repo Nex2i/<idea-slug>, from ~/projects/mvp-ideas/idea-to-mvp-template; separate sibling checkout ~/projects/mvp-ideas/<idea-slug>.
- Netlify frontend in the existing Nex2i team/account (account ID655b9e3e503b490539766051), with its own site and unique https://<idea-slug>.nex2i.com domain.
- Render API and required durable managed storage in Ryan's Workspace, workspace IDtea-cspri7q3esus73am15g0. Same-origin /api proxy through Netlify; exact APP_ORIGIN/auth base and CORS_ORIGIN match the custom HTTPS hostname. Cookies stay host-only and secrets/customer populations stay isolated per MVP.

These are standing target selections; reuse them without asking again. Check availability/current account permissions early and ask only for a genuinely missing credential, unavailable target or required budget. Do not switch hosting provider, workspace, domain family or reuse another MVP's service, database or cookie secret. Provider plans must meet customer durability requirements; the previous free demo's expiring resources are not a launch standard. Keep previous service/site IDs as historical evidence, not defaults for new ideas.

In one early access check, inspect GitHub permissions, Netlify team/domain/build-env access, selected Render workspace and durable storage/backup capacity, isolated Stripe sandbox/credential path, transactional email domain and Search Console ownership. Continue independent research/implementation while resolving missing access. A connector connection does not prove it exposes API keys or every configuration field.

Netlify: set NETLIFY_PROXY_ORIGIN using the supported environment-variable mechanism, scope it to builds and the intended deploy contexts, then verify the generated proxy and deployed /api endpoints. Do not assume a legacy repository environment field supplies build variables. Inspect existing managed DNS records before adding custom records; avoid redundant CNAMEs. Netlify static _headers do not apply to proxied API responses, so required API headers originate on Render.

Render: preserve npm ci --include=dev for builds needing dev dependencies, correct workspace build/start commands, port binding and /health. Confirm the actual provider health-check configuration; an implemented endpoint or unapplied YAML is not proof the service uses it. Use current provider documentation when exact API/configuration syntax matters.

## Secrets and billing verification

Never print full credential-provisioning responses or rely on prefix-based regex redaction. Parse credential output in-process and print allowlisted non-secret metadata only. Store secrets in hosting variables or permission-restricted local files outside repos, pass them without shell interpolation or command-line exposure, and remove temporary CLI credential/debug artifacts. If exposure occurs, contain it and replace/revoke affected credentials where possible; deleting a scratch file alone is not revocation.

Select and specify billing before coding as already required by the skill. Use an isolated Stripe sandbox for testing. The connected Stripe account may be live; verify the account and mode before mutations and never run test provisioning or test payments against the live account merely because it is connected. Record ownership/claim status, expiry and cleanup; claimable sandbox expiry is a release blocker until addressed. Fulfillment must use authoritative payment status and idempotency, not checkout return parameters. Test applicable cancellation, decline, retry/replay, refunds, disputes and entitlement boundaries.

Keep a test record linking browser/test account → project/customer → exact checkout session → payment → refund. Refund/revoke the payment belonging to that browser rather than an arbitrary recent payment. Verify paid access activates only after confirmed payment, then verify revocation and continued free access where offered. Expire unused sessions and refund test payments when appropriate. Distinguish fixture-tested rules from actual provider interactions and elapsed-time scenarios.

## Verification and deploy gate

Maintain one verification ledger in the generated repo with criterion, evidence type, result (passed/failed/pending), command or manual steps, commit, provider/deployment IDs and timestamps where relevant. Reports and manual checklists link to that ledger rather than maintaining conflicting status summaries. Private evidence stays outside the public repo; public evidence contains no secrets or customer inputs.

Source-pattern tests and API injection are not browser coverage. Verify the deployed core task, downloads, stale-result invalidation, loading/error states, mobile rendering, authentication/email, billing and configured consented telemetry. Capture console/hydration errors. Mark unavailable browsers or provider scenarios pending rather than broadening a single engine's result into a cross-browser claim.

Production deployment must follow successful CI for the exact commit. Git connections and push-triggered auto-deploy alone do not enforce that. Configure provider CI gating when supported; otherwise disable independent production push deployment and trigger the exact tested revision after successful CI. Record the actual mechanism and SHA correspondence. Check the production artifact and core task after deployment; keep secrets out of CI logs. Do not claim a CI gate merely because CI eventually passed after publication.

Deliver the decision report, verified repo/app URLs, customer-release and SEO status, and numbered manual tests with prerequisites, expected outcomes and cleanup. Include unmeasured commercial assumptions and any remaining owner access tasks. Stop expanding desk research when further uncertainty needs real buyer evidence.

## Repeated runs and novelty

Read the novelty registry reference before research (`references/novelty-registry.md` in the skill, `docs/novelty-registry.md` in the template). Start a uniquely seeded run, exclude semantic overlaps with implemented MVPs and active reservations, restart discovery when the selected idea duplicates one, and atomically reserve the winner before creating repositories/domains/resources. Mark implemented products with honest release status and handoff IDs. Every invocation shares the founder registry; do not create a separate blank list for each run.

## Required portfolio publication

After implementation, add/upsert the MVP in the existing `nex2i-landing` project's portfolio with an iframe card preview, a modal containing the deployed public MVP preview and a direct Open app link. Read the portfolio publishing reference (`references/portfolio-publishing.md` in the skill, `docs/portfolio-publishing.md` in the template). Verify actual parent/child frame policy and deployed mobile/keyboard/modal behavior, publish via the existing portfolio project's workflow, and record the portfolio revision/deployment/verification on the shared registry entry. Missing access or failed framing leaves this required step unfinished.
