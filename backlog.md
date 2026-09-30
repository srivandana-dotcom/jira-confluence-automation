# Implementation Backlog: Meeting Notes → Jira Action Item Processor

Derived from [project_spec.md](../project_spec.md). Core Features are prioritized first (end-to-end flow with mocked extraction/Jira), followed by real Integration, then Testing and Documentation.

## Phase 1: Setup
- [x] Create module layout: `transcript_loader`, `action_item_extractor`, `assignee_resolver`, `duplicate_tracker`, `review_cli`, `jira_client` — *custom skill*
- [x] Add `requests` and `python-dotenv` to `requirements.txt` — *custom skill*
- [x] Create `.env.example` with placeholders for Jira Cloud email + API token — *custom skill*
- [x] Create assignee mapping config file (name → Jira account ID/email) with placeholder entries for the 10 team members — *custom skill*
- [ ] Create the duplicate-tracking log store (decide JSON file vs. SQLite; create empty initial file) — *custom skill* — [Issue #1](https://github.com/srivandana-dotcom/jira-confluence-automation/issues/1)

## Phase 2: Core Features
- [x] Implement `transcript_loader` to read a transcript file from a given path — *MCP* (generic filesystem-read capability, e.g. a filesystem MCP server)
- [x] Define a pluggable `action_item_extractor` interface, with a **mock implementation** returning structured items (`task_summary`, `owner_name`, `due_date`) for development/testing — *custom skill* (project-specific extraction schema)
- [x] Implement `assignee_resolver` to map `owner_name` → `assignee_account_id` via the config file, flagging unmatched names — *custom skill* (bespoke config lookup + flagging logic)
- [x] Implement `duplicate_tracker` to check/record processed items keyed by transcript source + normalized item text — *custom skill* (bespoke stateful tracking logic)
- [x] Implement `review_cli` to display candidate items (summary, assignee, due date) and collect per-item or approve-all input — *custom skill* (bespoke interactive CLI flow)
- [x] Wire `transcript_loader` → `action_item_extractor` (mock) → `assignee_resolver` → `duplicate_tracker` → `review_cli` into one end-to-end flow — *custom skill* (project-specific orchestration)

## Phase 3: Integration
- [x] Implement `jira_client` to create Task issues in the `VER-IOT` project via Jira REST API v3 (backlog, no sprint) — *MCP* (covered by an existing Jira MCP server, e.g. Atlassian's official server or `mcp-atlassian`)
- [x] Wire `jira_client` into the main flow so approved items create real Jira tickets (falls back to dry-run if `.env` credentials are absent) — *custom skill* (project-specific orchestration around the MCP call)
- [x] Update the `duplicate_tracker` log after each successful ticket creation — *custom skill*
- [ ] Select a real LLM provider and implement it behind the `action_item_extractor` interface, replacing the mock — open decision, needs provider choice from the team — *MCP* (LLM provider access can come from an existing model/LLM MCP server; the extraction schema itself remains a custom skill)
- [x] Handle Jira API error cases (auth failure, invalid project/issue type, network/timeout errors) — *MCP* (error responses surfaced by the Jira MCP server's tool calls)

## Phase 4: Testing
- [x] Unit tests for `transcript_loader` (valid file, missing file) — *custom skill*
- [x] Unit tests for `assignee_resolver` (matched name, unmatched name, alias handling) — *custom skill*
- [x] Unit tests for `duplicate_tracker` (new item vs. already-processed item) — *custom skill*
- [x] Unit tests for `review_cli` approval flow (mocked input) — *custom skill*
- [x] Unit tests for `jira_client` ticket creation (mocked HTTP responses, including error cases) — *custom skill*
- [x] Unit tests for `action_item_extractor` using a mocked LLM response — *custom skill*

## Phase 5: Documentation
- [x] README: overview and prerequisites — *custom skill*
- [x] README: environment setup (`.env`, assignee mapping file, duplicate-tracking log location) — *custom skill*
- [x] README: how to run the tool end-to-end on a transcript file — *custom skill*
- [x] README: known limitations / open items (LLM provider TBD, confirm exact Jira project key) — *custom skill*
