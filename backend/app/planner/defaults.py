"""Button defaults. TRACK 1 owns this file. Values are proposals: tune after calibration."""
from dataclasses import dataclass

from app.schemas import MaterialType


@dataclass(frozen=True)
class ButtonDefaults:
    page_format: str
    count: int
    max_count: int
    profile: str
    steps: int


DEFAULTS: dict[MaterialType, ButtonDefaults] = {
    MaterialType.colouring: ButtonDefaults("A4_PORTRAIT", 1, 30, "colouring_basic", 4),
    MaterialType.worksheet: ButtonDefaults("A4_PORTRAIT", 1, 30, "worksheet_basic", 4),
    MaterialType.flashcards: ButtonDefaults("CARD_3X5", 6, 30, "flashcard_basic", 4),
    MaterialType.poster: ButtonDefaults("A3_PORTRAIT", 1, 3, "poster_high", 8),
}
