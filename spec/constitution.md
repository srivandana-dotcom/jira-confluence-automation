# Project Constitution: Jira/Confluence Automation

## Purpose
Principles and constraints governing all specs, plans, and implementation work for this project. All specifications and technical plans must be consistent with this document; where a conflict exists, this constitution takes precedence.

## Tech Stack (fixed)
- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Database:** PostgreSQL 15, run via Docker
- Any deviation from this stack requires an explicit amendment to this constitution before a spec/plan may adopt it.

## Core Principles

### 1. Code Quality
- Code must be linted and formatted consistently (ESLint/Prettier for JS/TS) before merge.
- No dead code, commented-out blocks, or unused dependencies left in the codebase.
- Functions and modules should have a single, clear responsibility.

### 2. Testing
- New backend logic (routes, services, data access) requires automated tests before being considered done.
- Critical frontend flows (auth, data fetch/render, forms) require at least basic component/integration tests.
- Tests must pass locally and in CI before merge; no merging with known-failing tests.

### 3. Security
- Jira/Confluence credentials (API tokens, emails) are never hardcoded — loaded from environment variables / `.env`, excluded via `.gitignore`.
- All external API calls (Jira, Confluence) go through a single backend service layer — the frontend never calls third-party APIs directly.
- Validate and sanitize all input at API boundaries (Express routes).

### 4. Simplicity & Maintainability
- Prefer the simplest solution that satisfies the spec; avoid speculative abstractions or unused configurability.
- Database schema changes go through migrations — no manual/ad-hoc schema edits against the running Postgres instance.
- Docker Compose is the source of truth for local environment setup (frontend, backend, database services).

### 5. Traceability
- Every feature implementation must trace back to an approved spec and plan.
- Deviations discovered during implementation are reflected back into the spec/plan, not silently coded around.

## Governance
- This constitution may be amended, but amendments must be explicit, documented, and applied before dependent specs/plans are written against the new rule.
- Specs and plans are reviewed against this constitution before implementation begins.
