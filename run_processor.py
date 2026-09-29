import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

from processor.action_item_extractor import MockActionItemExtractor
from processor.assignee_resolver import resolve_all
from processor.duplicate_tracker import DuplicateTracker
from processor.jira_client import JiraClient, JiraClientError
from processor.review_cli import review_items
from processor.transcript_loader import load_transcript

ASSIGNEE_MAPPING_PATH = "config/assignee_mapping.json"
DUPLICATE_LOG_PATH = "data/processed_items.json"


def load_assignee_mapping(path: str) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def run(transcript_path: str) -> None:
    load_dotenv()

    transcript_text = load_transcript(transcript_path)
    source_meeting = Path(transcript_path).name

    extractor = MockActionItemExtractor()
    items = extractor.extract(transcript_text, source_meeting)

    mapping = load_assignee_mapping(ASSIGNEE_MAPPING_PATH)
    items, unmatched = resolve_all(items, mapping)
    if unmatched:
        print(f"Unmatched owner names (flagged for manual resolution): {', '.join(unmatched)}")

    tracker = DuplicateTracker(DUPLICATE_LOG_PATH)
    new_items = tracker.filter_new(items)

    approved = review_items(new_items)
    if not approved:
        print("No items approved. Nothing sent to Jira.")
        return

    email = os.getenv("JIRA_EMAIL")
    token = os.getenv("JIRA_API_TOKEN")
    base_url = os.getenv("JIRA_BASE_URL")

    if not (email and token and base_url):
        print("\nJira credentials not configured (.env) — dry run only, no tickets created:")
        for item in approved:
            print(f"  [DRY RUN] Would create Jira Task: {item.task_summary}")
        return

    client = JiraClient(base_url=base_url, email=email, api_token=token)
    for item in approved:
        try:
            ticket = client.create_task(item)
            print(f"Created {ticket.get('key', ticket)} for: {item.task_summary}")
            tracker.record(item)
        except JiraClientError as exc:
            print(f"Failed to create ticket for '{item.task_summary}': {exc}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python run_processor.py <transcript_file>")
        sys.exit(1)
    run(sys.argv[1])
