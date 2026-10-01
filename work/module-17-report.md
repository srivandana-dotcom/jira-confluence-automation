# Module 17 Completion Report

## Specification Contents

# Feature Specification: Jira Sprint Progress Dashboard (Confluence Publishing)

**Feature Branch**: `001-jira-confluence-dashboard`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: On-demand web app that pulls sprint progress data from multiple Jira Cloud boards and publishes a combined dashboard to a single Confluence page, built on the project's fixed stack (React 18 + Vite frontend, Node.js + Express backend, PostgreSQL 15 via Docker) per `spec/constitution.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View combined sprint dashboard (Priority: P1)

As a team lead, I want to see completion %, blockers, and burndown trend for all tracked Jira boards in one place, so I don't have to check each board individually.

**Why this priority**: This is the core value of the feature — without it there is no dashboard, just raw data pulls.

**Independent Test**: Can be fully tested by configuring at least one board ID, triggering a refresh, and verifying the frontend renders completion %, blocker list, and burndown trend for that board.

**Acceptance Scenarios**:

1. **Given** one or more board IDs are configured, **When** the user triggers a dashboard refresh, **Then** the system fetches current sprint data for each board and displays completion %, blocker/at-risk items, and burndown trend per board.
2. **Given** a board has no active sprint, **When** the dashboard refreshes, **Then** that board's section indicates "no active sprint" instead of showing stale or error data.

---

### User Story 2 - Publish combined dashboard to Confluence (Priority: P1)

As a team lead, I want the combined dashboard pushed to a single Confluence page, so stakeholders who don't use Jira can see sprint status without logging into Jira.

**Why this priority**: Confluence publishing is the primary distribution mechanism for the dashboard and is explicitly required by the original requirements — without it, the feature doesn't fulfill its stated purpose.

**Independent Test**: Can be fully tested by running a refresh with a configured Confluence page ID and verifying the target page's content is overwritten in place with one section per board.

**Acceptance Scenarios**:

1. **Given** a valid Confluence page ID is configured, **When** a refresh completes successfully, **Then** the existing Confluence page content is replaced in place with the current combined dashboard (one section per board).
2. **Given** the Confluence update call fails (e.g., auth error, page not found), **When** the refresh runs, **Then** the user is shown a clear error and the previous Confluence page content is left unchanged.
3. **Given** 2 of 3 configured boards fetched successfully and 1 failed, **When** the refresh publishes to Confluence, **Then** the page is updated with the 2 successful boards' sections rendered normally and the failed board rendered as an error placeholder section, rather than blocking the entire publish.

---

### User Story 3 - Configure boards and credentials (Priority: P2)

As an admin, I want to configure which Jira boards are tracked and which Confluence page is updated, so the dashboard can be adapted without code changes.

**Why this priority**: Needed for the tool to be usable beyond a single hardcoded setup, but the dashboard/publish flow (P1 stories) can be demoed with a single hardcoded board first.

**Independent Test**: Can be fully tested by adding/removing a board ID via configuration and confirming the dashboard reflects the updated board list on the next refresh, with no code changes required.

**Acceptance Scenarios**:

1. **Given** the admin adds a new board ID to the configuration, **When** the next refresh runs, **Then** the new board appears in the dashboard output.
2. **Given** Jira or Confluence credentials are missing or invalid, **When** a refresh is triggered, **Then** the system reports a configuration error identifying which credential is missing/invalid, rather than failing silently.

---

### User Story 4 - Manual on-demand refresh (Priority: P3)

As a team lead, I want to manually trigger a refresh from the UI, so the dashboard reflects current state when I need it, without relying on a schedule.

**Why this priority**: Refresh-on-demand is simpler than scheduled refresh and sufficient for the stated use case; it's a smaller increment once P1/P2 stories exist.

**Independent Test**: Can be fully tested by clicking "Refresh" in the UI and observing the dashboard and Confluence page both update to reflect the latest Jira data.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded, **When** the user clicks "Refresh", **Then** the backend re-fetches data from Jira, updates the stored snapshot, re-renders the dashboard, and updates the Confluence page.
2. **Given** a refresh is already in progress, **When** the user clicks "Refresh" again, **Then** the system prevents a duplicate concurrent refresh and informs the user one is already running.

---

### Edge Cases

- What happens when a configured board ID no longer exists or the user's Jira account loses access to it?
- How does the system handle a Jira/Confluence API rate limit or timeout mid-refresh (partial board data fetched)?
- What happens when an issue has a due date in the past but was already completed (should not count as a blocker)?
- How does the system handle extremely large boards (many issues) without the refresh request timing out?
- What happens if the Confluence page ID points to a page type that doesn't support the expected content format?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch sprint data (issues, story points, status) from Jira Cloud REST API v3 for each configured board ID.
- **FR-002**: System MUST calculate completion % per board as issues/story points done vs. total in the current active sprint.
- **FR-003**: System MUST flag blockers/at-risk items using a combination of: status is "Blocked" (or equivalent), issue has a flag/impediment or specific label, or due date has passed while issue is still open.
- **FR-004**: System MUST source burndown trend data from Jira's native sprint report rather than maintaining its own historical snapshots.
- **FR-005**: System MUST render a combined dashboard view in the frontend with one section per configured board, showing completion %, blockers, and burndown trend.
- **FR-006**: System MUST publish the combined dashboard to a single, pre-configured Confluence page, replacing that page's content in place on each refresh attempt — including when one or more boards failed to fetch (see FR-011/FR-012 for exact behavior).
- **FR-007**: System MUST store configuration of tracked board IDs in PostgreSQL, editable by the operator through the app's UI/API (not a static file), so boards can be added/removed without code changes or redeploys.
- **FR-008**: System MUST store the target Confluence page ID in the same PostgreSQL-backed configuration, editable the same way as board config.
- **FR-009**: System MUST load Jira/Confluence credentials (email + API token) from environment variables, never hardcoded in source.
- **FR-010**: System MUST refresh data only on-demand (explicit user action), with no scheduler/cron integration.
- **FR-011**: System MUST report a clear, board-specific error when a board's data cannot be fetched, without failing the entire refresh for other boards. A board that fails to fetch MUST still be published to Confluence, rendered as an error placeholder section (board name + error reason) in place of its normal data, alongside the normally rendered sections for the boards that fetched successfully.
- **FR-012**: System MUST leave the previous Confluence page content entirely unchanged only when the publish (write) call to Confluence itself fails — e.g., auth error, page not found, network failure. A partial board-fetch failure (FR-011) is not, by itself, a "publish step" failure and MUST NOT block publishing the boards that succeeded.
- **FR-013**: System MUST prevent concurrent duplicate refreshes from being triggered at the same time.
- **FR-014**: System MUST persist the latest fetched dashboard snapshot in PostgreSQL so the dashboard can be displayed without re-fetching from Jira on every page load.

### Key Entities *(include if feature involves data)*

- **Board Config**: Represents a tracked Jira board — board ID, display name, Jira project key.
- **Sprint Snapshot**: The result of a refresh for one board — completion %, blocker list, burndown data, fetch timestamp, board reference.
- **Blocker Item**: An issue flagged as blocked/at-risk — issue key, summary, reason flagged (status/label/overdue), due date.
- **Dashboard Config**: System-wide settings stored in PostgreSQL — Confluence page ID, list of tracked board configs. A single row/record per deployment, since the app runs for one local operator with one combined dashboard (see Deployment section).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can view up-to-date sprint status for all configured boards within a single page load, with no need to open Jira.
- **SC-002**: Triggering a refresh updates both the in-app dashboard and the Confluence page within a reasonable time for typical board sizes (tens of issues per board).
- **SC-003**: A failed fetch for one board does not prevent the other configured boards from displaying their data.
- **SC-004**: Adding or removing a tracked board requires only a configuration change, with zero code changes.
- **SC-005**: 100% of blocker/at-risk items shown on the dashboard match the defined flagging rules (status, flag/label, or overdue).

## Deployment

- The app runs **locally, on a single person's machine**, via the project's Docker Compose setup — the same usage model as the original on-demand script. It is not deployed to a shared server, cloud host, or any network-reachable environment.
- Because only the operator running it locally can load the dashboard UI or trigger a refresh, no application-level login/authentication is required for the web UI itself — access is governed by access to the local machine, not by the app.
- The "stakeholders who don't use Jira" (User Story 2) view sprint status exclusively via the published Confluence page; they never access the local app or its UI directly.
- Since there is a single operator and no shared/concurrent deployment, admin-vs-viewer role separation and multi-instance refresh locking are not required for the initial version.

## Assumptions

- The user already has a Jira Cloud account with API access and a Confluence Cloud space with a pre-created target page.
- Board IDs and the Confluence page ID are known and entered by an admin; auto-discovery of boards/pages is out of scope.
- Authentication is single-user/service-account based (one shared Jira/Confluence API token), not per-end-user OAuth login.
- PostgreSQL is used only to cache the latest snapshot per board, not as a long-term historical data warehouse.
- Mobile-optimized UI is out of scope for the initial version; desktop browser usage is assumed.

## Commit History

```
fb517aa feat: complete prototype per specification.
7883c0a Requirement vs implementation check
41c2df9 Implemented tasks 2 to 40
789a5f2 Implemented task 1 from spec/tasks.md
8bdab30 Breaking into tasks
9b3296f Implementation plan
8dcce9f Marked out of scope items
6c0212a Resolved contradictions and gaps
46cb7d5 Resolved one ambiguity - gap 9
a22e482 prototype: Working with Prototype using SDD
109b4e4 Working with Prototype using SDD
7833e65 chore: project skeleton for prototype
79ad36d Module 15 report
6997ca6 Bulk files processing excercise
969394b module 14 report
6772592 Issue link added
6eacf24 Issue creation exercise
b574e94 Added Github mcp server details
e0d3713 Module 13 report added
3fb9b75 Skills Vs MCP exercise
bbfea9f MCP server tools
776f158 MCP servers
d4822be sample skill test
8a65b14 creating skills
b531aed Creating Skills exercise
e2cdfc4 New status report for 2026-10-02
da448bc Changes to report date
24a2744 Instruction catalog practice task
5ab6e36 Structuring instructions
3016b6c Instructions catalog
cf24000 Committed on Sep 29
f110524 Commit on Sep 28
5f037e3 Committed on Sep 28
b26d3e1 Commited on Sep 28
1d64e1f Commited on Sep 28
0cbcd9d Sep 29
3c4602c Add multiply function
3907074 Initial calculator with add and subtract
```

## Commit Count

38

## Project Files

Note: node_modules/ entries (2834 files, vendored dependencies) are excluded below to fit submission size limits. They are still tracked in git; see .gitignore for why future dependency installs won't re-add them.

```
.env.example
.github/copilot-instructions.md
.github/prompts/to-create-status-report.prompt.md
.github/prompts/to-creating-instructions.prompt.md
.github/prompts/to-document-processor-readme.prompt.md
.github/prompts/to-implement-processor-module.prompt.md
.github/prompts/to-test-processor-module.prompt.md
.gitignore
.vscode/mcp.json
.vscode/settings.json
Hello World - Copy.txt
Hello World.txt
PROJECT_IDEAS.md
README.md
backlog.md
calculator.py
calculator/main.py
calculator/operations.py
config/assignee_mapping.json
csv_to_json.py
data/processed_items.json
data/sample-transcript.txt
generate_status_report.py
hello.txt
instructions/calculate-compound-interest.agent.md
instructions/create-status-report.agent.md
instructions/creating-instructions.agent.md
instructions/document-processor-readme.agent.md
instructions/implement-processor-module.agent.md
instructions/main.agent.md
instructions/test-processor-module.agent.md
instructions/use-transcript_loader.agent.md
instructions/validate-instructions.agent.md
jira-dashboard-requirements.md
main.py
notes.md
processor/__init__.py
processor/action_item_extractor.py
processor/assignee_resolver.py
processor/duplicate_tracker.py
processor/jira_client.py
processor/models.py
processor/review_cli.py
processor/transcript_loader.py
project_spec.md
report/__init__.py
report/data_fetcher.py
report/formatter.py
reports/example.md
reports/instructions.md
reports/status-report-2026-09-28.md
reports/status-report-2026-09-29.md
reports/status-report-2026-10-02.md
reports/status-report-sample.md
reports/template.md
requirements.txt
run_processor.py
spec/analyze.md
spec/checklist.md
spec/clarify.md
spec/constitution.md
spec/plan.md
spec/specification.md
spec/tasks.md
tests/test_action_item_extractor.py
tests/test_assignee_resolver.py
tests/test_duplicate_tracker.py
tests/test_jira_client.py
tests/test_review_cli.py
tests/test_transcript_loader.py
tools/compound_interest.py
tools/mcp-calculator.ps1
tools/mcp-echo.ps1
tools/mcp-time.ps1
tools/transcript_loader.py
tools/validate_instructions.py
web-app/.env.example
web-app/.prettierrc
web-app/README.md
web-app/backend/.env.example
web-app/backend/eslint.config.js
web-app/backend/migrations/001_dashboard_config.sql
web-app/backend/migrations/002_board_config.sql
web-app/backend/migrations/003_sprint_snapshot.sql
web-app/backend/migrations/004_blocker_item.sql
web-app/backend/package-lock.json
web-app/backend/package.json
web-app/backend/scripts/migrate.js
web-app/backend/src/app.js
web-app/backend/src/clients/confluenceClient.js
web-app/backend/src/clients/jiraClient.js
web-app/backend/src/config/env.js
web-app/backend/src/controllers/.gitkeep
web-app/backend/src/db.js
web-app/backend/src/index.js
web-app/backend/src/middleware/.gitkeep
web-app/backend/src/models/.gitkeep
web-app/backend/src/routes/.gitkeep
web-app/backend/src/routes/config.js
web-app/backend/src/routes/dashboard.js
web-app/backend/src/services/blockerDetector.js
web-app/backend/src/services/boardConfigService.js
web-app/backend/src/services/dashboardConfigService.js
web-app/backend/src/services/publishService.js
web-app/backend/src/services/refreshService.js
web-app/backend/src/services/snapshotRepository.js
web-app/backend/src/services/sprintMetrics.js
web-app/backend/tests/helpers/db.js
web-app/backend/tests/integration/boardConfig.test.js
web-app/backend/tests/integration/publish-partial-failure.test.js
web-app/backend/tests/integration/publish.test.js
web-app/backend/tests/integration/refresh.test.js
web-app/backend/tests/integration/refreshGuard.test.js
web-app/backend/tests/unit/blockerDetector.test.js
web-app/backend/tests/unit/confluenceClient.test.js
web-app/backend/tests/unit/jiraClient.test.js
web-app/backend/tests/unit/sprintMetrics.test.js
web-app/docker-compose.yml
web-app/frontend/eslint.config.js
web-app/frontend/index.html
web-app/frontend/package-lock.json
web-app/frontend/package.json
web-app/frontend/public/.gitkeep
web-app/frontend/src/App.jsx
web-app/frontend/src/api.js
web-app/frontend/src/components/.gitkeep
web-app/frontend/src/components/BoardSection.jsx
web-app/frontend/src/components/RefreshButton.jsx
web-app/frontend/src/main.jsx
web-app/frontend/src/pages/.gitkeep
web-app/frontend/src/pages/Dashboard.jsx
web-app/frontend/src/pages/Settings.jsx
web-app/frontend/tests/components/BoardSection.test.jsx
web-app/frontend/tests/components/Dashboard.test.jsx
web-app/frontend/tests/components/RefreshButton.test.jsx
web-app/frontend/tests/setup.js
web-app/frontend/vite.config.js
web-app/frontend/vitest.config.js
weekly-status-report-template.md
work/TODO.md
work/module-03-report.md
work/module-08-report.md
work/module-09-report.md
work/module-10-report.md
work/module-12-report.md
work/module-13-report.md
work/module-14-report.md
work/module-15-report.md
work/module-16-report.md
```
