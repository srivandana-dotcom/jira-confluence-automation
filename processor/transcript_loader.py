from pathlib import Path


def load_transcript(path: str) -> str:
    """Read a meeting transcript file and return its raw text."""
    return Path(path).read_text(encoding="utf-8")
