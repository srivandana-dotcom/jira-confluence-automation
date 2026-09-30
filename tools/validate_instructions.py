"""Run the objective (structural) checks from validate-instructions.agent.md
against each instruction file, one at a time.

Only the checks that can be verified mechanically are automated here (size,
frontmatter presence, catalog sync). Whether a file covers a single
responsibility is a judgment call and is left to manual/agent review.
"""

import argparse
import re
from pathlib import Path

LINE_LIMIT = 700
EXCLUDED_FILES = {"main.agent.md", "validate-instructions.agent.md"}


def find_instruction_files(instructions_dir: Path) -> list[Path]:
    return sorted(
        p for p in instructions_dir.glob("*.agent.md") if p.name not in EXCLUDED_FILES
    )


def has_frontmatter(text: str) -> bool:
    return text.startswith("---\n") and "\n---\n" in text[4:]


def is_in_catalog(catalog_text: str, filename: str) -> bool:
    return f"]({filename})" in catalog_text or f"](./{filename})" in catalog_text


def check_file(path: Path, catalog_text: str) -> dict:
    text = path.read_text(encoding="utf-8")
    line_count = len(text.splitlines())
    return {
        "file": path.name,
        "lines": line_count,
        "over_limit": line_count > LINE_LIMIT,
        "has_frontmatter": has_frontmatter(text),
        "in_catalog": is_in_catalog(catalog_text, path.name),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Check each instruction file against validate-instructions.agent.md's structural rules."
    )
    parser.add_argument(
        "--instructions-dir",
        default="instructions",
        help="Path to the instructions directory (default: instructions)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    instructions_dir = Path(args.instructions_dir)
    catalog_path = instructions_dir / "main.agent.md"
    catalog_text = catalog_path.read_text(encoding="utf-8") if catalog_path.exists() else ""

    files = find_instruction_files(instructions_dir)
    if not files:
        print(f"No instruction files found in {instructions_dir}")
        return

    header = f"{'File':<45} {'Lines':>6} {'Size OK':>8} {'Frontmatter':>12} {'In Catalog':>11}"
    print(header)
    print("-" * len(header))
    for path in files:
        result = check_file(path, catalog_text)
        print(
            f"{result['file']:<45} {result['lines']:>6} "
            f"{'No' if result['over_limit'] else 'Yes':>8} "
            f"{'Yes' if result['has_frontmatter'] else 'No':>12} "
            f"{'Yes' if result['in_catalog'] else 'No':>11}"
        )

    print(
        "\nNote: Single Responsibility Principle compliance requires manual/agent "
        "judgment of workflow intent — not checked by this script."
    )


if __name__ == "__main__":
    main()
