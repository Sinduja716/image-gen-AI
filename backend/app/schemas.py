"""FROZEN DATA CONTRACT. OWNER: integrator only.

Every track imports these models. Changing a field here breaks the other two tracks, so
nobody except the integrator edits this file. tests/test_contract_snapshot.py fails if it changes.
"""
from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class MaterialType(str, Enum):
    colouring = "colouring"
    worksheet = "worksheet"
    flashcards = "flashcards"
    poster = "poster"


class JobStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


PageFormat = Literal["A4_PORTRAIT", "A3_PORTRAIT", "CARD_3X5"]


class Overrides(BaseModel):
    """Values the teacher edited on the summary card."""

    count: int | None = Field(default=None, ge=1, le=30)
    age_band: str | None = None
    language: str | None = None


class GenerationRequest(BaseModel):
    material_type: MaterialType
    prompt: str = Field(min_length=1, max_length=500)
    overrides: Overrides | None = None


class ResolvedField(BaseModel):
    """One value on the summary card and where it came from."""

    value: str | int
    source: Literal["user", "planner", "default"]


class Job(BaseModel):
    job_id: str
    plan_id: str
    sequence: int
    item_key: str
    prompt: str
    status: JobStatus = JobStatus.pending
    attempts: int = 0
    steps: int = 4
    asset_uri: str | None = None
    error_code: str | None = None
    cache_hit: bool = False
    provider: str | None = None
    model: str | None = None
    latency_ms: int | None = None
    neurons: float | None = None


class Plan(BaseModel):
    plan_id: str
    material_type: MaterialType
    original_prompt: str
    page_format: PageFormat
    profile: str
    steps: int
    resolved: dict[str, ResolvedField]
    warnings: list[str] = Field(default_factory=list)
    jobs: list[Job]


class StatusResponse(BaseModel):
    plan_id: str
    total: int
    completed: int
    failed: int
    pending: int
    processing: int
    complete: bool
    jobs: list[Job]


class GenerateResponse(BaseModel):
    plan_id: str
    accepted: bool


class ExportResponse(BaseModel):
    plan_id: str
    download_url: str


class MetricsResponse(BaseModel):
    plan_id: str
    image_calls: int
    cache_hits: int
    neurons_used: float | None = None
    estimated_cost_usd: float | None = None
    baseline_neurons: float | None = None
    baseline_cost_usd: float | None = None
    saving_percent: float | None = None
    notes: list[str] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    code: str
    message: str
