# Verification ledger

Customer release: **blocked**. Founder authorized **no new paid infrastructure**. Public deployment accepts synthetic schedules only. Date: October 4, 2026. No test waives customer-release gates.

## Deployed revisions

- App source: `bd2969daa2e9c1828bc858cfdde6394a135b86fe`; [successful CI](https://github.com/Nex2i/dispatch-check/actions/runs/37215299235), completed before manual production deploy. Netlify site `b744207c-5c58-47db-830c-f1f9d39368a7`, deploy `6ac278eed604015c9aa4f8d6`. [Live release identity](https://dispatch-check.nex2i.com/release.json) matches source, mode review. No independent push-triggered production deployment.
- Portfolio source: `99ecfd405f247cd103d0265e19c4988a58052dee`; [successful CI](https://github.com/Nex2i/nex2i-landing/actions/runs/37214860673) before manual deploy. Netlify site `107a9241-116d-4fa0-bcb5-3cd6aebb86b5`, deploy `6ac27762b86bb87381adbe34`.
- This ledger is a subsequent documentation-only update; it does not change the deployed application artifact.

| Criterion | Evidence | Result |
|---|---|---|
| 100 idea catalog /18 deeper/4 finalists | Normalized JSON count, independent research and skeptic reports | passed; demand unvalidated |
| Novelty | Shared atomic registry ID a4b15523-aac4-470c-929b-671e847f863e; distinct task comparison | passed; implemented/release-blocked |
| Provider access | [access check](access-check.md) | passed only for recorded permissions |
| Build and automated tests | Exact-source CI:9 registry,11 API,19 web tests;39 passed,0failed,0skipped. Real PostgreSQL service in CI. | passed |
| Parser/rules/export safety | Strict date/CSV provenance, overlap/buffer/window/capacity edges, formula escaping, global10k issues/25k day-segments, bounded incomplete reviews | passed automated |
| Accounts/paid report | Actual local/CI Better Auth and PostgreSQL lifecycle; report401/402/403/400/413/422 boundaries and paid200 | passed automated; hosted tests blocked |
| Billing | Signed raw webhook without Origin; authoritative state, idempotency/refund/dispute/expiry/ownership fixtures | passed fixtures; actual provider pending |
| Core deployed browser | Codex IAB: sample3valid/1error/3warnings; capacity edit clears old download; rerun changes warnings. Final spaced scenario3valid/0errors/3warnings; reset restores120min and sample. | passed one browser |
| Synthetic controls correction | Live check exposed literal newline/millisecond timestamp issue and stale reset controls; corrected and added semantic regression before final CI/deploy | passed final browser and regression |
| Downloads | Both controls invoked; UI reports Downloaded. Native download-event capture stalled automation; saved CSV artifact not independently captured/read. Formula-safe CSV content tested directly. | partial; founder file/spreadsheet verification pending |
| Error/loading states | Controls clear old report. Invalid capacity/domain cases automated; transient reviewing state implemented but not captured reliably in browser | partial |
| Mobile | IAB390×844: app and portfolio page scrollWidth=clientWidth390; dialog358px/frame356px fit; screenshots inspected. CSS unchanged by final correction. | passed one browser; other engines/zoom pending |
| Console/hydration | Deployed IAB warning/error log empty on initial and final corrected flow | passed tested flows |
| HTTPS/SEO HTTP | System-trust curl: public routes200, oneH1 each, initial task content/canonical; sitemap application/xml and robots text/plain; unknown404; index/default-host301 preserve query; preview noindex and Nex2i-only frame ancestors; app XFO DENY; API503/noindex | passed HTTP; JS-disabled browser unavailable |
| Performance | 255.37kB clientJS /80.41kB gzip; CSS9.11kB/2.77kB gzip. Single curl document requests0.20–0.41s. | measured transfer/build only; Lighthouse/field CWV pending |
| Portfolio | Actual published card preserves Redirect Preflight; synthetic iframe rendered desktop/mobile; direct/fallback link present; Close hides modal and restores trigger focus | passed those flows |
| Portfolio keyboard/failure | Native and frame-locator Escape failed browser keyboard focus root; blocked-network fallback not simulated | pending; no keyboard/failure claim |
| Durable API/database/backups | No new paid infrastructure authorized; expiring shared free DB inappropriate | blocked; no resource created |
| Hosted customer lifecycle | Durable capacity and isolated runtime credentials missing; public account/payment/file controls disabled | blocked; no real email/payment/restore/monitoring claim |
| Search Console | Maintained shared script check: OAuth credentials absent | blocked; no submission/indexing/ranking claim |
| Founder review | [Numbered manual checklist](manual-test-checklist.md) | pending feedback |

Review proof screenshots are local handoff artifacts under `research/2026-10-04/run-829443/` in the founder workspace: dispatch-live.png, dispatch-mobile.png, portfolio-mobile.png. No customer inputs, live payments or buyer outreach occurred. The shared registry records both deployment and portfolio metadata with release-blocked status.
