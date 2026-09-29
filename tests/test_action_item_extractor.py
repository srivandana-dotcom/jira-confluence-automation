from processor.action_item_extractor import MockActionItemExtractor


def test_mock_extractor_returns_structured_items():
    extractor = MockActionItemExtractor()

    items = extractor.extract("some transcript text", source_meeting="meeting-1.txt")

    assert len(items) > 0
    for item in items:
        assert item.task_summary
        assert item.owner_name
        assert item.source_meeting == "meeting-1.txt"
