"""TRACK 2: runs the jobs of a plan. Contract: run_plan(plan_id) fills each job; retry_job(job_id) redoes one.
This stub runs sequentially with the configured provider. Add: library check, concurrency limit (settings),
bounded retries with backoff, budget guard, timeouts, and storing metrics fields on each Job."""
from __future__ import annotations

from app.config import settings
from app.estimate import make_estimate
from app.providers import get_provider
from app.providers.base import ProviderError
from app.schemas import Job, JobStatus
from app.store import store


def _asset_path(job: Job):
    folder = settings.outputs_dir / job.plan_id
    folder.mkdir(parents=True, exist_ok=True)
    return folder / f"{job.job_id}.png"


def _run_one(job: Job) -> None:
    provider = get_provider()
    job.status = JobStatus.processing
    job.attempts += 1
    try:
        result = provider.generate(job.prompt, job.steps)
    except ProviderError as exc:
        job.status = JobStatus.failed
        job.error_code = exc.code
        return
    path = _asset_path(job)
    path.write_bytes(result.image_bytes)
    job.asset_uri = f"/api/v1/jobs/{job.job_id}/asset"
    job.provider = provider.name
    job.model = result.model
    job.latency_ms = result.latency_ms
    job.neurons = result.neurons
    job.estimate = make_estimate(job.tier, actual_neurons=result.neurons)
    job.error_code = None
    job.status = JobStatus.completed


def run_plan(plan_id: str) -> None:
    plan = store.get(plan_id)
    if plan is None:
        return
    for job in sorted(plan.jobs, key=lambda j: j.sequence):
        if job.status in (JobStatus.pending, JobStatus.failed):
            _run_one(job)


def retry_job(job_id: str) -> bool:
    found = store.find_job(job_id)
    if found is None:
        return False
    _, job = found
    if job.status != JobStatus.failed:
        return False
    _run_one(job)
    return True
