# Skeptic and independent ranking — 2026-10-04

The frozen shortlist is OneRoster bulk preflight (#26), calibration due-list audit (#1), dispatch schedule CSV preflight (#77), and promised maintenance visits reconciliation (#82). Volunteer rota was a preliminary assignment and is excluded. Rubric unchanged: pain 20%, distribution 20%, operating fit 20%, differentiation 15%, founder fit 15%, repeatability 10%; SEO only; all steady-state labor capped at five hours weekly. Hosting feasibility is separate. I did not receive the parent ranking. I previously researched #26 and #1, so this is a fresh adversarial pass, not wholly independent authorship for those two; #77/#82 had independent initial discovery by agent B.

No finalist has demonstrated paid demand or buyer acquisition. The defensible decision is a bounded experiment, not a claim that any is a validated business. Generic CSV checking does not itself establish an opening.

## Ordinal comparison

| Candidate | Pain | Distribution | Operating fit | Differentiation | Founder fit | Repeatability | Weighted /5 | Decision |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Dispatch preflight #77 | 3 | 1 | 4 | 2 | 5 | 4 | 3.05 | Bounded experiment |
| OneRoster #26 | 4 | 1 | 3 | 2 | 4 | 3 | 2.80 | Investigate |
| Calibration due-list #1 | 3 | 1 | 4 | 1 | 4 | 4 | 2.75 | Reject present paid proposition |
| Promised visits #82 | 3 | 1 | 2 | 2 | 5 | 4 | 2.65 | Investigate input/export gate |

These are judgments, not probabilities. Pain is strongest for OneRoster's documented integration requirements; dispatch's operating fit is an unmeasured hypothesis under fixed-schema restrictions. The 0.25 lead is close: treat dispatch and roster as a practical tie unless low-support inputs decide it. Raising pain by five weight points and lowering operating fit by five closes half the lead; proven roster distribution or repeated support problems would reverse the choice. Search results establish competitive content, not query volume, rankings, or reachable buyers.

## Dispatch schedule CSV preflight

**Supported weakness.** [Jobber's current schedule documentation](https://help.getjobber.com/en/articles/schedule-overview-new-schedule/) already evaluates staff working hours, occupied appointments, appointment duration and drive time. [Housecall Pro time-slot documentation](https://help.housecallpro.com/en/articles/16140047-schedule-with-time-slots) already shows technician/route capacity and rejects overlapping slot definitions. This latter constraint is about business time-slot definitions, not proof that every overlapping job is prevented. Do not conflate the two. Native schedule checks are therefore real overlap; claiming incumbents fail to detect conflicts would be unsupported.

**Cheapest adequate substitute.** For tiny spreadsheet dispatchers, manual sort-by-crew plus conditional formatting is a plausible zero-cost alternative; not tested with a real buyer. Existing-suite customers should use their native scheduler. Jobber's importing/report plans cannot be assumed available to every buyer.

**Fair strongest case and meaningful opening.** Target the office dispatcher whose authoritative schedule remains a spreadsheet and who needs a reproducible pre-release exception packet. Buyer-valued proposed deliverable: each crew collision names both source rows/jobs; each customer-window mismatch shows the promised window and scheduled interval; daily load records its explicit capacity assumption; unresolved travel/crew-identity data are prominently flagged; the source remains intact. Browser-local processing and no migration lower setup friction. This accepted artifact is a clearer proposition than a generic checker, but willingness to pay for it remains a hypothesis and native tools already cover much of the underlying logic.

**Hidden labor.** Crew names may conceal individual overlap across crews; dates, overnight jobs and daylight saving may be ambiguous; travel and duration vary; capacity can mean person-hours or crew-hours. A tool that says a schedule is safe after only checking booked clock times creates misplaced confidence. Do not infer travel, worker composition, legal breaks or route feasibility. Same-day dispatch also creates urgent support expectations. Publish one precise schema, reject unsupported forms visibly, and describe checked scope on every report.

**Decisive experiment.** $19 for a bounded 30-day nonrenewing pilot is preferable to $19 for each daily report: per-day pricing implies roughly $380 over 20 working days, which demands a value level not established here. Show a useful free sample and first-file preview; payment buys reusable export/access only if the service actually fulfills it. Three unrelated owner-dispatchers must each find a genuine mistake or save at least 15 minutes of review using their existing sheet without private mapping assistance; each must pay and use it on three separate cycles. No invented traffic or conversion expectations. SEO-only eight-week cap with at most two hours/week content; fewer than 30 qualified organic visits is an acquisition failure for this bounded investment, not proof of no market. Stop if custom cleanup, routing, messaging or emergency support becomes necessary. If billing is not actually connected, label the price a hypothesis and record no sale.

## OneRoster bulk CSV preflight

**Supported weakness.** [1EdTech's implementation FAQ](https://www.1edtech.org/k12/oneroster-implementation-faq) supports the task: count, mapping and action validation are recommended. But generic structure checks are available in the [oneroster-ts public repository](https://github.com/nicelion/oneroster-ts), including headers, enums, manifests and cross-file references. Its README was inspected; accuracy, license suitability and adoption were not tested.

**Correction to prior access claim.** [1EdTech's 2022 account](https://www.1edtech.org/blog/rostering-resources-and-gradebook-standards) says export certification validators are member-access. However [Imagine Learning's integration instructions](https://help.imagineclassroom.com/hc/en-us/articles/35015478458519-Setting-up-a-OneRoster-integration), dated December 4, 2025, recommend the CSV validator and a free IMS account. The latter concerns OneRoster 1.1 integrations, not proof that 1.2 certification tooling is freely accessible. This discrepancy is unresolved. Do not advertise avoiding a mandatory paid membership as an established advantage.

**Cheapest substitute.** Existing SIS/vendor diagnostics, official tooling where accessible, or the local open-source CLI. A browser UX removes CLI setup, but that is convenience rather than missing validation.

**Missing evidence and workload.** District procurement/PII rules, accepted export versions, actual error quality and staff willingness to pay. Vendor-specific restrictions can pass schema checks while failing operationally; Imagine Learning notes programs that cannot roster one student into several schools. Version 1.1/1.2, bulk/delta and consumer-specific mappings make support complex. Never imply certification or guaranteed import success. Strongest case is a documented nondeveloper fix packet for one exact bulk format; decisive trial is three SIS administrators resolving real export errors faster than their current validator with no one-to-one setup. Reject if their existing errors are adequate or if consumer-specific custom rules dominate.

## Calibration due-list CSV audit

**Strong direct disconfirmation.** [Remindax's free Excel template](https://www.remindax.com/excel-templates/free-equipment-calibration-due-date-tracker-template) publicly documents month-based due calculation, overdue/due-soon/missing-date statuses, rollups, and no signup. [LeanSuite's free gauge log](https://www.theleansuite.com/templates/gauge-calibration-log), updated October 1, 2026, also describes due dates, statuses and overdue lists. These are maker descriptions, not downloaded formula QA; nevertheless, promised core overlap is direct. [GAGEtrak](https://gagetrak.com/) adds broad calibration management/import services. Neither free templates nor vendor existence prove customer satisfaction, but a paid date-only report lacks a demonstrated advantage.

**Likely labor failure.** Calendar month versus days arithmetic, withdrawn tools, grace policies, ambiguous dates, custom columns and certificate expectations. Strongest case is an instant independent audit of an existing messy register without adopting a new template; that advantage is weak unless saved preparation time is measured. Test against Remindax on the same existing register, with the buyer choosing and paying blind to presentation. Reject current proposition without a material advantage in accepted exceptions beyond the free template.

## Promised maintenance visits reconciliation

**Supported overlap and export gap.** [Jobber recurring-jobs report](https://help.getjobber.com/en/articles/recurring-jobs-report/) includes job number, completed visits, schedules and custom fields; CSV export is documented, with admin/report/pricing permissions and selected-plan restrictions. It does not establish an exported promised count and stable customer identifier in the schema needed by the new tool, nor that completed counts align to a selected promise period. Job number is documented; using customer name as a stable ID is unsafe. [Housecall Pro service-plan dashboard](https://help.housecallpro.com/en/articles/2932107-service-plans-dashboard-overview) shows upcoming/overdue unscheduled visits; [visit instructions](https://help.housecallpro.com/en/articles/3075085-schedule-service-plan-visits) allow completed visits to be linked to past invoices. These weaken claims that incumbents lack promise coverage views.

**Cheapest substitute.** A spreadsheet COUNTIFS/join against an existing structured promise register, or native service-plan queues. Primary differentiation hypothesis is cross-system, period-specific reconciliation with a repeatable provenance packet; no evidence yet that users possess the two clean input tables.

**Hidden labor.** Promise periods, cancellations, waived service, partial completion, linked invoices, paused plans and changes midmonth. An invoice is not necessarily evidence of a completed visit. Contract prose interpretation excluded by scope, but manually converting prose to counts can still become founder onboarding work.

**Decisive gate.** Before ranking this as buildable, require two real redacted export pairs generated by the buyer unaided, with stable customer/job identity, explicit period, promised count and genuine completed-event date. Measure reconciliation against a human-accepted result; reject if promised counts must be hand-transcribed or native queues solve it. No support burden advantage established.

## Methods and remaining uncertainty

All links retrieved October 4, 2026. Primary maker/help/standards pages inspected; marketplace listicles and promotional forum posts were not used to establish capability or price. Competitor search is a bounded pass, not an exhaustive market map. No contacted customers, payments, search-volume measurements or tests of third-party software. Stripe Directory skill was read before vendor research; root's actual CLI/provider discovery failed with user-agent refusal, so open-web primary sources were the fallback. No provisioning performed.

A small dispatch prototype is justified only as an instrument for the specified experiment under the user's build request. No new paid infrastructure, no automatic renewal and no claim of complete feasibility. Deployment success is a technical result; it cannot raise the commercial score.
