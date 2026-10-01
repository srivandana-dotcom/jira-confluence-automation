# Implementation Checklist: Jira Sprint Progress Dashboard

Compares [spec/specification.md](./specification.md) against the current code in `web-app/`.
Verified by: reading `web-app/backend/src/**` and `web-app/frontend/src/**`, and running both test suites.

**Test results**: backend `npm test` → 14/14 passing ([web-app/backend/tests](../web-app/backend/tests)). Frontend `npm test` → 5/5 passing ([web-app/frontend/tests](../web-app/frontend/tests)). All tests use mocked Jira/Confluence clients — no run against real Jira/Confluence credentials (see "Known gaps" below).

## Legend
✅ Implemented and verified (code + passing test) ⚠️ Partially implemented / gap ❌ Not implemented

---

## User Stories

| Story | Status | Notes |
|---|---|---|
| US1 — View combined sprint dashboard (P1) | ✅ | Completion %, blockers, and now a burndown summary (done vs. remaining issues/points) render per board ([Dashboard.jsx](../web-app/frontend/src/pages/Dashboard.jsx), [BoardSection.jsx](../web-app/frontend/src/components/BoardSection.jsx)); "no active sprint" state works (Acceptance Scenario 1.2). Covered by [BoardSection.test.jsx](../web-app/frontend/tests/components/BoardSection.test.jsx). |
| US2 — Publish combined dashboard to Confluence (P1) | ✅ | Publish-in-place, per-board error placeholders, "unchanged on publish failure", and now a burndown summary are all implemented and covered by tests ([publish.test.js](../web-app/backend/tests/integration/publish.test.js), [publish-partial-failure.test.js](../web-app/backend/tests/integration/publish-partial-failure.test.js), [confluenceClient.test.js](../web-app/backend/tests/unit/confluenceClient.test.js)). |
| US3 — Configure boards and credentials (P2) | ✅ | Add/remove boards and edit Confluence page ID via UI+API, backed by Postgres (not a static file); missing-credential errors are reported with the specific credential name. Covered by [boardConfig.test.js](../web-app/backend/tests/integration/boardConfig.test.js). |
| US4 — Manual on-demand refresh (P3) | ✅ | `RefreshButton` triggers refresh, shows loading state, and surfaces the "already running" (409) case; backend single-flight guard covered by [refreshGuard.test.js](../web-app/backend/tests/integration/refreshGuard.test.js). |

---

## Functional Requirements

| ID | Requirement | Status | Where | Notes |
|---|---|---|---|---|
| FR-001 | Fetch sprint data from Jira Cloud REST API v3 per board | ✅ | [jiraClient.js](../web-app/backend/src/clients/jiraClient.js) | `getActiveSprint` + `getSprintIssues`. |
| FR-002 | Completion % (story points, falling back to issue count) | ✅ | [sprintMetrics.js](../web-app/backend/src/services/sprintMetrics.js) | Tested incl. zero-issue sprint (no divide-by-zero). |
| FR-003 | Flag blockers via status / flag-or-label / overdue-and-open | ✅ | [blockerDetector.js](../web-app/backend/src/services/blockerDetector.js) | All 3 conditions + the "completed-but-overdue is not a blocker" edge case are tested. |
| FR-004 | Burndown trend sourced from Jira's native sprint report (no local history) | ✅ | `jiraClient.getSprintBurndown` | Fetched via an **unofficial** "greenhopper" endpoint (documented risk in `README.md`); failure is non-fatal to the rest of the board's refresh. Now rendered in both the UI and Confluence output — see FR-005. |
| FR-005 | Render combined dashboard: completion %, blockers, burndown trend per board | ✅ | [Dashboard.jsx](../web-app/frontend/src/pages/Dashboard.jsx), [BoardSection.jsx](../web-app/frontend/src/components/BoardSection.jsx) | Completion %, blockers, and a burndown summary (done/remaining issues + story points, with a fallback message when unavailable) all render per board. |
| FR-006 | Publish combined dashboard to one Confluence page, replacing content in place, including on partial board failure | ✅ | [publishService.js](../web-app/backend/src/services/publishService.js), [confluenceClient.js](../web-app/backend/src/clients/confluenceClient.js) | Confluence section now includes the same burndown summary as the UI. |
| FR-007 | Board config stored in PostgreSQL, editable via UI/API | ✅ | [boardConfigService.js](../web-app/backend/src/services/boardConfigService.js), [config.js](../web-app/backend/src/routes/config.js), [Settings.jsx](../web-app/frontend/src/pages/Settings.jsx), [002_board_config.sql](../web-app/backend/migrations/002_board_config.sql) | Verified end-to-end by `boardConfig.test.js`. |
| FR-008 | Confluence page ID stored in same Postgres config, editable the same way | ✅ | [dashboardConfigService.js](../web-app/backend/src/services/dashboardConfigService.js), `GET/PUT /api/config/confluence-page` | Single seeded row enforced by [001_dashboard_config.sql](../web-app/backend/migrations/001_dashboard_config.sql). |
| FR-009 | Jira/Confluence credentials from env vars, never hardcoded | ✅ | [env.js](../web-app/backend/src/config/env.js) | `requireEnv` throws a `CONFIG_MISSING` error naming the exact missing keys; mapped to HTTP 400 in `dashboard.js` for the Jira case. Confluence-credential errors surface as `publishError` text in a 200 response rather than an HTTP error — functionally reports the missing credential, but status-code handling is inconsistent between the two paths. |
| FR-010 | On-demand refresh only, no scheduler/cron | ✅ | No cron/scheduler code found anywhere in `web-app/backend`. | |
| FR-011 | Board-specific error, isolated from other boards; failed board still published as a placeholder section | ✅ | [refreshService.js](../web-app/backend/src/services/refreshService.js) (per-board `try/catch`), `confluenceClient.renderDashboardContent` | Covered by `publish-partial-failure.test.js`. |
| FR-012 | Previous Confluence content unchanged only when the publish/write call itself fails | ✅ | [publishService.js](../web-app/backend/src/services/publishService.js) | A board-fetch failure alone doesn't block publish; only a `getPage`/`updatePage` failure does. |
| FR-013 | Prevent concurrent duplicate refreshes | ✅ | `refreshInFlight` flag + `RefreshInProgressError` in [refreshService.js](../web-app/backend/src/services/refreshService.js), mapped to HTTP 409 | In-memory flag is sufficient per the spec's single-operator/single-instance deployment model. |
| FR-014 | Persist latest dashboard snapshot in Postgres (no re-fetch from Jira on page load) | ✅ | [snapshotRepository.js](../web-app/backend/src/services/snapshotRepository.js), `GET /api/dashboard` | Confirmed: dashboard GET reads only from Postgres, never calls the Jira client. |

---

## Key Entities

| Entity | Status | Notes |
|---|---|---|
| Board Config | ✅ | [002_board_config.sql](../web-app/backend/migrations/002_board_config.sql) — `board_id`, `display_name`, `jira_project_key`. |
| Sprint Snapshot | ✅ | [003_sprint_snapshot.sql](../web-app/backend/migrations/003_sprint_snapshot.sql) — completion %, burndown JSON, fetch status, timestamp. |
| Blocker Item | ✅ | [004_blocker_item.sql](../web-app/backend/migrations/004_blocker_item.sql) — issue key, summary, reason, due date. |
| Dashboard Config | ✅ | [001_dashboard_config.sql](../web-app/backend/migrations/001_dashboard_config.sql) — singleton row enforced by `CHECK (id = 1)`. |

---

## Success Criteria

| ID | Criterion | Status | Notes |
|---|---|---|---|
| SC-001 | View all configured boards in one page load, no Jira access needed | ✅ | `GET /api/dashboard` serves purely from Postgres. |
| SC-002 | Refresh updates dashboard + Confluence "within a reasonable time" for tens of issues/board | ⚠️ | Not load-tested; boards are fetched sequentially (not in parallel) in `refreshAll`, which scales linearly with board count but should still be fast for the stated "tens of issues" scale. |
| SC-003 | A failed board fetch doesn't block other boards' display | ✅ | Verified by `publish-partial-failure.test.js`. |
| SC-004 | Adding/removing a board requires only configuration change, zero code | ✅ | Verified by `boardConfig.test.js`. |
| SC-005 | 100% of blockers match the defined flagging rules | ✅ | All three rules + edge case covered by `blockerDetector.test.js`. |

---

## Edge Cases (from specification.md)

| Edge Case | Status | Notes |
|---|---|---|
| Board ID no longer exists / access revoked | ✅ | Caught by the per-board `try/catch` in `refreshService.js`; recorded as `fetch_status='error'`. |
| Jira/Confluence rate limit or timeout mid-refresh | ⚠️ | A hard failure on any Jira call for a board fails that whole board (handled). No special handling for a partially-succeeded multi-page fetch within one board. |
| Issue overdue but already completed → not a blocker | ✅ | `isOverdue()` explicitly excludes done issues; tested. |
| Extremely large boards (pagination) | ✅ | `getSprintIssues` now pages through `startAt`/`maxResults` until a short page is returned, aggregating all issues regardless of sprint size. Covered by [jiraClient.test.js](../web-app/backend/tests/unit/jiraClient.test.js). |
| Confluence page ID of an unsupported page type | ⚠️ | Falls through to a generic `Confluence updatePage failed (status)` error; no specific detection/message for this case. |

---

## Known Gaps Summary

1. **Inconsistent error surfacing**: missing Jira credentials → HTTP 400; missing Confluence credentials → HTTP 200 with a `publishError` string. Both name the specific missing credential, but callers must check two different places.
2. **No real Jira/Confluence integration test** has been run (per `tasks.md` T039) — only mocked-client integration tests and one manual Jira auth smoke test. Functional correctness against a live Jira/Confluence instance is unverified.

### Resolved

- ~~Burndown trend is never displayed~~ — **Fixed**: [BoardSection.jsx](../web-app/frontend/src/components/BoardSection.jsx) and [confluenceClient.js](../web-app/backend/src/clients/confluenceClient.js) now render a done-vs-remaining burndown summary (issues + story points), with a fallback message when burndown data is unavailable. Covered by 2 new backend unit tests and 2 new frontend component tests (16/16 backend, 7/7 frontend passing).
- ~~No pagination for Jira sprint issues~~ — **Fixed**: [jiraClient.js](../web-app/backend/src/clients/jiraClient.js)'s `getSprintIssues` now loops over `startAt`/`maxResults` pages until a short page is returned, so sprints larger than one page are no longer truncated. Covered by 2 new unit tests (18/18 backend passing).
