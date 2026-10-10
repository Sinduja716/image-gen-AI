"""TRACK 1 (Planner and Measurement) owns this package.

Contract: make_plan(request) -> Plan. Must return one Job per page, in order, with unique job_ids,
every resolved field marked user/planner/default, and warnings for anything the teacher should check.
"""
from __future__ import annotations

import json
import re
import uuid
from pathlib import Path

from app.estimate import TIER_STEPS, make_estimate
from app.planner.defaults import DEFAULTS
from app.schemas import GenerationRequest, Job, MaterialType, Plan, ResolvedField


_KEYWORDS = [
    ("poster", MaterialType.poster), ("colouring", MaterialType.colouring), ("coloring", MaterialType.colouring),
    ("flashcard", MaterialType.flashcards), ("worksheet", MaterialType.worksheet),
    ("thumbnail", MaterialType.thumbnail), ("icon", MaterialType.thumbnail),
    ("avatar", MaterialType.thumbnail), ("draft", MaterialType.thumbnail),
]

def _load_wordlists() -> dict[str, list[str]]:
    path = Path(__file__).parent.parent.parent.parent / "data" / "wordlists.json"
    if path.exists():
        return json.loads(path.read_text())
    return {}

WORDLISTS = _load_wordlists()

def resolve_purpose(req: GenerationRequest) -> tuple[MaterialType, list[str]]:
    """Rule-based purpose resolution."""
    warnings = []

    # Check for conflicts in the prompt against explicitly chosen material_type
    prompt_lower = req.prompt.lower()
    inferred_purpose = None
    for word, purpose in _KEYWORDS:
        if word in prompt_lower:
            inferred_purpose = purpose
            break

    if req.material_type != MaterialType.auto:
        if inferred_purpose and inferred_purpose != req.material_type:
            warnings.append(f"Prompt mentions {inferred_purpose.value} but {req.material_type.value} was selected.")
        return req.material_type, warnings

    if inferred_purpose:
        return inferred_purpose, [f"Purpose chosen automatically: {inferred_purpose.value}."]

    return MaterialType.worksheet, ["Purpose guessed (worksheet). Pick a button if that is wrong."]

def parse_count_and_subjects(prompt: str) -> tuple[int | None, list[str] | None, str | None]:
    prompt_lower = prompt.lower()

    # Check "a to z"
    if "a to z" in prompt_lower:
        for category, items in WORDLISTS.items():
            if category in prompt_lower and len(items) == 26:
                return 26, items, category
        if "animals" in prompt_lower and "animals" in WORDLISTS:
             return 26, WORDLISTS["animals"], "animals"
        return 26, None, None

    # Check "1 to 10"
    if "1 to 10" in prompt_lower:
        for category, items in WORDLISTS.items():
            if category in prompt_lower:
                return 10, items[:10], category
        if "numbers" in WORDLISTS:
            return 10, WORDLISTS["numbers"], "numbers"
        return 10, None, None

    # Check explicit count e.g. "5 animals"
    match = re.search(r'\b(\d+)\s+([a-z]+)\b', prompt_lower)
    if match:
        count = int(match.group(1))
        category = match.group(2)
        if category in WORDLISTS:
            return count, WORDLISTS[category][:count], category
        return count, None, None

    # Check bare categories
    for category, items in WORDLISTS.items():
        if category in prompt_lower:
            return len(items), items, category

    return 1, None, None

def make_plan(req: GenerationRequest) -> Plan:
    purpose, warnings = resolve_purpose(req)
    d = DEFAULTS[purpose]
    resolved: dict[str, ResolvedField] = {}

    # Determine counts and subjects from prompt via planner rules
    planner_count, subjects, category = parse_count_and_subjects(req.prompt)

    wanted = req.overrides.count if req.overrides and req.overrides.count else None

    if wanted:
        count = min(wanted, d.max_count)
        resolved["count"] = ResolvedField(value=count, source="user")
        if wanted > d.max_count:
            warnings.append(f"Count reduced to the maximum of {d.max_count}.")
    elif planner_count:
        count = min(planner_count, d.max_count)
        resolved["count"] = ResolvedField(value=count, source="planner")
        if planner_count > d.max_count:
            warnings.append(f"Count reduced to the maximum of {d.max_count}.")
    else:
        count = d.count
        resolved["count"] = ResolvedField(value=count, source="default")

    age = req.overrides.age_band if req.overrides and req.overrides.age_band else None
    resolved["age_band"] = ResolvedField(value=age or "6-8", source="user" if age else "default")
    lang = req.overrides.language if req.overrides and req.overrides.language else None
    resolved["language"] = ResolvedField(value=lang or "en", source="user" if lang else "default")
    resolved["style"] = ResolvedField(value="simple_outline", source="default")

    manual = req.overrides.tier if req.overrides and req.overrides.tier else None
    tier = manual or d.tier
    reason = "Chosen by you." if manual else d.reason
    resolved["tier"] = ResolvedField(value=tier, source="user" if manual else "default")
    estimate = make_estimate(tier)  # type: ignore[arg-type]
    steps = TIER_STEPS[tier]

    plan_id = uuid.uuid4().hex[:12]
    jobs = []

    for i in range(1, count + 1):
        if subjects and i - 1 < len(subjects) and category:
            item_key = f"{category}:{subjects[i-1]}"
            job_prompt = f"{req.prompt} ({subjects[i-1]})"
        else:
            safe_prompt = re.sub(r'[^a-z0-9]+', '-', req.prompt.lower()).strip('-')
            if not safe_prompt:
                safe_prompt = "empty"
            item_key = f"free:{safe_prompt}-{i}"
            job_prompt = f"{req.prompt} (item {i})"

        jobs.append(Job(
            job_id=f"{plan_id}-{i:02d}",
            plan_id=plan_id,
            sequence=i,
            item_key=item_key,
            prompt=job_prompt,
            steps=steps,
            tier=tier,  # type: ignore[arg-type]
            estimate=estimate,
        ))

    return Plan(
        plan_id=plan_id,
        material_type=purpose,
        original_prompt=req.prompt,
        page_format=d.page_format,  # type: ignore[arg-type]
        profile=d.profile,
        steps=steps,
        tier=tier,  # type: ignore[arg-type]
        tier_reason=reason,
        estimate=estimate,
        resolved=resolved,
        warnings=warnings,
        jobs=jobs,
    )
