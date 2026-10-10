"""Shared resource-estimate maths. OWNER: integrator. Do not edit.

Every number a user sees about compute, cost or energy comes from make_estimate(), so the planner (before
generating), the job runner (after generating) and the metrics (totals) can never disagree.

Honest by design:
- Neurons are Cloudflare's own compute unit. Until Dev 2 measures real values into
  data/library/neurons.json the table is a PLACEHOLDER and every estimate says so.
- Energy in watt-hours is shown only when ENERGY_WH_PER_1000_NEURONS is set in .env, and is labelled illustrative.
"""
from __future__ import annotations

import json

from app.config import settings
from app.schemas import ResourceEstimate, Tier

TIER_STEPS: dict[str, int] = {"draft": 2, "standard": 4, "high": 8}
MAX_TIER = "high"
USD_PER_1000_NEURONS = 0.011  # Cloudflare paid rate; an estimate for free-tier usage
PLACEHOLDER_NEURONS: dict[int, float] = {2: 30.0, 4: 50.0, 8: 90.0}


def neuron_table() -> tuple[dict[int, float], bool]:
    """Returns ({steps: neurons per image}, is_placeholder)."""
    path = settings.library_dir / "neurons.json"
    try:
        raw = json.loads(path.read_text())
        table = {int(k): float(v) for k, v in raw.items() if str(k).isdigit()}
        if {2, 4, 8} <= table.keys():
            return table, False
    except Exception:
        pass
    return dict(PLACEHOLDER_NEURONS), True


def neurons_for_steps(steps: int) -> float:
    table, _ = neuron_table()
    nearest = min(table, key=lambda k: abs(k - steps))
    return table[nearest]


def _energy(neurons: float) -> float | None:
    wh = settings.energy_wh_per_1000_neurons
    return None if wh is None else round(neurons / 1000.0 * wh, 6)


def make_estimate(tier: Tier, actual_neurons: float | None = None) -> ResourceEstimate:
    steps = TIER_STEPS[tier]
    table, placeholder = neuron_table()
    max_steps = TIER_STEPS[MAX_TIER]
    max_neurons = table[max_steps]
    neurons = float(actual_neurons) if actual_neurons is not None else table[min(table, key=lambda k: abs(k - steps))]
    saving = 0.0 if max_neurons <= 0 else max(0.0, min(100.0, (1 - neurons / max_neurons) * 100))
    notes = [f"Cost is an estimate at ${USD_PER_1000_NEURONS} per 1,000 neurons (Cloudflare's paid rate)."]
    if placeholder:
        notes.append("Neuron values are placeholders until they are measured.")
    if settings.energy_wh_per_1000_neurons is not None:
        notes.append(f"Energy is illustrative: assumes {settings.energy_wh_per_1000_neurons} Wh per 1,000 neurons.")
    return ResourceEstimate(
        tier=tier,
        steps=steps,
        neurons=round(neurons, 3),
        cost_usd=round(neurons / 1000.0 * USD_PER_1000_NEURONS, 6),
        energy_wh=_energy(neurons),
        max_steps=max_steps,
        max_neurons=round(max_neurons, 3),
        max_cost_usd=round(max_neurons / 1000.0 * USD_PER_1000_NEURONS, 6),
        max_energy_wh=_energy(max_neurons),
        saving_percent=round(saving, 1),
        measured=actual_neurons is not None,
        placeholder=placeholder,
        notes=notes,
    )
