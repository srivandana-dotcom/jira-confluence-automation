# Module 08 Completion Report

## Tracked Files
```
.gitignore
Hello World - Copy.txt
Hello World.txt
PROJECT_IDEAS.md
README.md
calculator.py
calculator/main.py
calculator/operations.py
csv_to_json.py
hello.txt
main.py
notes.md
project_spec.md
weekly-status-report-template.md
work/module-03-report.md
```

## Spec Commit History
```
5f037e3 (HEAD -> master) Committed on Sep 28
```

## project_spec.md Contents
```markdown
# Technical Specification: Meeting Notes → Jira Action Item Processor

## 1. Overview
A tool for the **VER-IOT** project (10-person team) that ingests meeting transcripts, uses AI to extract action items, and creates Jira tickets after manual review — reducing the manual overhead of turning meeting discussions into tracked work.

## 2. Goals
- Eliminate manual re-typing of action items from meetings into Jira.
- Reliably map spoken owners' names to Jira assignees.
- Prevent duplicate ticket creation if the same transcript/notes are processed more than once.
- Keep a human in the loop before tickets are created.

## 3. Input
- **Source:** Raw meeting transcript exported from Zoom/Teams (plain text file).
- **Format:** Free-form prose (not structured markers) — reflects natural conversational speech.
- **Trigger:** On-demand — run manually after each meeting by pointing the script at the exported transcript file.

## 4. Processing Pipeline
1. **Load transcript** from a local file path provided as input.
2. **AI/LLM extraction** — the transcript is sent to an LLM which identifies discrete action items and returns structured data for each:
   - Task description
   - Owner (as named in the transcript, e.g., "John")
   - Due date, if mentioned (optional)
   - Provider is not yet decided (OpenAI, Azure OpenAI, or local/open-source model) — the extraction step should be built behind a pluggable interface so the provider can be swapped without changing the rest of the pipeline.
3. **Assignee resolution** — each extracted owner name is looked up in a config file mapping team member names to Jira account IDs/emails. Unmatched names are flagged for manual resolution during review.
4. **Duplicate check** — extracted items are compared against a local processed-items log/database (keyed by transcript source + item text) to skip anything already turned into a ticket.
5. **Review step** — remaining new items are presented in a **terminal prompt**, allowing the user to approve/reject each item (or approve all) before ticket creation.
6. **Ticket creation** — approved items are created as Jira **Task** issues in the **VER-IOT** project, left in the **backlog** (unscheduled, for later triage into a sprint).
7. **Log update** — newly created items are recorded in the processed-items log to prevent future duplication.

## 5. Data Model

### Extracted Action Item (in-memory / pre-Jira)
| Field | Description |
|---|---|
| `raw_text` | Original excerpt or sentence the item was derived from (internal use only, not stored on the ticket) |
| `task_summary` | Short actionable description |
| `owner_name` | Name as mentioned in transcript |
| `assignee_account_id` | Resolved Jira account ID (or `null` if unmatched) |
| `due_date` | Optional, if mentioned |
| `source_meeting` | Transcript filename/date, for the processed-items log |

### Jira Ticket Fields
| Field | Value |
|---|---|
| Project | `VER-IOT` |
| Issue type | Task |
| Summary | `task_summary` |
| Description | Task summary only (no transcript quote/context included) |
| Assignee | Resolved via config mapping (left unassigned if no match) |
| Sprint | None (backlog) |

## 6. Duplicate Prevention
- A local log/database (e.g., a JSON or SQLite file) tracks which action items — identified by transcript source + normalized item text — have already been turned into tickets.
- On each run, extracted items are diffed against this log before reaching the review step, so already-processed items are never shown again.

## 7. Assignee Mapping
- A config file (e.g., `assignee_mapping.json` or `.yaml`) maps team member names (and known aliases/nicknames) to Jira account IDs or emails.
- This file is maintained manually and updated as team membership changes.
- Names with no match are surfaced during the review step rather than silently dropped or guessed.

## 8. Review Workflow
- After extraction, resolution, and duplicate filtering, the script prints each candidate action item to the terminal with:
  - Task summary
  - Resolved assignee (or "unmatched")
  - Due date (if any)
- User approves individually or all at once before any Jira API call is made.

## 9. Configuration
- `.env` — Jira Cloud credentials (email + API token), consistent with existing workspace convention.
- Assignee mapping file — name-to-Jira-account lookup table.
- LLM provider credentials — to be added once a provider is selected.

## 10. Architecture / Components
- `transcript_loader` — reads the transcript file.
- `action_item_extractor` — pluggable interface around the chosen LLM provider; returns structured action items.
- `assignee_resolver` — maps owner names to Jira account IDs using the config file.
- `duplicate_tracker` — reads/writes the processed-items log.
- `review_cli` — terminal-based approval flow.
- `jira_client` — creates approved items as Jira Task issues via REST API.

## 11. Tech Stack
- **Language:** Python, consistent with the rest of this workspace.
- **Libraries:** `requests` (Jira REST API), `python-dotenv` (credentials); LLM SDK to be added once a provider is chosen.

## 12. Open Items
- Select the AI/LLM provider for extraction (OpenAI, Azure OpenAI, or local model).
- Build/populate the assignee name → Jira account ID mapping file with the 10 team members.
- Confirm Jira project key is exactly `VER-IOT` (or the actual key used in your Jira instance).
- Decide the concrete format for the duplicate-tracking log (JSON file vs. SQLite).
```
