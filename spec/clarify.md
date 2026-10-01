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

1. **No authentication/authorization for the web app itself.** The constitution requires input validation at API boundaries but says nothing about who can load the dashboard UI or trigger a refresh. If stakeholders outside the Jira-using team can view it, is the app open to anyone with network access, or does it need login/SSO? This is unaddressed in both documents.
2. **No role separation between "admin" (configures boards/Confluence page, per User Story 3) and "viewer" (reads dashboard, per User Story 1).** Without this, any user with network access to the app could change board configuration.
3. **No non-functional/performance requirements beyond a vague target.** SC-002 ("within a reasonable time for typical board sizes") is not measurable, which directly violates the specification template's own rule that success criteria must be measurable. No concrete latency/throughput target, no definition of "typical" board size, no stated limit on number of boards.
4. **No API rate-limit / throttling handling.** Jira and Confluence Cloud APIs enforce rate limits; the spec defines per-board error isolation (FR-011) but not behavior when Jira/Confluence returns a 429, nor backoff/retry policy.
5. **No audit/observability requirement.** For a shared, multi-user tool that writes to a shared Confluence page, there's no requirement to log who triggered a refresh or when the last successful publish occurred (useful both for debugging and for stakeholder trust in the data).
6. **No test-strategy details despite constitution's testing mandate.** The constitution requires automated backend tests and basic frontend tests before work is "done," but the spec doesn't address how to test against Jira/Confluence (e.g., mocked API responses, fixture data, sandbox/test instance) — a real gap since this project is entirely dependent on two external APIs.
7. **No database migration tooling named**, despite the constitution mandating "schema changes go through migrations." (Expected to be resolved at `/speckit-plan` stage, but worth flagging so it isn't skipped.)
8. **No data retention/history policy for Sprint Snapshot.** Assumptions state Postgres holds only the latest snapshot per board, but there's no explicit requirement preventing unbounded accumulation of historical snapshot rows over time (cleanup/retention rule).
9. ~~**No deployment/hosting target stated.**~~ **RESOLVED**: The app runs locally on a single operator's machine only (matching the original script's model); it is never deployed to a shared/network-reachable host. Non-Jira stakeholders only ever see the published Confluence page, never the app UI itself. See "Deployment" section added to `spec/specification.md`. This also resolves the audience half of Contradiction #2 below (the in-app dashboard is operator-only; it is not intended for the broader stakeholder audience).
10. **No specification of Confluence content format/collision handling.** FR-006 says the page content is replaced in place, but doesn't address what happens if a human has manually edited that Confluence page between automated refreshes (their edits would be silently overwritten) — worth at least an explicit assumption either way.

## 3. Unclear / Ambiguous Requirements

1. **FR-004 ("source burndown trend from Jira's own sprint report data")** — Jira Cloud's sprint/burndown report data is exposed via the Agile/Greenhopper API (`/rest/agile/1.0/...` or internal `greenhopper` endpoints), not the REST API v3 used elsewhere in FR-001. The spec treats this as a simple data source without acknowledging it may require a different API surface, auth scope, or may not be officially supported for programmatic access. **[NEEDS CLARIFICATION — verify API availability before planning]**
2. **"Blocker/at-risk" combination logic (FR-003)** — states three conditions (status, flag/label, overdue) but doesn't specify whether an issue needs to match **any one** of them (OR) or a **specific combination** (AND), despite the word "combination" suggesting AND. The edge case list implies OR (independent triggers), but this should be stated explicitly as a testable rule.
3. **SC-005 ("100% of blocker/at-risk items... match the defined flagging rules")** — this is really a correctness/testing requirement restated as a success criterion, not an independently measurable business outcome; it overlaps with FR-003 rather than adding a new measurable target.
4. **"Reasonable time" (SC-002)** and **"typical board sizes (tens of issues per board)"** — neither is a number; can't be used as a pass/fail gate for testing or performance review.
5. **FR-013 ("prevent concurrent duplicate refreshes")** — doesn't specify the locking mechanism or scope (per-user, global single-flight, per-board), which matters a lot if the backend is ever scaled to multiple instances/containers.
6. **Key Entity "Board Config"** has no stated relationship to "Dashboard Config" ownership — is there one global Dashboard Config row, or could multiple dashboards/configs exist? Spec implies a single combined dashboard (singular Confluence page) but the data model section doesn't confirm this as a constraint (e.g., unique single-row config vs. multi-tenant).

## Recommendation

All three contradictions and the deployment gap (#9) are now resolved: single local operator, no app-level auth needed, config lives in PostgreSQL edited via the app's own UI, and partial board-fetch failures still publish successfully-fetched boards. The remaining gaps/ambiguities (performance targets, rate-limit handling, audit logging, test strategy, migration tooling, retention policy, Confluence collision handling, and the unclear/ambiguous requirements) can be captured as open clarification items and resolved incrementally, but should not be silently assumed during planning.
