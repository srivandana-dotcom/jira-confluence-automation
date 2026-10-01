# Tasks: Jira Sprint Progress Dashboard (Confluence Publishing)

**Input**: `spec/specification.md`, `spec/plan.md`, `spec/constitution.md`, `spec/clarify.md`

**Organization**: Tasks are grouped by phase/user story so each story can be implemented and tested independently, per `spec/plan.md`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on other unchecked tasks)
- **[Story]**: Maps the task to a user story (US1–US4) from `spec/specification.md`
- Acceptance criteria (AC) are listed under each implementation task

## Path Conventions

- Backend: `web-app/backend/src/...`, `web-app/backend/tests/...`
- Frontend: `web-app/frontend/src/...`, `web-app/frontend/tests/...`
- Paths assume the existing `web-app/frontend` + `web-app/backend` skeleton

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Runnable project skeleton, nothing functional yet.

- [x] T001 Wire up `web-app/backend` (Express) and `web-app/frontend` (Vite + React) entry points so each starts cleanly
      **AC**: `npm install && npm run dev` succeeds with no errors in both `web-app/backend` and `web-app/frontend`.
- [ ] T002 [P] Add a PostgreSQL 15 service to `web-app/docker-compose.yml` with a named volume and env-driven credentials
      **AC**: `docker compose up -d db` starts a healthy Postgres 15 container reachable on the configured port.
- [ ] T003 [P] Populate `web-app/backend/.env.example` with Jira (email + API token), Confluence (email + API token), and DB connection string placeholders
      **AC**: Every env var referenced by backend code appears in `.env.example`; no real secrets are committed.
- [ ] T004 [P] Configure ESLint/Prettier for `web-app/backend` and `web-app/frontend`
      **AC**: `npm run lint` passes on the clean scaffold in both projects.
- [ ] T005 Choose and wire a migration tool (e.g., `node-pg-migrate`) in `web-app/backend` (resolves plan.md Gap #7)
      **AC**: The migration command runs against the Dockerized Postgres instance and creates/drops tables without error.

**Checkpoint**: `docker compose up` + migration command yields an empty, connected database; both apps boot locally.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema and config persistence that every user story depends on.
**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [ ] T006 Migration: `dashboard_config` table (`id`, `confluence_page_id`) with a single seeded row in `web-app/backend/migrations/`
      **AC**: Table exists after migration; exactly one row is present after first run.
- [ ] T007 [P] Migration: `board_config` table (`id`, `board_id`, `display_name`, `jira_project_key`) in `web-app/backend/migrations/`
      **AC**: Table exists; a manual insert/select round-trips correctly.
- [ ] T008 [P] Migration: `sprint_snapshot` table (`id`, `board_config_id` FK, `completion_pct`, `burndown_data` JSON, `fetched_at`, `fetch_status`, `error_message`) in `web-app/backend/migrations/`
      **AC**: FK constraint to `board_config` is enforced; inserting an invalid `board_config_id` is rejected.
- [ ] T009 [P] Migration: `blocker_item` table (`id`, `sprint_snapshot_id` FK, `issue_key`, `summary`, `reason`, `due_date`) in `web-app/backend/migrations/`
      **AC**: FK constraint to `sprint_snapshot` is enforced.
- [ ] T010 Implement DB connection/pool module in `web-app/backend/src/db.js`
      **AC**: Backend fails fast with a clear error on startup if Postgres is unreachable; connects successfully otherwise.
- [ ] T011 [P] Implement Board Config service (create/list/delete) in `web-app/backend/src/services/boardConfigService.js`
      **AC**: Each operation is verifiable via a direct service-level call, independent of any HTTP route.
- [ ] T012 [P] Implement Dashboard Config service (get/update single row) in `web-app/backend/src/services/dashboardConfigService.js`
      **AC**: Read always returns exactly one row; updating `confluence_page_id` persists and is visible on next read.

**Checkpoint**: Foundation ready — schema + config persistence work with no Jira/Confluence dependency.

---

## Phase 3: User Story 1 & 2 (P1) — Core Dashboard & Confluence Publish 🎯 MVP

**Goal**: A refresh fetches Jira sprint data for all boards, computes completion/blockers/burndown, stores it, renders it in the dashboard, and publishes it to Confluence — including partial-failure handling.

**Independent Test**: Configure one board + one Confluence page, trigger refresh, verify the UI and the Confluence page both reflect the same data.

### Tests for User Story 1 & 2

- [ ] T013 [P] [US1] Integration test: refresh fetches/stores completion %, blockers, burndown for a mocked board in `web-app/backend/tests/integration/refresh.test.js`
- [ ] T014 [P] [US2] Integration test: refresh publishes combined dashboard content to a mocked Confluence client in `web-app/backend/tests/integration/publish.test.js`
- [ ] T015 [P] [US2] Integration test: 2-of-3 boards succeed still publishes partial results with an error placeholder in `web-app/backend/tests/integration/publish-partial-failure.test.js`

### Implementation for User Story 1

- [ ] T016 [US1] Jira client: fetch sprint issues/story points per board in `web-app/backend/src/clients/jiraClient.js` (FR-001)
      **AC**: Given a board ID, returns the active sprint's issue list and story points from Jira Cloud REST API v3.
- [ ] T017 [US1] Completion % calculation in `web-app/backend/src/services/sprintMetrics.js` (FR-002)
      **AC**: Correct percentage for a normal issue set; no divide-by-zero on a sprint with 0 issues.
- [ ] T018 [US1] Blocker/at-risk flagging — OR of status/flag-label/overdue — in `web-app/backend/src/services/blockerDetector.js` (FR-003)
      **AC**: Issues matching any single condition are flagged; an issue matching none is not; a completed-but-overdue issue is NOT flagged (edge case).
- [ ] T019 [US1] Burndown data fetch from Jira's sprint report in `web-app/backend/src/clients/jiraClient.js` (FR-004)
      **AC**: Returns burndown series for a board/sprint; a documented error/fallback occurs if the Agile API endpoint is unavailable (see `spec/clarify.md` risk note).
- [ ] T020 [US1] Per-board error isolation in refresh orchestration in `web-app/backend/src/services/refreshService.js` (FR-011)
      **AC**: One board's fetch failure doesn't stop processing of remaining boards; the failed board's snapshot records `fetch_status='error'` + `error_message`.
- [ ] T021 [US1] [P] Persist Sprint Snapshot + Blocker Item rows per board in `web-app/backend/src/services/snapshotRepository.js` (FR-014)
      **AC**: After a refresh, one `sprint_snapshot` row per board exists with correctly associated `blocker_item` rows.
- [ ] T022 [US1] [P] `GET /api/dashboard` returns latest cached snapshot for all boards in `web-app/backend/src/routes/dashboard.js`
      **AC**: Returns one entry per configured board from the latest persisted snapshot, with no live Jira call.
- [ ] T023 [US1] Frontend dashboard view rendering completion %, blockers, burndown per board in `web-app/frontend/src/pages/Dashboard.jsx`
      **AC**: Renders one section per board from the T022 response, showing completion %, blocker list, and burndown data.
- [ ] T024 [US1] [P] "No active sprint" state in `web-app/frontend/src/components/BoardSection.jsx`
      **AC**: A board with no active sprint shows a "no active sprint" message instead of blank/error content (Acceptance Scenario 1.2).

### Implementation for User Story 2

- [ ] T025 [US2] Confluence client: render combined dashboard content, one section per board, in `web-app/backend/src/clients/confluenceClient.js` (FR-006)
      **AC**: Produces valid Confluence storage-format content with one section per configured board.
- [ ] T026 [US2] Error-placeholder rendering for failed boards within the same publish payload in `web-app/backend/src/clients/confluenceClient.js` (FR-011)
      **AC**: A failed board renders as a clearly labeled error section (board name + reason) alongside normally rendered successful boards, in the same publish call.
- [ ] T027 [US2] Confluence publish call with "unchanged on publish-failure" semantics in `web-app/backend/src/services/publishService.js` (FR-012)
      **AC**: On a simulated Confluence write failure (auth/network), the previous page content is left untouched and a clear error is surfaced to the caller.
- [ ] T028 [US2] Wire `POST /api/dashboard/refresh` to orchestrate fetch-all-boards → persist → publish in `web-app/backend/src/routes/dashboard.js`
      **AC**: One POST call updates DB snapshots AND the Confluence page in a single request/response cycle, with per-board success/failure reflected in the response.

**Checkpoint**: User Stories 1 and 2 fully functional, including the partial-failure path (Acceptance Scenario 2.3). **This is the MVP.**

---

## Phase 4: User Story 3 (P2) — Config Management UI

**Goal**: Operator can add/remove boards and edit the Confluence page ID via the UI, with zero code changes.

**Independent Test**: Add a board through the UI, trigger refresh, confirm it appears in the dashboard.

- [ ] T029 [P] [US3] Integration test: adding a board via API makes it appear in the next refresh in `web-app/backend/tests/integration/boardConfig.test.js`
- [ ] T030 [US3] `GET/POST /api/config/boards` and `DELETE /api/config/boards/:id` in `web-app/backend/src/routes/config.js` (FR-007)
      **AC**: Posting a new board persists it and it appears in the next `GET /api/dashboard` refresh cycle, with no redeploy.
- [ ] T031 [US3] [P] `GET/PUT /api/config/confluence-page` in `web-app/backend/src/routes/config.js` (FR-008)
      **AC**: Updating the page ID is reflected as the target of the next publish call.
- [ ] T032 [US3] Configuration-error reporting for missing/invalid Jira/Confluence credentials in `web-app/backend/src/services/refreshService.js`
      **AC**: A refresh with a missing/invalid credential returns an error identifying the specific credential, not a generic failure (Acceptance Scenario 3.2).
- [ ] T033 [US3] Frontend settings page to add/remove boards and edit the Confluence page ID in `web-app/frontend/src/pages/Settings.jsx`
      **AC**: Operator can add a board, see it listed, remove it, and edit the Confluence page ID, all via the T030/T031 endpoints.

**Checkpoint**: Boards and the Confluence page ID are manageable entirely through the UI; User Story 3 acceptance scenarios pass.

---

## Phase 5: User Story 4 (P3) — Manual Refresh UX

**Goal**: Operator triggers a refresh from the UI and is protected from duplicate concurrent refreshes.

**Independent Test**: Click "Refresh", observe dashboard/Confluence update; click again mid-refresh and see a blocked/duplicate message.

- [ ] T034 [US4] In-process refresh guard (single-flight) in `web-app/backend/src/services/refreshService.js` (FR-013)
      **AC**: A second `POST /api/dashboard/refresh` while one is in-flight returns a clear "refresh already running" response instead of starting a second fetch.
- [ ] T035 [US4] [P] "Refresh" button with loading state in `web-app/frontend/src/components/RefreshButton.jsx`
      **AC**: Clicking Refresh disables the button and shows a loading indicator until the request completes, then the dashboard updates.
- [ ] T036 [US4] [P] UI handling of the "refresh already running" response in `web-app/frontend/src/components/RefreshButton.jsx`
      **AC**: If a refresh is already running, the UI shows a clear message rather than silently failing or queuing another request.

**Checkpoint**: All four user stories independently functional and demonstrable.

---

## Phase 6: Polish & Cross-Cutting

- [ ] T037 [P] Unit tests for `blockerDetector` and `sprintMetrics` in `web-app/backend/tests/unit/`
      **AC**: Edge cases (completed-but-overdue, zero-issue sprint) are covered and passing.
- [ ] T038 [P] Component tests for `Dashboard` and `RefreshButton` in `web-app/frontend/tests/`
      **AC**: Tests cover the "no active sprint" state and the refresh loading/blocked states.
- [ ] T039 Manual end-to-end verification against a real Jira/Confluence sandbox
      **AC**: A real board's data appears correctly on both the dashboard and the live Confluence page.
- [ ] T040 Update `README.md`/setup docs for running the app locally via Docker Compose
      **AC**: A new operator can follow the README from a clean checkout to a running app (compose up, migrations, both apps started).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — **blocks all user stories**.
- **User Stories (Phase 3+)**: All depend on Phase 2 completion.
  - Phase 3 (US1+US2) delivers the MVP and should be done first — it's the project's core value.
  - Phase 4 (US3) and Phase 5 (US4) can proceed in priority order (P2 then P3) or in parallel if staffed.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 & US2 (P1)**: Delivered together — Confluence publishing (US2) consumes the same fetch/compute pipeline as the dashboard (US1); not independently useful to split further.
- **US3 (P2)**: Depends only on Phase 2 (config persistence already exists); can be built in parallel with Phase 3 if staffed, though the MVP (Phase 3) should land first.
- **US4 (P3)**: Depends on Phase 3's `POST /api/dashboard/refresh` endpoint existing.

### Within Each Phase

- Tests (where included) should be written before implementation and initially fail.
- Migrations/models before services; services before routes/UI.
- Backend endpoint before the frontend page/component that consumes it.

### Parallel Opportunities

- All `[P]`-marked Setup tasks (T002–T004) can run in parallel.
- All `[P]`-marked Foundational migration tasks (T007–T009) can run in parallel.
- Within Phase 3, US1 tasks (T016–T024) and US2 tasks (T025–T028) touch different files and can be staffed in parallel once T013–T015 tests exist, though T028 depends on both T020 (US1 orchestration) and T027 (US2 publish).

## Implementation Strategy

### MVP First

1. Phase 1: Setup
2. Phase 2: Foundational (blocks everything else)
3. Phase 3: User Story 1 & 2 → **STOP and VALIDATE** against Acceptance Scenarios 1.1–1.2, 2.1–2.3
4. Demo the MVP

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Phase 3 (US1+US2) → validate independently → MVP demo
3. Phase 4 (US3) → validate independently → demo
4. Phase 5 (US4) → validate independently → demo
5. Phase 6 → polish, then full validation against all of `spec/specification.md`'s Success Criteria

## Notes

- `[P]` tasks touch different files and have no unmet dependencies on other unchecked tasks.
- `[Story]` labels map tasks back to `spec/specification.md` user stories for traceability.
- Items marked **out of scope** in `spec/clarify.md` (auth, rate-limit handling, audit logging, retention policy, migration-conflict detection, etc.) are intentionally excluded from this task list.
