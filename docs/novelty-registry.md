# Randomized discovery and shared MVP registry

Founder update October 4, 2026: the pipeline must support frequent runs, including five per day, while selecting unique ideas. This is execution capability, not a schedule; create an automation only when explicitly requested.

## Shared source of truth

All local runs use `~/projects/mvp-ideas/mvp-registry.json`, outside individual public repos. The registry includes implemented MVPs (even unfinished customer-release demos), active reservations, historical abandoned reservations, and run seeds/scopes/duplicate rejections. Record buyer, trigger, inputs, accepted output and a canonical buyer/task key, not just product names. The initial known implemented MVP is Redirect Preflight, with release_status=validation-demo; registration does not upgrade it to customer readiness.

Use `node scripts/mvp-registry.mjs <command>` from the template/generated repo. From the installed skill, use its `scripts/mvp-registry.mjs` by absolute path. `MVP_REGISTRY_PATH` or `--registry path` can point to a temporary registry for tests; production runs must share the founder registry, never a fresh per-run file. Back up the registry with founder operational records; it contains no credentials/customer inputs and must not be deleted between runs. Remote or multi-host runs must use one shared authoritative registry with atomic reservations before provisioning; a copied local JSON file does not prevent cross-host duplicates.

## Randomness without lowering the bar

At the beginning of each research/full run:

```
node scripts/mvp-registry.mjs start
```

This records a cryptographically random seed and unique run ID, samples four opportunity families with random tie breaking among families least used in the last20runs, and returns existing exclusions. Record run ID, seed and scopes in the methods note. Use the seed to vary buyer subsegments, task triggers, input artifacts and organic-search query angles, and rotate independent agent assignments. Families are discovery starting points, not evidence or product choices; add new families when results warrant. Do not use the previous winner as a preferred candidate.

Keep the research depth, frozen commercial rubric, SEO-only acquisition and customer-ready release standards. Randomness diversifies discovery, not scores or quality thresholds. Select the strongest supported novel opportunity; when genuine commercial ties remain, a recorded random tie break is acceptable only after substantive differences have been assessed. Do not manufacture tiny variants to meet a throughput target or guarantee that every invocation deserves a build.

## Semantic duplicate check and restart

Compare every finalist and the selected decision against all implemented entries and active reservations. A different name, website copy or industry label is not a new idea when buyer job, input/output, workflow and purchase reason substantially match. Compare practical task equivalence; a materially different buyer requirement or accepted output can establish novelty, with a written rationale. This semantic judgment is the orchestrator's responsibility; script fingerprints only detect identical normalized task keys and slugs.

If a selected idea matches an implemented/reserved MVP, record the matched ID and reason, discard that selection and restart discovery with another seed/scopes and the accumulated exclusions. Re-run screening, decisive source checks and skeptical comparison; do not simply rename it or move into implementation. To log a semantic collision:

```
node scripts/mvp-registry.mjs reject --run-id RUN_ID --match-id ENTRY_ID --candidate-name 'Candidate name' --reason 'Buyer/task overlap'
```

After ten consecutive duplicate-only restarts in one invocation, stop with an explicit novelty-exhaustion result and report the search scopes tried. Do not loop forever, lower customer-readiness/SEO standards or force a build. Access or commercial-evidence blockers are separate from novelty failures.

## Reserve before provisioning

Before creating a GitHub repo, domain or provider resource, write candidate JSON containing name, unique slug, buyer, trigger, inputs, accepted_output, purchase_reason and task_key. Use a stable concise key describing the buyer/job, not a marketing label. Include:

```
"novelty_review": {
  "decision": "distinct",
  "compared_entry_ids": ["every implemented or reserved entry ID"],
  "rationale": "Concrete buyer/task/output differences from the recorded products"
}
```

For an empty registry, compared_entry_ids may be an empty array. Reread the latest registry, perform the semantic comparison, then reserve:

```
node scripts/mvp-registry.mjs reserve --run-id RUN_ID --candidate /absolute/path/candidate.json
```

The helper locks shared writes and atomically replaces the registry. An exact collision returns outcome=duplicate and exit2: restart discovery. A concurrent reservation not covered by the semantic review returns an error: reread the registry and repeat semantic comparison before reserving. Only the reservation owner may mark or release it. No automatic expiry: slow or interrupted runs must not silently lose ownership. If a process crashes while holding the short registry lock, verify the owner process has ended before removing the .lock directory. Registry unavailability blocks provisioning; do not bypass it.

Once the core task is implemented/deployed, record it even if release work remains:

```
node scripts/mvp-registry.mjs mark --run-id RUN_ID --id ENTRY_ID --release-status customer-ready --repository https://github.com/Nex2i/SLUG --app-url https://SLUG.nex2i.com
```

Use release-blocked when customer-release gates remain; validation-demo is for honest historical imports. Marking customer-ready is a status record, not a replacement for the runbook's actual deployed release evidence. Resume an interrupted owned reservation rather than generating a duplicate. Release only an abandoned unimplemented reservation, recording why; never remove implemented products to make them eligible again. Include registry entry/run IDs and duplicate restarts in the handoff.
