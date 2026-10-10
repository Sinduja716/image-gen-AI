"""TRACK 1 owns this file. Contract: compute_metrics(plan) -> MetricsResponse.

Stub: counts calls and cache hits from the jobs. Replace with real neuron logging, the baseline
run (8 steps, no reuse) and the saving percentage. Label every estimate in `notes`.
"""
from __future__ import annotations

from app.schemas import MetricsResponse, Plan


def compute_metrics(plan: Plan) -> MetricsResponse:
    done = [j for j in plan.jobs if j.status.value == "completed"]
    hits = sum(1 for j in done if j.cache_hit)
    calls = len(done) - hits
    return MetricsResponse(
        plan_id=plan.plan_id,
        image_calls=calls,
        cache_hits=hits,
        notes=["Stub metrics: baseline and cost are not implemented yet."],
    )
