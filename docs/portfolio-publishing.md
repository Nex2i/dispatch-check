# Required Nex2i portfolio publication

Founder instruction: after implementation, every MVP is added to the existing `nex2i-landing` project portfolio with an iframe preview and a modal that opens the MVP. This is part of pipeline completion, not an optional follow-up.

## Resolve and preserve the existing project

Locate the exact `nex2i-landing` checkout/repository or Site and read its AGENTS.md, existing portfolio data model, modal components and deployment instructions before editing. Reuse its current design and hosting; do not create a replacement landing project or migrate it to the MVP stack. Resolve the production portfolio URL and allowed parent origins early. Confirmed target: local checkout `/Users/ryan/Documents/ChatGPT/AI Explorer Quick Projects/nex2i-landing`, repository https://github.com/Nex2i/nex2i-landing, production https://nex2i.com/ (www redirects to canonical), Netlify site `107a9241-116d-4fa0-bcb5-3cd6aebb86b5` in the existing Nex2i team. It is static HTML/CSS/JavaScript; `dist/index.html` is the source/output, `portfolio.json` contains registry-keyed entries, and `node scripts/build-portfolio.mjs` renders card markup between portfolio markers. The shared native dialog is already implemented. GitHub checks require regenerated HTML to match the commit; publish through its existing Netlify CLI workflow after checks pass. Use exact parent origins https://nex2i.com and https://www.nex2i.com. Read README.md and any AGENTS.md at execution time in case its structure changes.

Use an isolated branch/worktree for each portfolio update, refresh from the latest shared main and upsert only the owned entry. Do not overwrite another agent's concurrent working files or stale portfolio data.

The founder authorizes portfolio additions as part of each requested full MVP run; do not ask again for ordinary entry updates or configured publishing. Missing target access is an operating blocker, not permission to skip the step. Continue independent MVP work while obtaining it.

## Entry and preview UX

Upsert a portfolio entry keyed by the shared MVP registry entry ID or stable unique slug. Use the existing project's schema/components. Include the real name, concise buyer/task description, current release status, app URL and repository link if appropriate; never add fabricated adoption, testimonials or customer-ready claims. An implemented demo or release-blocked product must be labeled honestly. Preserve all other portfolio entries.

The card/entry contains a lazy-loaded iframe preview with a descriptive title, stable aspect ratio and responsive layout. A clearly labeled button opens an accessible modal containing a larger iframe of the deployed public product/preview route. Include a prominent Open app link to the canonical MVP URL, so authentication, downloads and Checkout flows can operate outside the frame when needed. Use the existing modal system with keyboard activation, focus management, Escape/close button, focus restoration and mobile sizing. Avoid loading every full app at once as the portfolio grows.

Use a dedicated anonymous public preview route with demo/synthetic inputs and no account/payment-status fetches or checkout controls. Keep the full app behind its existing framing protection; do not remove a global DENY policy just to enable the public preview. Do not embed private account pages, credentials, session tokens, personal/customer data or actual payment pages. Give iframe content the capabilities required for the intended public interaction; do not add unrestricted top-navigation. Display a useful loading/unavailable state plus the direct app link. A screenshot-only fallback does not satisfy the requested working iframe preview unless the founder explicitly changes the requirement.

## Frame compatibility

Inspect real response headers for the MVP preview URL and the parent portfolio's iframe policy. An existing X-Frame-Options:DENY or SAMEORIGIN will block a different portfolio origin. Configure the MVP's public preview responses with CSP frame-ancestors limited to self and the verified Nex2i portfolio origin(s), remove incompatible X-Frame-Options for those responses, and allow the required MVP origins in the portfolio frame-src policy where one exists. CSP frame-ancestors must be an HTTP response header; a meta tag is insufficient. Do not use a wildcard or weaken framing rules on account/private routes. Verify browser behavior from the actual parent origin; curl success or an iframe load event alone is not proof it rendered. Recheck auth/payment flows outside the iframe after changing headers.

## Publish, verify and record

After the implemented MVP URL is live, update the portfolio idempotently, run its applicable build/checks and publish through its existing authorized deployment process. With simultaneous daily runs, merge/upsert current portfolio data by registry ID and resolve Git/data conflicts; do not overwrite a stale copy or lose another run's entry. Honor the project's actual CI/deployment gate and inspect the final published revision.

On the deployed portfolio, verify the entry appears exactly once, small iframe renders, button opens the larger modal iframe, close/Escape/focus restoration work, Open app points to the correct canonical URL, mobile layout works, failed-preview fallback works, and other entries still open. Capture browser console/frame errors, the portfolio source revision/deployment and evidence in the MVP verification ledger.

Then record publication on the existing registry entry:

```
node scripts/mvp-registry.mjs portfolio --run-id RUN_ID --id ENTRY_ID --url https://VERIFIED-PORTFOLIO-URL --source-revision COMMIT-OR-VERSION --deployment-id DEPLOYMENT_ID --verification-reference LEDGER-REFERENCE
```

This command records verified publication metadata; it does not edit or deploy the portfolio itself. Use only after actual browser verification. The pipeline handoff includes the portfolio URL and preview/modal results. If the portfolio target, framing or publishing is blocked, record the specific unfinished step and do not label the full pipeline complete merely because the standalone app deployed.
