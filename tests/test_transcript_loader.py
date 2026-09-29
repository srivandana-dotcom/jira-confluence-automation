import pytest

from processor.transcript_loader import load_transcript


def test_load_transcript_valid_file(tmp_path):
    transcript_file = tmp_path / "meeting.txt"
    transcript_file.write_text("Alex will renew the certificate.", encoding="utf-8")

    content = load_transcript(str(transcript_file))

    assert content == "Alex will renew the certificate."


def test_load_transcript_missing_file(tmp_path):
    missing_file = tmp_path / "does-not-exist.txt"

    with pytest.raises(FileNotFoundError):
        load_transcript(str(missing_file))
