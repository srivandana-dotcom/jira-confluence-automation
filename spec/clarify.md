# Spec Review: Gaps, Contradictions, and Unclear Requirements

**Reviewed documents**: `spec/constitution.md`, `spec/specification.md`
**Reviewer role**: Senior developer pre-implementation review
**Date**: 2026-10-01

This review does not propose solutions beyond a suggested direction — items marked **[NEEDS CLARIFICATION]** should be resolved with the stakeholder before `/speckit-plan`.

## 1. Contradictions

1. ~~**Partial board failure vs. "no publish on failure" (FR-011 vs. FR-012)**~~ **RESOLVED**: A partial board-fetch failure is NOT treated as a "publish step failure." The successful boards are published normally and the failed board is rendered as an error placeholder section on the same Confluence page. FR-012's "leave previous content unchanged" rule now applies only to failures of the Confluence write call itself (auth error, page not found, network failure), not to upstream board-fetch failures. See updated FR-006/FR-011/FR-012 and new Acceptance Scenario 3 under User Story 2 in `spec/specification.md`.

2. ~~**Single on-demand script vs. multi-user web app audience**~~ **RESOLVED** (via Gap #9): The app is operator-only, run locally by a single person; the in-app dashboard (User Story 1) is for that operator, not the broader stakeholder audience, who only ever see the Confluence page (User Story 2). No shared/multi-user access-control model is needed.

3. ~~**Config mechanism: file vs. database vs. UI**~~ **RESOLVED**: Board IDs and the Confluence page ID are stored in PostgreSQL (not a static file), editable by the operator through the app's own UI/API. Since the app is single-operator/local (per Gap #9), this is a single config record, not a multi-tenant admin system. See updated FR-007/FR-008 and the Dashboard Config entity in `spec/specification.md`.

## 2. Gaps (missing requirements)

1. **No authentication/authorization for the web app itself.** **OUT OF SCOPE** — the app is single-operator/local (per resolved Gap #9); no login/SSO required.
2. **No role separation between "admin" (configures boards/Confluence page, per User Story 3) and "viewer" (reads dashboard, per User Story 1).** **OUT OF SCOPE** — single operator fills both roles; no multi-user access model needed.
3. **No non-functional/performance requirements beyond a vague target.** **OUT OF SCOPE** for this iteration — SC-002's wording stands as-is; no concrete latency/throughput targets will be defined.
4. **No API rate-limit / throttling handling.** **OUT OF SCOPE** — no backoff/retry policy will be defined for this iteration.
5. **No audit/observability requirement.** **OUT OF SCOPE** — no refresh/publish logging requirement will be added for this iteration.
6. **No test-strategy details despite constitution's testing mandate.** **OUT OF SCOPE** for this spec — test strategy (mocking Jira/Confluence, fixtures) will be decided at implementation time, not specified here.
7. **No database migration tooling named**, despite the constitution mandating "schema changes go through migrations." **OUT OF SCOPE** for this spec — left to `/speckit-plan`.
8. **No data retention/history policy for Sprint Snapshot.** **OUT OF SCOPE** — no cleanup/retention rule will be defined; latest-snapshot-only behavior (FR-014) stands as-is.
9. ~~**No deployment/hosting target stated.**~~ **RESOLVED**: The app runs locally on a single operator's machine only (matching the original script's model); it is never deployed to a shared/network-reachable host. Non-Jira stakeholders only ever see the published Confluence page, never the app UI itself. See "Deployment" section added to `spec/specification.md`. This also resolves the audience half of Contradiction #2 below (the in-app dashboard is operator-only; it is not intended for the broader stakeholder audience).
10. **No specification of Confluence content format/collision handling.** **OUT OF SCOPE** — manual edits to the target Confluence page being overwritten on refresh is accepted as-is; no collision detection will be added.

## 3. Unclear / Ambiguous Requirements

1. **FR-004 ("source burndown trend from Jira's own sprint report data")** — Jira Cloud's sprint/burndown report data is exposed via the Agile/Greenhopper API (`/rest/agile/1.0/...` or internal `greenhopper` endpoints), not the REST API v3 used elsewhere in FR-001. **OUT OF SCOPE** — the discrepancy is accepted as a known implementation risk to handle at `/speckit-plan`, not resolved in this spec.
2. **"Blocker/at-risk" combination logic (FR-003)** — states three conditions (status, flag/label, overdue) but doesn't specify whether an issue needs to match **any one** of them (OR) or a **specific combination** (AND). **OUT OF SCOPE** — FR-003's wording stands as-is; exact matching logic left to implementation.
3. **SC-005 ("100% of blocker/at-risk items... match the defined flagging rules")** — overlaps with FR-003 rather than adding a new measurable target. **OUT OF SCOPE** — left as-is.
4. **"Reasonable time" (SC-002)** and **"typical board sizes (tens of issues per board)"** — neither is a number. **OUT OF SCOPE** — no concrete thresholds will be defined for this iteration.
5. **FR-013 ("prevent concurrent duplicate refreshes")** — doesn't specify the locking mechanism or scope. **OUT OF SCOPE** — single-operator/local deployment (per resolved Gap #9) makes multi-instance locking unnecessary; a simple in-process guard is sufficient and left to implementation.
6. **Key Entity "Board Config"** has no stated relationship to "Dashboard Config" ownership. **OUT OF SCOPE** — already effectively answered by the single-row Dashboard Config clarification (Contradiction #3 resolution); no further spec change needed.

## Recommendation

All three contradictions and the deployment gap (#9) are resolved: single local operator, no app-level auth needed, config lives in PostgreSQL edited via the app's own UI, and partial board-fetch failures still publish successfully-fetched boards. All remaining gaps and unclear/ambiguous requirements have been explicitly marked **out of scope** for this iteration and are not blockers for `/speckit-plan`.
