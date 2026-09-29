from dataclasses import dataclass
from typing import Optional


@dataclass
class ActionItem:
    """A single action item extracted from a meeting transcript."""

    task_summary: str
    owner_name: str
    source_meeting: str
    raw_text: str = ""
    due_date: Optional[str] = None
    assignee_account_id: Optional[str] = None
