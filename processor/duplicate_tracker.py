import json
import re
from pathlib import Path
from typing import Iterable, List, Set

from processor.models import ActionItem


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _key(source_meeting: str, task_summary: str) -> str:
    return f"{source_meeting}::{_normalize(task_summary)}"


class DuplicateTracker:
    """Tracks which action items have already been turned into Jira tickets."""

    def __init__(self, log_path: str):
        self.log_path = Path(log_path)
        self._processed: Set[str] = self._load()

    def is_duplicate(self, item: ActionItem) -> bool:
        return _key(item.source_meeting, item.task_summary) in self._processed

    def record(self, item: ActionItem) -> None:
        self._processed.add(_key(item.source_meeting, item.task_summary))
        self._save()

    def filter_new(self, items: Iterable[ActionItem]) -> List[ActionItem]:
        return [item for item in items if not self.is_duplicate(item)]

    def _load(self) -> Set[str]:
        if not self.log_path.exists():
            return set()
        return set(json.loads(self.log_path.read_text(encoding="utf-8")))

    def _save(self) -> None:
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        self.log_path.write_text(json.dumps(sorted(self._processed), indent=2), encoding="utf-8")
