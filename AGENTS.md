# Idea-to-MVP agent contract

Ideation includes the billing TODO in `docs/pipeline.md`. Choose and document how customers pay (subscription, credits, pay per use, one-time purchase, or a justified hybrid) in `requirements/mvp.md` before implementation. Include the billable unit, pricing hypothesis, free limits, entitlements, applicable lifecycle/failure/refund rules, and observable tests. Do not assume every MVP uses subscriptions.

Read `requirements/idea.json` and `requirements/mvp.md` before changing the app. If the idea brief still contains placeholders, select the opportunity and complete the requirements from the research report before building domain features. Follow `docs/pipeline.md`: idea selection, the requirement brief, implementation, and configured deployment do not require founder approval. Record assumptions and decisions for review after deployment. If evidence does not support a build, choose and document the appropriate validation experiment or unresolved research gate without inventing demand.

Preserve the selected buyer, trigger, input, accepted output, and measurable acceptance criteria. Keep the first version to one narrow end-to-end task. Implement the domain flow in `apps/web` and `apps/api`, replace the demo waitlist, add only the tables needed, and keep `/health` working. Keep credentials in environment variables. Do not add paid services by default.

Run the requirements validator and build checks. Update `requirements/mvp.md` with the actual API contract, data model, test cases, deployment variables, and manual review steps. Record unresolved buyer or compliance assumptions; do not invent customer validation.

The research stage uses `prompts/commercial-opportunity-research.txt`. Do not run that long research automatically on every code change. Research and code generation require an authorized AI runtime; GitHub Actions CI only validates deterministic work.

Keep this checkout at `~/projects/mvp-ideas/idea-to-mvp-template`. Create each selected idea as a separate sibling checkout at `~/projects/mvp-ideas/<idea-slug>` from the public GitHub template. Do not implement an idea in this template checkout. Use a unique `<idea-slug>.nex2i.com` Netlify domain for each deployed MVP.

## Founder standards for every new MVP

Read `docs/mvp-runbook.md` before planning implementation. Every requested full run targets a customer-ready MVP; do not substitute a disposable demo or waive the template auth/email/persistence/backup/release gates. Every idea uses SEO-led organic discovery with no ads. Evaluate organic intent and competing results before selection, and implement/test SEO in the initial build. Always use separate Nex2i GitHub repos, the existing Netlify account, Ryan's Render workspace, and unique `<idea-slug>.nex2i.com` domains. Verify provider access early, handle credential responses without printing secrets, track exact billing test sessions and cleanup, and maintain one verification ledger. Configure an actual CI gate before production deployment. Missing access or durable-resource budget is a concrete blocker; it does not authorize alternate hosting or a lower release standard.

## Novelty across repeated runs

Before research read `docs/novelty-registry.md`, start a uniquely seeded run and consult the shared `~/projects/mvp-ideas/mvp-registry.json`. Novelty means a distinct buyer task, not a new name. Restart discovery if the selected decision duplicates an implemented MVP or active reservation. Reserve it atomically before provisioning, then record implementation and actual release status. Do not bypass a missing/locked registry or reset it per run. Five daily runs is supported as an invocation pattern, not a request to create a schedule or lower research/customer-ready standards.

## Portfolio after implementation

Read `docs/portfolio-publishing.md`. Each implemented MVP must be upserted into the existing `nex2i-landing` portfolio with an iframe preview and accessible modal opening a larger deployed public preview, plus a direct app link. Resolve the real target and parent origin rather than creating a replacement. Verify restrictive framing headers, actual iframe render and modal/mobile/keyboard behavior; publish using the portfolio's current workflow and record registry metadata. Missing portfolio access or blocked framing is unfinished pipeline work.
