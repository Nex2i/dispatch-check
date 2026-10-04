# Dispatch Check decision report

Research date: October 4, 2026. Decision: bounded paid-validation experiment. Commercial confidence: low. Release target: customer-ready; current release: blocked. Founder budget: no new paid infrastructure. This limits deployment to a clearly labeled synthetic founder review; it does not waive customer account, payment, durable storage, backup or monitoring gates.

## Recommendation
Target owner-dispatchers with 2–8 crews whose authoritative schedule remains a spreadsheet. Review a fixed-schema dispatch CSV before sending it to crews, producing source-row exceptions for overlaps, short buffers, invalid time data and arrival-window breaches. Never route, repair, infer individual crew membership or send messages. Analysis stays local; future paid export sends pseudonymous job/crew IDs and times transiently to the API with explicit consent. No schedule retention or logging. Engineering fit is strong, but paid demand, SEO discovery and low support remain unproven.

The narrow proposed opening is a reproducible review packet without adopting a scheduling suite. Incumbents already perform conflict checks; missing competitor functionality is not the premise. [Jobber schedule guidance](https://help.getjobber.com/en/articles/schedule-overview-new-schedule/) describes worker availability, appointments and drive time. [Its CSV job import](https://help.getjobber.com/en/articles/import-jobs/) is documented as an admin-only beta with up to1000 jobs/import. [Jobber pricing](https://www.getjobber.com/pricing/) lists one-user Core $49/month without commitment or $29/month billed annually at retrieval; this does not imply all investigated features are included. [Housecall Pro's double-booking guidance](https://www.housecallpro.com/resources/how-to-avoid-double-booking/) documents buffers and synchronized scheduling as alternatives. These are maker descriptions, not buyer satisfaction or measured losses.

## Comparison and reasons alternatives lost
Frozen weights: pain20%, distribution20%, operating fit20%, differentiation15%, founder fit15%, repeatability10%. Scores are ordinal, not probabilities. SEO only, no ads. Initial independent screening scores were preserved in the catalog; after adversarial source checks the normalized comparison is:

| Candidate | Weighted /5 | Decision and reason |
|---|---:|---|
| Dispatch CSV review #77 |3.05|Experiment: fixed schema and explicit exception packet permit bounded deterministic scope; cheap spreadsheet/native alternatives remain strong.|
| OneRoster bulk preflight #26 |2.80|Investigate: stronger official workflow evidence, but free open-source/official validators and procurement/version/vendor-specific support weaken opening.|
| Calibration due-list audit #1 |2.75|Reject current paid proposition: free templates supply due/overdue/missing-date output.|
| Promised visits reconciliation #82 |2.65|Investigate: clean promise/completion exports and stable IDs are unverified; manual contract interpretation risks consulting.|

[1EdTech's implementation FAQ](https://www.1edtech.org/k12/oneroster-implementation-faq) supports multi-level roster validation; [oneroster-ts](https://github.com/nicelion/oneroster-ts) documents headers/enums/manifest/reference checks. Official validator access/membership claims conflict across sources and are unresolved. [Remindax's free calibration template](https://www.remindax.com/excel-templates/free-equipment-calibration-due-date-tracker-template) overlaps the date-only proposition. [Jobber's recurring-jobs report](https://help.getjobber.com/en/articles/recurring-jobs-report/) exposes report/export data but does not prove the required promise-count table exists. See [skeptic report](skeptic.md).

Dispatch/OneRoster are a practical near-tie; fixed nonstudent inputs and clearer bounded support decide the experiment. Increasing pain weight5points while decreasing operating fit5 narrows the gap. Demonstrated OneRoster access/willingness or dispatch support burden reverses the decision. No ranking establishes an investable business.

## Billing model
One-time $19USD purchase grants a nonrenewing30-day account pass, proposed price unvalidated. No auto renewal. Free launch tier: up to25 rows local preview. Paid: up to2000 rows plus review exports. Synthetic founder review is free and carries no payment controls. Subscribe only after recurring paid use is evidenced; credits add unnecessary balance handling, per-report pricing penalizes corrections, perpetual purchase creates indefinite support obligations.

Fixed price server-side Checkout; paid status and signed webhook/current provider state establish entitlement, never redirect parameters. Replay/failed/asynchronous payments, refund/dispute revocation, expiry and repurchase rules are specified in [requirements](../requirements/mvp.md). No live charges authorized. Actual sandbox/provider lifecycle remains pending until isolated durable release access exists; fixture tests must not be described as real payment verification.

## Loops and economics
Value: schedule publication trigger → explicit CSV → deterministic checks → dispatcher reviews/corrects → rerun/download → next scheduling cycle. Improvement: opt-in synthetic bug fixtures improve parsing/rules; no customer schedule telemetry. Acquisition: organic problem query → worked guide/template → sample correct report → future paid activation. Query volume/rankings/traffic/conversion/CAC are unknown. No referrals/network-effect assumptions. AI is unnecessary.

Assumptions, not forecasts:10passes/month×$19=$190gross;50=$950;200=$3800. Payment allowance4%+$0.30 gives $17.94/pass before refunds/tax/hosting/labor. At50passes, $897after allowance; with an illustrative future$20 monthly infrastructure budget (not authorized), $877cash before refunds/tax/founder labor. No AI/paid labor. Favorable workload50passes: maintenance/admin1h + SEO2h + support~1h (5min/purchase) + onboarding/refunds0.5h =4.5h/week. Bad case20min support/purchase exceeds7h;200passes exceeds5h even at5min support. Initial discovery/build is separate from steady state.

## Experiment and kill conditions
After customer-release gates pass, three unrelated owner-dispatchers must pay, each complete three real scheduling cycles, identify a genuine error or save15minutes, and require no private column mapping help. Eight-week SEO experiment max2hours/week content. Fewer30qualified organic visitors or no3paid conversions ends this bounded investment; slow SEO is not proof of no demand. No outreach authorized/performed. Kill if routing, worker composition inference, same-day support or custom spreadsheet cleanup is expected. Cap support and log consented value-free metrics only after telemetry configured and consent tested.

## Technical delivery and remaining release gates
Repository: https://github.com/Nex2i/dispatch-check . Deployed synthetic review URL: https://dispatch-check.nex2i.com/ . Portfolio: https://nex2i.com/#portfolio . The [verification ledger](verification.md) is the authoritative record of actual deployment/browser/test evidence. [Manual checklist](manual-test-checklist.md) distinguishes review tests from blocked customer tests.

User declined new paid infrastructure. Available active free Render DB expires November2,2026 and belongs to another MVP; suspended paid databases cannot be reused/resumed as free isolated capacity. No new paid service, live commerce, buyer outreach or sensitive-data collection authorized. Customer API/storage deployment, actual email delivery, isolated owned sandbox credential/provider browser flows, backup/restore and production monitoring remain unfinished. Search Console API OAuth absent; no submission/indexing/ranking claimed. Founder review remains pending.

## Methods and novelty
Exactly100distinct buyer/task hypotheses: four randomized families,25each;18deeper investigations and4finalists. [Complete catalog](idea-catalog.json); original row scores retained. Two independent discovery agents, one reused for adversarial review (so that reviewer authored two initial briefs), separate account implementation agent. Orchestrator independently inspected decision-critical primary sources, normalized schemas and checked task differences. Most catalog rows are screened hypotheses with inferred substitutes, not100validated markets. Research stopped where uncertainty requires real buyer evidence.

Run2026-10-04T15-27-28-502Z-829443384ee2; seed829443384ee27ef6ede806634707809a. Registry a4b15523-aac4-470c-929b-671e847f863e; compared Redirect Preflight c85e87a3-7d20-467a-a0a3-3e6b6b085b33. Different buyer/input/temporal crew output from URL migration graph review. Zero novelty restarts. Stripe Directory official CLI/plugin attempt refused user agent; primary-source web/connected APIs used as documented fallback. No fabricated interviews, payments, volumes or validation.
