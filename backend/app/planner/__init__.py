"""TRACK 1 (Planner and Measurement) owns this package.

Contract: make_plan(request) -> Plan. Must return one Job per page, in order, with unique job_ids,
every resolved field marked user/planner/default, and warnings for anything the teacher should check.
This stub only uses button defaults so the rest of the app runs from day one.
Replace the body, keep the function name and signature.
"""
from __future__ import annotations

import uuid

from app.planner.defaults import DEFAULTS
from app.schemas import GenerationRequest, Job, Plan, ResolvedField


def make_plan(req: GenerationRequest) -> Plan:
    d = DEFAULTS[req.material_type]
    warnings: list[str] = []
    resolved: dict[str, ResolvedField] = {}

    wanted = req.overrides.count if req.overrides and req.overrides.count else None
    if wanted:
        count = min(wanted, d.max_count)
        resolved["count"] = ResolvedField(value=count, source="user")
        if wanted > d.max_count:
            warnings.append(f"Count reduced to the maximum of {d.max_count}.")
    else:
        count = d.count
        resolved["count"] = ResolvedField(value=count, source="default")

    age = req.overrides.age_band if req.overrides and req.overrides.age_band else None
    resolved["age_band"] = ResolvedField(value=age or "6-8", source="user" if age else "default")
    lang = req.overrides.language if req.overrides and req.overrides.language else None
    resolved["language"] = ResolvedField(value=lang or "en", source="user" if lang else "default")
    resolved["style"] = ResolvedField(value="simple_outline", source="default")

    plan_id = uuid.uuid4().hex[:12]
    jobs = [
        Job(
            job_id=f"{plan_id}-{i:02d}",
            plan_id=plan_id,
            sequence=i,
            item_key=f"item-{i}",
            prompt=f"{req.prompt} (item {i})",
            steps=d.steps,
        )
        for i in range(1, count + 1)
    ]
    return Plan(
        plan_id=plan_id,
        material_type=req.material_type,
        original_prompt=req.prompt,
        page_format=d.page_format,  # type: ignore[arg-type]
        profile=d.profile,
        steps=d.steps,
        resolved=resolved,
        warnings=warnings,
        jobs=jobs,
    )
