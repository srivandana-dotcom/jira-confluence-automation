# Cross-Artifact Analysis: Constitution, Specification, Plan, Tasks

**Reviewed documents**: `spec/constitution.md`, `spec/specification.md`, `spec/plan.md`, `spec/tasks.md`, `spec/clarify.md`
**Reviewer role**: Senior developer pre-implementation review
**Date**: 2026-10-01

## 1. Task-by-Task Complexity, Risk, and Dependency Assessment

| Task | Complexity | Key Dependencies | Primary Risk(s) |
|---|---|---|---|
| T001 Wire up backend/frontend entry points | Low | — | Minimal; boilerplate only |
| T002 Postgres service in docker-compose | Low | — | Local port conflicts |
| T003 `.env.example` credentials | Low | — | Missing a var discovered late (mitigated by T009/T016/T025 using it) |
| T004 ESLint/Prettier config | Low | — | None significant |
| T005 Migration tool wiring | Medium | T002 | Tool choice affects every later migration task; must support down-migrations |
| T006 `dashboard_config` migration + seed | Low–Medium | T005 | Seed-on-migrate must be idempotent (re-running shouldn't duplicate the row) |
| T007 `board_config` migration | Low | T005 | None significant |
| T008 `sprint_snapshot` migration (FK + JSON) | Medium | T005, T007 | JSON schema for `burndown_data` undefined; FK ordering |
| T009 `blocker_item` migration | Low | T005, T008 | None significant |
| T010 DB connection/pool module | Medium | T002, T005 | Pool sizing/retry behavior unspecified; startup failure handling |
| T011 Board Config service | Medium | T007, T010 | No uniqueness constraint specified for `board_id` (duplicate boards possible) |
| T012 Dashboard Config service (single row) | Medium | T006, T010 | Enforcing the single-row invariant under concurrent writes |
| T013 Integration test: refresh (mocked board) | Medium | T010–T012 | **No mocking strategy/library chosen** for Jira client — blocks writing this test concretely |
| T014 Integration test: publish (mocked Confluence) | Medium | T013 patterns | Same mocking-strategy gap as T013 |
| T015 Integration test: partial-failure scenario | Medium–High | T013, T014, (conceptually) T020 | Written as a test-first task, but depends on orchestration logic (T020) not yet implemented — ordering risk if following strict TDD |
| T016 Jira client: fetch issues/points | **High** | T003 | External API shape/auth/pagination; largest source of real-world risk in the MVP |
| T017 Completion % calculation | Low | T016 | Divide-by-zero on 0-issue sprint (called out as AC, low residual risk) |
| T018 Blocker/at-risk flagging (OR logic) | Medium | T016 | Resolves an ambiguity `spec/clarify.md` marked "out of scope" (AND/OR) — see Contradiction #1 below |
| T019 Burndown data fetch | **High** | T016 | Jira's burndown/sprint-report data lives on the Agile API, not REST v3 — flagged as an accepted risk in `spec/clarify.md`; could require a different client/auth path entirely |
| T020 Per-board error isolation/orchestration | Medium–High | T016–T019 | Correct partial-result aggregation; must not let one board's exception kill the whole run |
| T021 Persist snapshot + blocker rows | Medium | T008, T009, T020 | Transactional integrity (snapshot + its blockers should commit together) |
| T022 `GET /api/dashboard` | Low–Medium | T021 | None significant |
| T023 Frontend dashboard view | Medium | T022 | No charting/burndown-rendering library chosen — gap |
| T024 "No active sprint" UI state | Low–Medium | T023, **and an unimplemented backend signal** | See Gap #2 below — no backend task produces this status |
| T025 Confluence client: render content | **High** | T016–T021 (data shape) | Confluence storage-format correctness/macros; format itself was never decided |
| T026 Error-placeholder rendering | Medium | T025 | None significant beyond T025's risk |
| T027 Publish call, unchanged-on-failure semantics | **High** | T025, T026 | Must correctly distinguish "board fetch failed" from "Confluence write failed" — getting this wrong silently reintroduces the contradiction already resolved in `spec/clarify.md` |
| T028 Wire `POST /api/dashboard/refresh` | **High** | T020, T021, T027 | Central integration point of the whole MVP; highest blast radius if it's wrong |
| T029 Integration test: board config API | Low–Medium | T011, T030 | None significant |
| T030 Board config CRUD routes | Medium | T011 | Input validation at the API boundary (constitution requirement) not detailed |
| T031 Confluence-page config routes | Low | T012 | None significant |
| T032 Credential error reporting | Medium | T016, T025 clients | Depends on credential loading that has **no explicit task** (see Gap #1) |
| T033 Frontend settings page | Medium | T030, T031 | Form validation/UX edge cases (e.g., invalid board ID format) unspecified |
| T034 In-process refresh guard | Medium | T028 | Lock could get "stuck" if a refresh crashes mid-flight without releasing it |
| T035 Refresh button with loading state | Low | T028 | None significant |
| T036 UI handling of "already running" response | Low | T034, T035 | None significant |
| T037 Unit tests: blockerDetector/sprintMetrics | Low | T017, T018 | None significant |
| T038 Frontend component tests | Medium | T023, T024, T035, T036 | **No frontend test framework chosen** (e.g., Vitest/RTL) — gap |
| T039 Manual e2e verification | Medium–High | All prior tasks | Requires a real Jira/Confluence sandbox; likely to surface T016/T019/T025 issues late |
| T040 README/docs update | Low | All prior tasks | None significant |

**Highest-risk tasks overall**: T016, T019, T025, T027, T028 — these sit on the critical path of the MVP (Phase 3) and each carries a "High" risk rating. Recommend spiking T019 (burndown API feasibility) and T016 (Jira client auth/shape) **before** committing to the rest of Phase 3's estimate, since clarify.md already flags this as an accepted-but-unverified risk.

## 2. Gaps

1. **No task implements FR-009 (credential loading/validation) as a standalone unit.** It's implicitly bundled into T016 (Jira client), T025 (Confluence client), and T032 (error reporting), but there's no task that owns "read and validate required env vars at startup." Recommend adding a small explicit task before T016/T025.
2. **No backend task produces the "no active sprint" signal** that T024 (frontend) depends on. FR-001/FR-004/T016/T019 describe fetching sprint data but never say what happens when there is no active sprint for a board — this needs to be an explicit status value on `sprint_snapshot` (e.g., `fetch_status = 'no_active_sprint'`), not just a frontend concern.
3. **No testing framework is chosen anywhere** (backend: Jest/Mocha/Vitest; frontend: Vitest + React Testing Library, etc.), despite 5 tasks (T013–T015, T037, T038) referencing concrete test file paths. This directly conflicts with `spec/clarify.md` Gap #6, which marked "test strategy" as **out of scope** for the spec — yet `tasks.md` already assumes tests will be written. See Contradiction #2 below.
4. **No mocking strategy for Jira/Confluence clients in tests** (T013–T015). Without this, those tasks can't be executed concretely — recommend a small "test fixtures/mocks" task ahead of T013.
5. **No charting/burndown-rendering library chosen** for T023, and **no Confluence content-format decision** (storage format vs. XHTML macros) recorded for T025 — both are implementation decisions currently deferred with no placeholder task to make them.
6. **No input-validation specification** for the config API routes (T030/T031), despite the constitution explicitly requiring "validate and sanitize all input at API boundaries."

## 3. Contradictions

1. **`spec/clarify.md` marks the blocker AND/OR logic "out of scope... left to implementation," but `spec/plan.md` and `spec/tasks.md` (T018) already resolve it as OR.** This isn't necessarily wrong — it's a reasonable implementation decision — but `spec/clarify.md` was never updated to record the decision, so the three documents are now out of sync on this point. Recommend updating `spec/clarify.md` item 3.2 to note "Resolved during planning: OR logic, see tasks.md T018."
2. **`spec/clarify.md` Gap #6 marks "test-strategy details" as out of scope for the spec, but `spec/tasks.md` includes 5 concrete test tasks (T013–T015, T037, T038) with specific file paths.** Either the out-of-scope marking should be narrowed (e.g., "test *tooling choice* is out of scope for the spec but tasks.md may still include test tasks naming it"), or the test tasks should be reconsidered as "define test framework" placeholders rather than assuming one implicitly.
3. **Phase numbering is inconsistent between `spec/plan.md` and `spec/tasks.md`.** `plan.md` numbers Setup as Phase 0, Foundational as Phase 1, US1+US2 as Phase 2, US3 as Phase 3, US4 as Phase 4, Hardening as Phase 5. `tasks.md` numbers the same groups 1 through 6 respectively (off by one throughout). Referring to "Phase 2" is ambiguous depending on which document is being read. Recommend aligning the numbering (easiest fix: renumber `plan.md` to start at Phase 1 to match `tasks.md`).
4. **Data-model relationship mismatch**: `spec/specification.md`'s Key Entities section describes `Dashboard Config` as holding "a list of tracked board configs" (implying ownership/a relationship), and `spec/plan.md`'s Data Model table lists `board_config` as a standalone table with no foreign key back to `dashboard_config`. As written, nothing in the schema actually links board configs to the single dashboard config row — the relationship described in prose doesn't exist in the table design. Recommend either adding a `dashboard_config_id` FK to `board_config` in `plan.md`/T007, or rewording the Key Entities description to say the relationship is implicit (single dashboard, so all boards belong to it by default, no FK needed).

## 4. Missing Artifacts

1. **No `research.md`.** `spec/tasks.md`'s own header (inherited from the Spec Kit template) says prerequisites include `research.md`, but this file doesn't exist in `spec/`. In particular, the two "High risk" API-surface questions (T016's Jira REST v3 usage, T019's Agile/burndown API) are exactly the kind of open technical questions `research.md` is meant to capture and resolve before planning. Recommend creating `spec/research.md` to record the Jira Agile API investigation before starting T019.
2. **No `data-model.md`.** The data model currently lives only as a table inside `spec/plan.md`. This is workable for a project this size, but means there's no single authoritative place to reconcile Contradiction #4 above (the `Dashboard Config` ↔ `Board Config` relationship) — it's easy for prose (specification.md) and schema (plan.md) to drift further apart without a dedicated, FK-complete data model doc.
3. **No `contracts/` directory / OpenAPI-style contract files.** The API surface is listed as a markdown table in `plan.md`; there's no request/response schema for any endpoint (e.g., what `POST /api/dashboard/refresh`'s response body looks like for the partial-failure case described in FR-011/T028). Given T028 is flagged as a "High" risk task specifically because of this partial-success/partial-failure response shape, a contract file would materially reduce that risk.
4. **Folder-structure deviation from standard Spec Kit layout.** Spec Kit normally expects `specs/<NNN-feature-name>/{spec.md,plan.md,tasks.md,research.md,data-model.md,contracts/}`. This project instead stores everything flatly under `spec/` (`constitution.md`, `specification.md`, `clarify.md`, `plan.md`, `tasks.md`). Not a functional problem, but `tasks.md`'s header text still says "Input: Design documents from `/specs/[###-feature-name]/`" — a leftover from the template that is now inaccurate and should be corrected to reference `spec/`.

## 5. Recommendations (Priority Order)

1. Resolve Contradiction #4 (Dashboard Config ↔ Board Config FK) and Gap #2 (no-active-sprint signal) — both affect the data model and should be fixed before Phase 2 migrations (T006–T009) are written.
2. Create `spec/research.md` and spike T016/T019's Jira API questions before estimating the rest of Phase 3 — these are the two highest-risk tasks in the whole task list.
3. Decide a backend and frontend test framework (closing Gap #3/#4) before starting T013, since multiple tasks reference concrete test file paths that can't be written without this decision.
4. Fix the Phase-numbering mismatch (Contradiction #3) and the stale template header in `tasks.md` (Missing Artifact #4) — both are quick documentation fixes.
5. Treat Gap #1 (credential loading) and Gap #5/#6 (charting library, Confluence format, input validation) as small follow-up tasks to add to `spec/tasks.md` before Phase 3/4 implementation begins.
