from unittest.mock import patch

from processor.models import ActionItem
from processor.review_cli import review_items


def _item(summary):
    return ActionItem(task_summary=summary, owner_name="Alex", source_meeting="m1")


def test_review_items_approve_all():
    items = [_item("Task A"), _item("Task B")]

    with patch("builtins.input", return_value="y"):
        approved = review_items(items)

    assert approved == items


def test_review_items_reject_all():
    items = [_item("Task A")]

    with patch("builtins.input", return_value="n"):
        approved = review_items(items)

    assert approved == []


def test_review_items_individual_approval():
    items = [_item("Task A"), _item("Task B")]

    with patch("builtins.input", side_effect=["i", "y", "n"]):
        approved = review_items(items)

    assert approved == [items[0]]


def test_review_items_empty_list_returns_empty():
    assert review_items([]) == []
