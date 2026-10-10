"""TRACK 2: the reuse library. Contract: find(...) returns saved image bytes or None; save(...) stores them.
Match on subject + material type + style + age band. This stub never finds anything."""
from __future__ import annotations


def find(subject: str, material_type: str, style: str, age_band: str) -> bytes | None:
    return None


def save(subject: str, material_type: str, style: str, age_band: str, image: bytes, meta: dict) -> None:
    return None
