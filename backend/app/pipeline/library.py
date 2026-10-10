"""TRACK 2: the reuse library (the project's "RAG"). Finds an already generated image for the same item
instead of generating again: 0 neurons, instant.

Exact-match key: (subject, material_type, style, age_band). `subject` is the planner's item_key, so the
planner (Track 1) must give meaningful keys such as "animal:elephant". Placeholder keys like "item-3" are
never reused (see is_reusable).  find() only returns an image generated with at least `min_steps` steps, so
a draft picture is never silently reused for a high-quality request.
Storage: sqlite3 file data/library/library.db + PNG files in data/library/images/ (standard library only).
"""
from __future__ import annotations

import hashlib
import json
import re
import sqlite3
import threading
import time

from app.config import settings

_lock = threading.Lock()
_SCHEMA = """CREATE TABLE IF NOT EXISTS images (
    subject TEXT NOT NULL, material_type TEXT NOT NULL, style TEXT NOT NULL, age_band TEXT NOT NULL,
    file TEXT NOT NULL, steps INTEGER NOT NULL DEFAULT 0, meta TEXT NOT NULL DEFAULT '{}', created REAL NOT NULL,
    PRIMARY KEY (subject, material_type, style, age_band))"""


def _norm(value: str) -> str:
    return re.sub(r"\s+", " ", str(value).strip().lower())


def is_reusable(subject: str) -> bool:
    """False for empty or placeholder keys (item-1, item-2 ...) that would match unrelated prompts."""
    s = _norm(subject)
    return bool(s) and not re.fullmatch(r"item[-_ ]?\d+", s)


def _db() -> sqlite3.Connection:
    settings.library_dir.mkdir(parents=True, exist_ok=True)
    (settings.library_dir / "images").mkdir(exist_ok=True)
    con = sqlite3.connect(settings.library_dir / "library.db", timeout=10)
    con.execute(_SCHEMA)
    return con


def _key(subject: str, material_type: str, style: str, age_band: str) -> tuple[str, str, str, str]:
    return _norm(subject), _norm(material_type), _norm(style), _norm(age_band)


def find(subject: str, material_type: str, style: str, age_band: str, min_steps: int = 0) -> bytes | None:
    if not is_reusable(subject):
        return None
    with _lock, _db() as con:
        row = con.execute(
            "SELECT file, steps FROM images WHERE subject=? AND material_type=? AND style=? AND age_band=?",
            _key(subject, material_type, style, age_band),
        ).fetchone()
    if row is None or row[1] < min_steps:
        return None
    path = settings.library_dir / "images" / row[0]
    try:
        return path.read_bytes()
    except OSError:
        return None


def save(subject: str, material_type: str, style: str, age_band: str, image: bytes, meta: dict) -> None:
    if not is_reusable(subject):
        return None
    key = _key(subject, material_type, style, age_band)
    name = hashlib.sha1("|".join(key).encode()).hexdigest()[:16] + ".png"
    with _lock:
        (settings.library_dir / "images").mkdir(parents=True, exist_ok=True)
        (settings.library_dir / "images" / name).write_bytes(image)
        with _db() as con:
            con.execute(
                "INSERT OR REPLACE INTO images VALUES (?,?,?,?,?,?,?,?)",
                (*key, name, int(meta.get("steps", 0)), json.dumps(meta), time.time()),
            )
    return None


def count() -> int:
    with _lock, _db() as con:
        return con.execute("SELECT COUNT(*) FROM images").fetchone()[0]
