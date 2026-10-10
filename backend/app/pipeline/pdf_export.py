"""TRACK 2: PDF export with ReportLab. Contract: build_pdf(plan) -> path of the PDF.
Stub: one image per page, correct page size. Add: titles and words from templates, registered font for
non-Latin text, text-fit checks, and the 3x5 inch card layout."""
from __future__ import annotations

from pathlib import Path

from reportlab.lib.pagesizes import A3, A4
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

from app.config import settings
from app.schemas import JobStatus, Plan

PAGE_SIZES = {"A4_PORTRAIT": A4, "A3_PORTRAIT": A3, "CARD_3X5": (3 * inch, 5 * inch)}


def build_pdf(plan: Plan) -> Path:
    folder = settings.outputs_dir / plan.plan_id
    folder.mkdir(parents=True, exist_ok=True)
    out = folder / f"{plan.plan_id}.pdf"
    size = PAGE_SIZES[plan.page_format]
    pdf = canvas.Canvas(str(out), pagesize=size)
    margin = 0.1 * min(size)
    for job in sorted(plan.jobs, key=lambda j: j.sequence):
        if job.status != JobStatus.completed:
            continue
        img_path = folder / f"{job.job_id}.png"
        if img_path.exists():
            w, h = size[0] - 2 * margin, size[1] - 2 * margin
            pdf.drawImage(ImageReader(str(img_path)), margin, margin, w, h, preserveAspectRatio=True, anchor="c")
        pdf.showPage()
    pdf.save()
    return out
