"""TRACK 2: runs the jobs of a plan. Contract: run_plan(plan_id) fills each job; retry_job(job_id) redoes one.

Per job: reuse library first (0 neurons) -> budget guard -> provider with bounded retries and backoff ->
save to the library. Jobs run in a thread pool of MAX_CONCURRENT_IMAGE_JOBS. A failed job never stops the
others; only failed jobs are retried later.
"""
from __future__ import annotations

import io
import time
from concurrent.futures import ThreadPoolExecutor

from PIL import Image

from app.config import settings
from app.estimate import make_estimate, neurons_for_steps
from app.pipeline import budget, library
from app.providers import get_provider
from app.providers.base import ProviderError
from app.schemas import Job, JobStatus, Plan
from app.store import store

RETRYABLE = {"timeout", "server_error"}
BACKOFF_SECONDS = (1.0, 3.0)


def _asset_path(job: Job):
    folder = settings.outputs_dir / job.plan_id
    folder.mkdir(parents=True, exist_ok=True)
    return folder / f"{job.job_id}.png"


def _to_png(data: bytes) -> bytes:
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return data
    buf = io.BytesIO()
    Image.open(io.BytesIO(data)).convert("RGB").save(buf, format="PNG")
    return buf.getvalue()


def _lib_key(plan: Plan, job: Job) -> tuple[str, str, str, str]:
    r = plan.resolved
    return (
        job.item_key,
        plan.material_type.value,
        str(r["style"].value) if "style" in r else "default",
        str(r["age_band"].value) if "age_band" in r else "any",
    )


def _generate_with_retries(provider, job: Job):
    last: ProviderError | None = None
    for attempt in range(settings.max_retries + 1):
        job.attempts += 1
        try:
            return provider.generate(job.prompt, job.steps)
        except ProviderError as exc:
            last = exc
            if exc.code not in RETRYABLE or attempt >= settings.max_retries:
                break
            time.sleep(BACKOFF_SECONDS[min(attempt, len(BACKOFF_SECONDS) - 1)])
    assert last is not None
    raise last


def _run_one(plan: Plan, job: Job) -> None:
    job.status = JobStatus.processing
    job.error_code = None
    key = _lib_key(plan, job)

    cached = library.find(*key, min_steps=job.steps)
    if cached is not None:
        _asset_path(job).write_bytes(cached)
        job.asset_uri = f"/api/v1/jobs/{job.job_id}/asset"
        job.cache_hit = True
        job.provider = "library"
        job.model = "reuse"
        job.latency_ms = 0
        job.neurons = 0.0
        job.estimate = make_estimate(job.tier, actual_neurons=0.0)
        job.status = JobStatus.completed
        return

    job.cache_hit = False
    provider = get_provider()
    real = provider.name != "mock"
    if real and not budget.allow(neurons_for_steps(job.steps)):
        job.status = JobStatus.failed
        job.error_code = "budget"
        return
    try:
        result = _generate_with_retries(provider, job)
        png = _to_png(result.image_bytes)
    except ProviderError as exc:
        job.status = JobStatus.failed
        job.error_code = exc.code
        return
    except Exception:  # unreadable image bytes
        job.status = JobStatus.failed
        job.error_code = "bad_image"
        return

    _asset_path(job).write_bytes(png)
    neurons = result.neurons if result.neurons is not None else neurons_for_steps(job.steps)
    if real:
        budget.record(neurons)
        library.save(*key, png, {"steps": job.steps, "model": result.model, "provider": provider.name})
    job.asset_uri = f"/api/v1/jobs/{job.job_id}/asset"
    job.provider = provider.name
    job.model = result.model
    job.latency_ms = result.latency_ms
    job.neurons = neurons
    job.estimate = make_estimate(job.tier, actual_neurons=result.neurons)
    job.status = JobStatus.completed


def run_plan(plan_id: str) -> None:
    plan = store.get(plan_id)
    if plan is None:
        return
    todo = [j for j in sorted(plan.jobs, key=lambda j: j.sequence) if j.status in (JobStatus.pending, JobStatus.failed)]
    with ThreadPoolExecutor(max_workers=max(1, settings.max_concurrent_jobs)) as pool:
        list(pool.map(lambda j: _run_one(plan, j), todo))


def retry_job(job_id: str) -> bool:
    found = store.find_job(job_id)
    if found is None:
        return False
    plan, job = found
    if job.status != JobStatus.failed:
        return False
    _run_one(plan, job)
    return True
