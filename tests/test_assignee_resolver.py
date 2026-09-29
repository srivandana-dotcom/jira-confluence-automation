from processor.assignee_resolver import resolve_all, resolve_assignee
from processor.models import ActionItem

MAPPING = {
    "Alex": "acc-alex-1",
    "Priya": "acc-priya-1",
    "Al": "acc-alex-1",  # alias
}


def test_resolve_assignee_matched_name():
    assert resolve_assignee("Alex", MAPPING) == "acc-alex-1"


def test_resolve_assignee_unmatched_name():
    assert resolve_assignee("Unknown Person", MAPPING) is None


def test_resolve_assignee_alias_handling():
    assert resolve_assignee("Al", MAPPING) == "acc-alex-1"


def test_resolve_all_flags_unmatched():
    items = [
        ActionItem(task_summary="Task 1", owner_name="Priya", source_meeting="m1"),
        ActionItem(task_summary="Task 2", owner_name="Ghost", source_meeting="m1"),
    ]

    resolved, unmatched = resolve_all(items, MAPPING)

    assert resolved[0].assignee_account_id == "acc-priya-1"
    assert resolved[1].assignee_account_id is None
    assert unmatched == ["Ghost"]
