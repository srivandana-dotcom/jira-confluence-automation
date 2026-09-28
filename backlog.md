# Implementation Backlog: Meeting Notes → Jira Action Item Processor

Derived from [project_spec.md](../project_spec.md). Core Features are prioritized first (end-to-end flow with mocked extraction/Jira), followed by real Integration, then Testing and Documentation.

## Phase 1: Setup
- [ ] Create module layout: `transcript_loader`, `action_item_extractor`, `assignee_resolver`, `duplicate_tracker`, `review_cli`, `jira_client`
- [ ] Add `requests` and `python-dotenv` to `requirements.txt`
- [ ] Create `.env.example` with placeholders for Jira Cloud email + API token
- [ ] Create assignee mapping config file (name → Jira account ID/email) with placeholder entries for the 10 team members
- [ ] Create the duplicate-tracking log store (decide JSON file vs. SQLite; create empty initial file)

## Phase 2: Core Features
- [ ] Implement `transcript_loader` to read a transcript file from a given path
- [ ] Define a pluggable `action_item_extractor` interface, with a **mock implementation** returning structured items (`task_summary`, `owner_name`, `due_date`) for development/testing
- [ ] Implement `assignee_resolver` to map `owner_name` → `assignee_account_id` via the config file, flagging unmatched names
- [ ] Implement `duplicate_tracker` to check/record processed items keyed by transcript source + normalized item text
- [ ] Implement `review_cli` to display candidate items (summary, assignee, due date) and collect per-item or approve-all input
- [ ] Wire `transcript_loader` → `action_item_extractor` (mock) → `assignee_resolver` → `duplicate_tracker` → `review_cli` into one end-to-end flow

## Phase 3: Integration
- [ ] Implement `jira_client` to create Task issues in the `VER-IOT` project via Jira REST API v3 (backlog, no sprint)
- [ ] Wire `jira_client` into the main flow so approved items create real Jira tickets
- [ ] Update the `duplicate_tracker` log after each successful ticket creation
- [ ] Select a real LLM provider and implement it behind the `action_item_extractor` interface, replacing the mock
- [ ] Handle Jira API error cases (auth failure, invalid project/issue type, network/timeout errors)

## Phase 4: Testing
- [ ] Unit tests for `transcript_loader` (valid file, missing file)
- [ ] Unit tests for `assignee_resolver` (matched name, unmatched name, alias handling)
- [ ] Unit tests for `duplicate_tracker` (new item vs. already-processed item)
- [ ] Unit tests for `review_cli` approval flow (mocked input)
- [ ] Unit tests for `jira_client` ticket creation (mocked HTTP responses, including error cases)
- [ ] Unit tests for `action_item_extractor` using a mocked LLM response

## Phase 5: Documentation
- [ ] README: overview and prerequisites
- [ ] README: environment setup (`.env`, assignee mapping file, duplicate-tracking log location)
- [ ] README: how to run the tool end-to-end on a transcript file
- [ ] README: known limitations / open items (LLM provider TBD, confirm exact Jira project key)
