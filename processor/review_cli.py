from typing import List

from processor.models import ActionItem


def _print_item(item: ActionItem) -> None:
    assignee = item.assignee_account_id or "unmatched"
    due = item.due_date or "no due date"
    print(f"- {item.task_summary} | assignee: {assignee} | due: {due}")


def review_items(items: List[ActionItem]) -> List[ActionItem]:
    """Present candidate items in the terminal and collect approve/reject input."""
    if not items:
        print("No new action items to review.")
        return []

    print(f"\n{len(items)} candidate action item(s):")
    for index, item in enumerate(items, start=1):
        print(f"\n[{index}/{len(items)}]")
        _print_item(item)

    choice = input("\nApprove all? (y/n/i = decide individually): ").strip().lower()
    if choice == "y":
        return list(items)
    if choice == "n":
        return []

    approved = []
    for item in items:
        _print_item(item)
        answer = input("Approve this item? (y/n): ").strip().lower()
        if answer == "y":
            approved.append(item)
    return approved
