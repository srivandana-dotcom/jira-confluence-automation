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
- **FR-006**: System MUST publish the combined dashboard to a single, pre-configured Confluence page, replacing that page's content in place on each successful refresh.
- **FR-007**: System MUST support configuration of multiple board IDs via a config mechanism (not auto-discovery).
- **FR-008**: System MUST support configuration of the target Confluence page ID via the same config mechanism.
- **FR-009**: System MUST load Jira/Confluence credentials (email + API token) from environment variables, never hardcoded in source.
- **FR-010**: System MUST refresh data only on-demand (explicit user action), with no scheduler/cron integration.
- **FR-011**: System MUST report a clear, board-specific error when a board's data cannot be fetched, without failing the entire refresh for other boards.
- **FR-012**: System MUST leave the previous Confluence page content unchanged if the publish step fails.
- **FR-013**: System MUST prevent concurrent duplicate refreshes from being triggered at the same time.
- **FR-014**: System MUST persist the latest fetched dashboard snapshot in PostgreSQL so the dashboard can be displayed without re-fetching from Jira on every page load.

### Key Entities *(include if feature involves data)*

- **Board Config**: Represents a tracked Jira board — board ID, display name, Jira project key.
- **Sprint Snapshot**: The result of a refresh for one board — completion %, blocker list, burndown data, fetch timestamp, board reference.
- **Blocker Item**: An issue flagged as blocked/at-risk — issue key, summary, reason flagged (status/label/overdue), due date.
- **Dashboard Config**: System-wide settings — Confluence page ID, list of tracked board configs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can view up-to-date sprint status for all configured boards within a single page load, with no need to open Jira.
- **SC-002**: Triggering a refresh updates both the in-app dashboard and the Confluence page within a reasonable time for typical board sizes (tens of issues per board).
- **SC-003**: A failed fetch for one board does not prevent the other configured boards from displaying their data.
- **SC-004**: Adding or removing a tracked board requires only a configuration change, with zero code changes.
- **SC-005**: 100% of blocker/at-risk items shown on the dashboard match the defined flagging rules (status, flag/label, or overdue).

## Assumptions

- The user already has a Jira Cloud account with API access and a Confluence Cloud space with a pre-created target page.
- Board IDs and the Confluence page ID are known and entered by an admin; auto-discovery of boards/pages is out of scope.
- Authentication is single-user/service-account based (one shared Jira/Confluence API token), not per-end-user OAuth login.
- PostgreSQL is used only to cache the latest snapshot per board, not as a long-term historical data warehouse.
- Mobile-optimized UI is out of scope for the initial version; desktop browser usage is assumed.
