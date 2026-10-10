# Shared contract (frozen)

The data shapes live in `backend/app/schemas.py` (backend) and `frontend/src/api/types.ts` (frontend).
Only the integrator changes them. `backend/tests/test_contract_snapshot.py` fails if the backend shapes change.

## Endpoints

| Method and path | Owner | Returns |
|---|---|---|
| GET /api/v1/health | integrator | `{status: "ok"}` |
| POST /api/v1/plans | Track 1 | Plan (summary card data and the ordered jobs). Body: GenerationRequest |
| GET /api/v1/plans/{id} | Track 1 | Plan |
| POST /api/v1/plans/{id}/generate | Track 2 | 202 GenerateResponse. Starts the jobs in the background. |
| GET /api/v1/plans/{id}/status | Track 2 | StatusResponse with counts and every job in order |
| GET /api/v1/jobs/{id} | Track 2 | Job |
| POST /api/v1/jobs/{id}/retry | Track 2 | Job. Only failed jobs. 409 otherwise. |
| GET /api/v1/jobs/{id}/asset | Track 2 | The image |
| POST /api/v1/plans/{id}/export | Track 2 | ExportResponse. 409 until every page is completed. |
| GET /api/v1/plans/{id}/download | Track 2 | The PDF |
| GET /api/v1/plans/{id}/metrics | Track 1 | MetricsResponse |

## Rules every track follows

- Jobs are ordered by `sequence`, starting at 1, with no gaps.
- `asset_uri` is a path under `/api/v1/jobs/{job_id}/asset`, never a file path or a provider URL.
- Provider names, keys and prices never reach the frontend except through `Job.provider` and `Job.model` as text.
- Estimated numbers are labelled in `MetricsResponse.notes`.
- Planner, provider and pipeline code talk through the functions named in each file's header comment.

## Quality tiers and resource estimates (added for the released problem statement)

- A request is for a PURPOSE (`material_type`): colouring, worksheet, flashcards, poster, thumbnail, or `auto`.
  The planner turns the purpose into a TIER: `draft` (2 steps), `standard` (4), `high` (8). A Plan never keeps `auto`.
- The teacher may override the tier with `overrides.tier`.
- `Plan.estimate` is the estimate for one image BEFORE generating; `Job.estimate` is updated with the real reading
  AFTER generating. Both are built only by `app/estimate.py`, never by hand.
- Each estimate carries what maximum quality would have used and `saving_percent`. A reused page has 100%.
- Energy in watt-hours appears only if `ENERGY_WH_PER_1000_NEURONS` is set. Otherwise show relative compute only.
- Always show `estimate.notes` and mark values with `placeholder: true` as "placeholder".
