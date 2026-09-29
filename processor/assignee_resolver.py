from typing import Dict, List, Tuple, Optional

from processor.models import ActionItem


def resolve_assignee(owner_name: str, mapping: Dict[str, str]) -> Optional[str]:
    """Look up a Jira account ID for an owner name (case-insensitive), or None if unmatched."""
    if not owner_name:
        return None
    normalized = owner_name.strip().lower()
    for name, account_id in mapping.items():
        if name.lower() == normalized:
            return account_id
    return None


def resolve_all(items: List[ActionItem], mapping: Dict[str, str]) -> Tuple[List[ActionItem], List[str]]:
    """Resolve assignees for all items in place; return (items, unmatched_owner_names)."""
    unmatched = []
    for item in items:
        account_id = resolve_assignee(item.owner_name, mapping)
        item.assignee_account_id = account_id
        if account_id is None:
            unmatched.append(item.owner_name)
    return items, unmatched
