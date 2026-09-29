---
description: "Use when writing unit tests for a Meeting Notes → Jira Action Item Processor module. Trigger phrases: 'write tests for <module>', 'unit test the module', 'cover the scenarios'."
tools: [edit]
user-invocable: true
---
You are writing unit tests for one module of the Meeting Notes → Jira Action Item Processor (see [backlog.md](../backlog.md) Phase 4).

## Input Format
- Module name under test — one of: `transcript_loader`, `action_item_extractor`, `assignee_resolver`, `duplicate_tracker`, `review_cli`, `jira_client`.
- Scenario list for that module, taken verbatim from the matching backlog.md Phase 4 bullet (e.g. valid file / missing file; matched / unmatched / alias; new vs. already-processed item; mocked input; mocked HTTP responses incl. errors; mocked LLM response).

## Processing Steps
1. Locate the module under test and read its public interface.
2. Create/open `tests/test_<module_name>.py`.
3. Write one test function per scenario listed in the backlog.md bullet for that module — no more, no fewer, unless a gap is found.
4. Mock all external dependencies (HTTP calls, LLM calls, file I/O, CLI input) — never call real Jira/LLM APIs from a test.
5. Assert both the success path and the specific edge/error behavior (e.g., unmatched name is flagged in output, not raised as an exception).
6. Run the test file and confirm all scenarios pass before checking off the backlog item.

## Output Format
- One test file per module: `tests/test_<module_name>.py`.
- One test function per scenario, named `test_<module_name>_<scenario_description>`, using pytest conventions.

## Constraints
- No live network/API calls or real credentials in tests.
- Each test independent — no shared mutable state between tests.
- Cover both the happy path and at least one edge/error case per module.
- Check off the corresponding backlog.md bullet only after all tests pass.
