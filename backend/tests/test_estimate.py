"""The problem statement: at least two quality tiers and a visible resource estimate per generation."""
from app.estimate import make_estimate


def test_tiers_use_different_effort():
    draft, std, high = make_estimate("draft"), make_estimate("standard"), make_estimate("high")
    assert draft.steps < std.steps < high.steps
    assert draft.neurons < std.neurons < high.neurons
    assert high.saving_percent == 0.0
    assert draft.saving_percent > std.saving_percent > 0


def test_reused_page_saves_everything():
    assert make_estimate("standard", actual_neurons=0.0).saving_percent == 100.0


def test_estimates_are_labelled():
    est = make_estimate("draft")
    assert est.notes and any("estimate" in n.lower() for n in est.notes)
    assert est.placeholder is True  # until data/library/neurons.json is measured
