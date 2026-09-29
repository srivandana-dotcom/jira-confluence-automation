from abc import ABC, abstractmethod
from typing import List

from processor.models import ActionItem


class ActionItemExtractor(ABC):
    """Pluggable interface for extracting action items from a transcript."""

    @abstractmethod
    def extract(self, transcript_text: str, source_meeting: str) -> List[ActionItem]:
        ...


class MockActionItemExtractor(ActionItemExtractor):
    """Deterministic stand-in for a real LLM provider, for development/testing."""

    def extract(self, transcript_text: str, source_meeting: str) -> List[ActionItem]:
        return [
            ActionItem(
                task_summary="Renew firmware signing certificate",
                owner_name="Alex",
                source_meeting=source_meeting,
                raw_text="Alex will renew the firmware signing certificate before Friday.",
                due_date="2026-10-02",
            ),
            ActionItem(
                task_summary="Review pairing retry edge cases",
                owner_name="Priya",
                source_meeting=source_meeting,
                raw_text="Priya is going to review the remaining pairing retry edge cases.",
            ),
        ]
