"""Read and print a meeting transcript file from a given path."""

import argparse
from pathlib import Path


def load_transcript(path: str, encoding: str = "utf-8") -> str:
    """Return the raw text content of a transcript file at the given path."""
    return Path(path).read_text(encoding=encoding)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Read and print a transcript file.")
    parser.add_argument("path", help="Path to the transcript file")
    parser.add_argument("--encoding", default="utf-8", help="Text encoding to use (default: utf-8)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    transcript = load_transcript(args.path, args.encoding)
    print(transcript)


if __name__ == "__main__":
    main()
