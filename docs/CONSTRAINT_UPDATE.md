# CONSTRAINT UPDATE: show cost + saving on EVERY generation, and explain the estimate

Written for use inside an IDE agent (Antigravity, Cursor, Copilot, Claude Code). Open this file, find YOUR section,
paste its "IDE agent prompt" and let the agent work, but only inside the files your section allows.

## The new constraint (from the organisers)
> Every generation must display its estimated cost (compute time, energy or an equivalent measure) alongside the
> saving compared with the maximum setting. Teams must explain how the estimate is calculated.

## What this means for us (acceptance, checked at the demo)
1. Each generated image shows: tier, neurons, estimated seconds, estimated dollars, and "saved X% compute / Y% time
   versus maximum (8 steps)". Reused images show 0 neurons, 0 s, 100% saved. The maximum tier honestly shows 0% saved.
2. The same figures are shown BEFORE generating (summary card) and as totals after.
3. A visible "How is this calculated?" control opens the explanation (formulas, measured table, caveats).
4. Every figure that is not measured yet says "placeholder". No invented numbers anywhere.
5. docs/ESTIMATION.md is written with real measured values (submission text).

## What already exists (contract v2, done by the integrator)
- `ResourceEstimate` now has: neurons, cost_usd, seconds, max_seconds, saving_percent, time_saving_percent, method,
  placeholder, measured, notes (plus max_* values). Built only by `backend/app/estimate.py`. Never compute these by hand.
- `GET /api/v1/estimate/method` returns the full explanation (TypeScript type `EstimateMethod`).
- `MetricsResponse` has new fields `seconds_used`, `baseline_seconds`, `time_saving_percent` (Track 1 fills them).
- Measured tables are read from `data/library/neurons.json` and `data/library/timings.json`.

## Step 0, EVERYONE, first (5 minutes)
The integrator pushes "contract v2" to `main`. Then every developer:

    git add -A ; git commit -m "wip"          (only if you have uncommitted work)
    git fetch origin
    git merge origin/main
    powershell -ExecutionPolicy Bypass -File scripts\verify.ps1      (must say ALL CHECKS PASSED)

If `git merge` reports a conflict, STOP and message Sinduja. Do not resolve it by editing frozen files.

---------------------------------------------------------------------------------------------------------

## SINDUJA (integrator + Track 2, branch track2-pipeline)
Files you may edit: backend/app/providers/, backend/app/pipeline/, backend/app/api/routes_jobs.py, data/library/,
scripts/seed_library.py, scripts/measure_costs.py. As integrator you also own the frozen files.

1. Publish contract v2 to main (extract the zip into the repo root on branch `main`, run verify, commit, push):
       git checkout main ; git pull ; (extract contract-v2 files) ; scripts\verify.ps1 ; git add -A
       git commit -m "contract v2: cost, time, method endpoint" ; git push origin main
   Then tell gg and Mona to do Step 0.
2. On `track2-pipeline`: `git merge main`. In `backend/app/pipeline/jobs.py` the completed-job line must read:
       job.estimate = make_estimate(job.tier, actual_neurons=result.neurons, actual_seconds=result.latency_ms / 1000.0)
   (the version shipped with contract v2 already has it).
3. MEASURE (this is what makes the numbers real). Needs the working Cloudflare token in .env:
       python scripts/measure_costs.py --n 10                      (writes data/library/timings.json, saves pictures)
   Neurons: read the Cloudflare dashboard (Workers AI -> usage) before and after each tier, one tier at a time:
       python scripts/measure_costs.py --n 10 --only 2    (note the dashboard difference / 10 = neurons per image)
       ... same for --only 4 and --only 8
       python scripts/measure_costs.py --write-neurons --neurons-2 A --neurons-4 B --neurons-8 C
   Send the six numbers to gg for docs/ESTIMATION.md. Commit data/library/neurons.json and timings.json.
4. PDF resource page (nice to have, 20 min): in `pdf_export.py` add a last page "Resource report": per page tier,
   neurons, seconds, saving, reused yes/no, then the totals and the one-line `estimate.method`. Mark placeholders.
5. Seed the library (A-Z and common subjects) AFTER measuring, so seeding does not pollute the measurements.
6. Merge order and verify as in docs/INTEGRATION.md. At the end open the app and check the 5 acceptance points above.

IDE agent prompt (paste):
> You are working in the EduCreate AI repo on branch track2-pipeline as the integrator. Read docs/CONSTRAINT_UPDATE.md
> and docs/CONTRACT.md. Allowed files: backend/app/providers/, backend/app/pipeline/, backend/app/api/routes_jobs.py,
> scripts/measure_costs.py, scripts/seed_library.py, data/library/. Task: add a "Resource report" last page to the
> exported PDF in pdf_export.py listing, per page, tier, neurons, seconds, saving percent and whether it was reused,
> then totals and Job.estimate.method. Use job.estimate fields only; never recompute. Label placeholder values.
> Do not edit schemas.py, estimate.py or any other track's files. Run scripts\verify.ps1 and fix failures.

---------------------------------------------------------------------------------------------------------

## GG (Track 1, branch track1-planner)
Files you may edit: backend/app/planner/, backend/app/metrics.py, backend/app/api/routes_plans.py,
backend/app/api/routes_metrics.py, data/wordlists.json, data/profiles.json, data/test_prompts.csv,
backend/tests/test_planner_*.py, backend/tests/test_metrics_*.py, docs/ESTIMATION.md, docs/track1/.

1. Planner must give the tier and a human reason for EVERY plan (already in the stub, keep it) and a meaningful
   `item_key` per job ("animal:elephant", not "item-1"), so reuse works. The plan's `estimate` comes from
   `make_estimate(tier)`. Never build an estimate yourself.
2. metrics.py `compute_metrics(plan)`: fill the new fields.
       seconds_used     = sum of job.estimate.seconds over completed jobs
       baseline_seconds = completed pages x make_estimate("high").max_seconds
       time_saving_percent = (1 - seconds_used / baseline_seconds) x 100  (None if baseline is 0)
   Keep neurons_used / baseline_neurons / saving_percent as they are.
3. Split the saving honestly. Add two lines to `notes`:
       "Of the X% compute saved, A points come from choosing lower tiers and B points from reusing saved images."
   Tier part = what the saving would be with no reuse (each page at its tier's neurons). Reuse part = the rest.
4. Tests (`test_metrics_*.py`): all pages high -> 0% saving; all draft -> saving > 0; a reused page -> 0 neurons and
   100%; mixed tiers add up; no division by zero with zero completed pages; time fields present.
5. Benchmark script (`docs/track1/benchmark.py`): for every prompt in data/test_prompts.csv create a plan, run the
   jobs with the configured provider, call compute_metrics and write a markdown table (prompt, pages, tier,
   neurons used, baseline neurons, saving %, seconds, baseline seconds, time saving %, pages reused) to
   docs/track1/benchmark.md. Run it twice: first run = fresh, second run = reuse.
6. Calibration (quality evidence): same 5-6 subjects at 2/4/8 steps, score 1-5 per purpose, save to
   data/profiles.json. This justifies "draft is enough for colouring".
7. Write docs/ESTIMATION.md: replace every [FILL] with a measured value from Sinduja (neurons, seconds), your
   calibration table and the benchmark table. Delete any sentence you cannot support with a measurement.

IDE agent prompt (paste):
> You are working in the EduCreate AI repo on branch track1-planner. Read docs/CONSTRAINT_UPDATE.md, docs/CONTRACT.md
> and backend/app/estimate.py. Allowed files: backend/app/planner/, backend/app/metrics.py, backend/app/api/routes_*.py
> owned by Track 1, backend/tests/test_planner_*.py, backend/tests/test_metrics_*.py, data/*.json, data/test_prompts.csv,
> docs/ESTIMATION.md, docs/track1/. Task: implement compute_metrics so MetricsResponse.seconds_used, baseline_seconds
> and time_saving_percent are filled, add the two-line split of saving into "lower tiers" and "reuse" in notes, and
> add tests covering all-high, all-draft, reused page, mixed tiers and zero completed pages. Use make_estimate() and
> job.estimate only; never hard-code neuron or second values. Do not edit schemas.py, estimate.py, main.py or any
> file outside the allowed list. Run python scripts/check_ownership.py track1 and scripts\verify.ps1 before finishing.

---------------------------------------------------------------------------------------------------------

## MONA (Track 3, branch track3-frontend)
Files you may edit: frontend/src/ (except src/api/types.ts), frontend/public/, frontend/index.html.
types.ts already has the new fields; read it, do not edit it.

1. Add `getEstimateMethod: () => call<EstimateMethod>("/api/v1/estimate/method")` to src/api/client.ts.
2. Component `CostBadge` (one per image, used on the summary card and on every finished page). Shows:
       <Tier> · <steps> steps · ≈<neurons> neurons · ≈<seconds> s · ≈$<cost_usd>
       Saved <saving_percent>% compute and <time_saving_percent>% time vs maximum (<max_steps> steps)
   Rules: reused page (job.cache_hit) -> "Reused: 0 neurons, 0 s, saved 100%". Tier "high" -> "Maximum quality: 0% saved".
   `estimate.placeholder` true -> add the word "placeholder" next to every number. `estimate.measured` true ->
   "measured". Show the tier as text, never colour alone. Format: neurons 1 decimal, seconds 1 decimal, dollars 4 decimals.
3. Summary card (before Generate): per-image CostBadge from `plan.estimate` and the request total
   (count x neurons, count x seconds, count x dollars) against the maximum (count x max_neurons ...).
4. Results page: CostBadge from `job.estimate` under each image (it holds the real reading once completed).
5. Totals panel from `api.metrics(planId)`: neurons_used vs baseline_neurons, seconds_used vs baseline_seconds,
   estimated_cost_usd vs baseline_cost_usd, saving_percent, time_saving_percent, cache_hits, tier_counts, and
   every line of `notes`. Show energy only if energy_wh_used is not null.
6. "How is this calculated?" button next to every CostBadge and the totals. Opens a panel from
   getEstimateMethod(): summary, the tier table (steps, neurons, seconds), the formulas, the energy sentence and the
   caveats. Show "values are placeholders until measured" when `measured` is false.
7. Offline mock data: add the new fields to your mock plan/jobs so the UI works without the backend.

IDE agent prompt (paste):
> You are working in the EduCreate AI repo on branch track3-frontend (React + TypeScript + Vite). Read
> docs/CONSTRAINT_UPDATE.md and frontend/src/api/types.ts (do not edit types.ts). Allowed files: frontend/src/ (except
> src/api/types.ts), frontend/public/, frontend/index.html. Task: add a CostBadge component and a "How is this
> calculated?" panel. CostBadge shows tier, steps, neurons, seconds, dollars and "saved X% compute and Y% time vs
> maximum (8 steps)" from ResourceEstimate; reused jobs show 0 neurons, 0 s, saved 100%; the high tier shows
> "Maximum quality: 0% saved"; placeholder values are labelled "placeholder". Use it on the summary card (plan.estimate,
> with request totals), under every finished page (job.estimate) and add a totals panel from /metrics. The panel reads
> GET /api/v1/estimate/method via api.getEstimateMethod (add it to client.ts). Never compute estimates in the
> frontend; only format fields from the API. Add the new fields to the offline mock data. Do not install packages.
> Run `npm run build` in frontend and scripts\verify.ps1 before finishing.

---------------------------------------------------------------------------------------------------------

## Timeline (IST)
- Now to 20:00: Sinduja publishes contract v2; gg and Mona do Step 0.
- 20:00 to 22:30: Mona builds CostBadge, totals, explain panel (mock data). gg builds metrics and tests.
  Sinduja gets the real provider working and runs the measurement (needs her Cloudflare token).
- 22:30 trial merge. Fix anything that fails verify.
- 22:30 to 01:30: gg benchmark + ESTIMATION.md with measured numbers; Mona polish; Sinduja PDF report page and seeding.
- 01:30 final merge, demo rehearsal against the 5 acceptance points.

## Honesty rules (do not break)
- Do not show a number that no code produced. Placeholders must say "placeholder".
- Never present energy in watt-hours unless a source is cited in docs/ESTIMATION.md.
- Savings are measured against our own maximum setting (8 steps), as the brief asks, and say so on screen.
