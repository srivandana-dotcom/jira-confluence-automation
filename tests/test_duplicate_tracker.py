from processor.duplicate_tracker import DuplicateTracker
from processor.models import ActionItem


def test_duplicate_tracker_new_item_is_not_duplicate(tmp_path):
    tracker = DuplicateTracker(str(tmp_path / "log.json"))
    item = ActionItem(task_summary="Renew cert", owner_name="Alex", source_meeting="m1")

    assert tracker.is_duplicate(item) is False


def test_duplicate_tracker_recorded_item_is_duplicate(tmp_path):
    log_path = tmp_path / "log.json"
    tracker = DuplicateTracker(str(log_path))
    item = ActionItem(task_summary="Renew cert", owner_name="Alex", source_meeting="m1")

    tracker.record(item)
    reloaded = DuplicateTracker(str(log_path))

    assert reloaded.is_duplicate(item) is True


def test_duplicate_tracker_filter_new_excludes_processed(tmp_path):
    tracker = DuplicateTracker(str(tmp_path / "log.json"))
    old_item = ActionItem(task_summary="Renew cert", owner_name="Alex", source_meeting="m1")
    new_item = ActionItem(task_summary="Ship report", owner_name="Priya", source_meeting="m1")
    tracker.record(old_item)

    remaining = tracker.filter_new([old_item, new_item])

    assert remaining == [new_item]
