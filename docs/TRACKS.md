# Three tracks for three developers

Each developer owns separate files, so the three branches merge without conflicts. The app runs from the
first minute because every track starts with a working stub (mock images, default plan). Replace the stub
in your own files; never edit another track's files or the frozen ones (`docs/OWNERSHIP.json`).

Branches: `track1-planner`, `track2-pipeline`, `track3-frontend`. Push only to your branch. Commit at the end of
every phase and at least once an hour.

## Track 1: Planner and Measurement

Files: `backend/app/planner/`, `backend/app/metrics.py`, `routes_plans.py`, `routes_metrics.py`, `data/wordlists.json`,
`data/profiles.json`, `data/test_prompts.csv`, tests named `test_planner_*` and `test_metrics_*`.

| Phase | Do | Done when |
|---|---|---|
| 1 Rules (first 3 hours) | Word lists (A-Z, numbers, days, months, shapes, colours). Parse counts like "A to Z" and "1 to 10". Button defaults. Flag a prompt that contradicts its button. Write 12-15 test prompts. | `make_plan` gives 26 ordered jobs for "animals A to Z" and fills every card field with a source |
| 2 AI planner (hours 3-7) | Gemini call through the `google-genai` package for topic, count, age and language. Validate with Pydantic. On any failure fall back to the rules. Run the calibration (steps 2/4/8) and write `profiles.json`. | Bad AI output never crashes the plan. Calibration scores are saved. |
| 3 Measurement (hour 7 to end) | `compute_metrics`: neurons, estimated dollars, baseline (8 steps, no reuse) and saving percent, with notes labelling estimates. Script to run baseline and optimized on the test prompts. | One table of measured numbers for every test prompt |

## Track 2: Image pipeline and PDF

Files: `backend/app/providers/`, `backend/app/pipeline/`, `routes_jobs.py`, `data/library/`, `scripts/seed_library.py`,
tests named `test_pipeline_*` and `test_providers_*`.

| Phase | Do | Done when |
|---|---|---|
| 1 Real images (first 3 hours) | Cloudflare call in `cloudflare_flux.py` with `httpx`, timeouts, normalised errors, real neuron cost. Budget guard. Concurrency limit of 2 and bounded retries in `jobs.py`. | A real picture comes back. A forced failure retries only that page. |
| 2 Reuse library (hours 3-7) | `library.py` with `sqlite3` from the standard library. Match on subject, type, style and age band. Check it before generating and save after. Seed script for A-Z and common subjects. | Running the same request twice makes zero provider calls the second time |
| 3 Output (hour 7 to end) | `outline.py` with OpenCV. `pdf_export.py`: correct sizes, titles and words from templates, a font for the demo language, text-fit check, page count check. | A-Z exports a correct 26-page PDF that opens cleanly |

## Track 3: Frontend

Files: `frontend/src/` (except `api/types.ts`), `frontend/public/`, `frontend/index.html`.

| Phase | Do | Done when |
|---|---|---|
| 1 Request flow (first 3 hours) | Four buttons, prompt box, summary card with editable count, age band and language, defaults marked, warnings shown. Offline mock data so you never wait for the backend. | A teacher can reach "Generate" from the card |
| 2 Progress and pages (hours 3-7) | Poll status. Ordered list with thumbnails from `asset_uri`. Per-page redo button. Failed, partial and empty states. Download button disabled until complete. | A failed page can be shown and redone |
| 3 Cost panel and polish (hour 7 to end) | Panel from `/metrics`: this request against baseline, estimates labelled. Loading and error states. Demo-ready styling. | The whole demo runs without touching code |

## Before every push

    python scripts/check_ownership.py track1        (use your own track)
    powershell -ExecutionPolicy Bypass -File scripts\verify.ps1

Both must pass. Then `git push origin track1-planner`.
