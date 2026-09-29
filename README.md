# Calculator

A small Python calculator example with a `Calculator` class.

## Development Setup

```bash
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

## `Calculator`

The `Calculator` class provides `multiply(first, second)` and
`divide(first, second)` methods.

```python
from calculator import Calculator

calculator = Calculator()
result = calculator.multiply(6, 7)
print(result)  # 42
```

- `first`: The first number.
- `second`: The second number.
- Returns: The product of `first` and `second`.

## Run the demonstration

```bash
python main.py
```

Output:

```text
6 * 7 = 42
```

## Meeting Notes → Jira Action Item Processor

Ingests a meeting transcript, extracts action items, resolves owners to Jira assignees, filters out already-processed items, and creates approved items as Jira Task issues in the `VER-IOT` project backlog. See [project_spec.md](./project_spec.md) for the full design and [backlog.md](./backlog.md) for implementation status.

**Prerequisites:** Python 3.9+, dependencies from `requirements.txt` (`requests`, `python-dotenv`, `pytest`).

### Environment setup

1. Copy `.env.example` to `.env` and fill in your Jira Cloud credentials (`JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`). Without these, the tool runs in dry-run mode (prints what it would create, no tickets).
2. Edit `config/assignee_mapping.json` — replace each placeholder with the real Jira account ID for that team member. Add aliases as extra keys pointing to the same account ID.
3. `data/processed_items.json` is the duplicate-tracking log. It starts empty (`[]`) and is updated automatically as tickets are created — no manual setup needed.

### Running the tool end-to-end

```bash
pip install -r requirements.txt
python run_processor.py path/to/transcript.txt
```

The script loads the transcript, extracts action items (currently via a mock extractor — see Known limitations), resolves assignees, skips anything already logged as processed, prompts you to approve/reject each remaining item in the terminal, then creates a Jira Task per approved item (or prints a dry-run line if Jira credentials aren't configured).

### Known limitations / open items

- **LLM provider not yet selected** — `action_item_extractor` currently uses `MockActionItemExtractor` (fixed sample items) behind the pluggable `ActionItemExtractor` interface. Swap in a real provider (OpenAI, Azure OpenAI, or local model) without changing the rest of the pipeline.
- **Confirm the exact Jira project key** — code defaults to `VER-IOT`; verify this matches your Jira instance before running against production.
- Duplicate tracking uses a flat JSON file (`data/processed_items.json`); revisit if the processed-items list grows large enough to warrant SQLite.

