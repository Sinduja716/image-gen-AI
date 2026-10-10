import time

from app.metrics import compute_metrics
from app.schemas import Plan


def _finished_plan(client):
    p = client.post("/api/v1/plans", json={"material_type": "colouring", "prompt": "farm animals A to Z"}).json()
    client.post(f"/api/v1/plans/{p['plan_id']}/generate")
    for _ in range(120):
        data = client.get(f"/api/v1/plans/{p['plan_id']}").json()
        if all(j["status"] in ("completed", "failed") for j in data["jobs"]):
            return Plan.model_validate(data)
        time.sleep(0.25)
    raise AssertionError("plan did not finish")


def test_time_fields_are_filled(client):
    m = compute_metrics(_finished_plan(client))
    assert m.seconds_used is not None and m.baseline_seconds
    assert 0 < m.time_saving_percent < 100  # draft pages are faster than maximum quality


def test_reused_page_counts_zero_seconds_and_zero_neurons(client):
    plan = _finished_plan(client)
    before = compute_metrics(plan)
    plan.jobs[0].cache_hit = True
    after = compute_metrics(plan)
    assert after.neurons_used < before.neurons_used
    assert after.seconds_used < before.seconds_used
    assert after.time_saving_percent > before.time_saving_percent


def test_saving_split_note_present_and_adds_up(client):
    plan = _finished_plan(client)
    plan.jobs[0].cache_hit = True
    m = compute_metrics(plan)
    assert any("lower tiers" in n and "reusing" in n for n in m.notes)