"""TRACK 1 owns this file. Contract: compute_metrics(plan) -> MetricsResponse.

Starter version already totals neurons, cost, energy (when configured) and the saving versus generating every
page at maximum quality, using app.estimate so the numbers match what each page shows. Track 1: verify against
real measured values, add the baseline-run script, and keep every estimate labelled in `notes`.
"""
from __future__ import annotations

from app.estimate import USD_PER_1000_NEURONS, make_estimate
from app.schemas import JobStatus, MetricsResponse, Plan


def compute_metrics(plan: Plan) -> MetricsResponse:
    done = [j for j in plan.jobs if j.status == JobStatus.completed]
    hits = sum(1 for j in done if j.cache_hit)
    calls = len(done) - hits

    base = make_estimate("high")  # one image at maximum quality
    used = 0.0
    tiers: dict[str, int] = {}
    for j in done:
        n = j.neurons if j.neurons is not None else (j.estimate.neurons if j.estimate else 0.0)
        used += n
        tiers[j.tier] = tiers.get(j.tier, 0) + 1
    baseline = base.max_neurons * len(done)
    saving = None if baseline <= 0 else round(max(0.0, (1 - used / baseline) * 100), 1)

    wh = base.max_energy_wh
    energy_used = None if wh is None else round(used / base.max_neurons * wh, 6) if base.max_neurons else None
    energy_base = None if wh is None else round(wh * len(done), 6)
    saved_wh = None if energy_used is None or energy_base is None else round(energy_base - energy_used, 6)

    notes = list(base.notes) + [
        "Baseline = every page generated fresh at maximum quality (8 steps) with no reuse.",
    ]
    return MetricsResponse(
        plan_id=plan.plan_id,
        image_calls=calls,
        cache_hits=hits,
        neurons_used=round(used, 3),
        estimated_cost_usd=round(used / 1000.0 * USD_PER_1000_NEURONS, 6),
        baseline_neurons=round(baseline, 3),
        baseline_cost_usd=round(baseline / 1000.0 * USD_PER_1000_NEURONS, 6),
        saving_percent=saving,
        energy_wh_used=energy_used,
        baseline_energy_wh=energy_base,
        energy_saved_wh=saved_wh,
        tier_counts=tiers,
        notes=notes,
    )
