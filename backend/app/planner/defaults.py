"""Purpose defaults. TRACK 1 owns this file. Tier = how much compute the purpose deserves.
Calibration (docs/track1) may change a purpose's tier, but keep at least two different tiers in use."""
from dataclasses import dataclass

from app.schemas import MaterialType


@dataclass(frozen=True)
class ButtonDefaults:
    page_format: str
    count: int
    max_count: int
    profile: str
    tier: str
    reason: str


DEFAULTS: dict[MaterialType, ButtonDefaults] = {
    MaterialType.colouring: ButtonDefaults(
        "A4_PORTRAIT", 1, 30, "colouring_basic", "draft",
        "Colouring pages need clean outlines, not fine detail, so the lowest effort is enough."),
    MaterialType.worksheet: ButtonDefaults(
        "A4_PORTRAIT", 1, 30, "worksheet_basic", "standard",
        "Worksheet pictures must be clear but sit small on the page."),
    MaterialType.flashcards: ButtonDefaults(
        "CARD_3X5", 6, 30, "flashcard_basic", "standard",
        "Flashcard pictures are printed small but must be instantly recognisable."),
    MaterialType.poster: ButtonDefaults(
        "A3_PORTRAIT", 1, 3, "poster_high", "high",
        "Posters are printed large and viewed from a distance, so detail matters."),
    MaterialType.thumbnail: ButtonDefaults(
        "SQUARE_SMALL", 1, 12, "thumbnail_draft", "draft",
        "Thumbnails and icons are tiny, so a quick draft is enough."),
}
