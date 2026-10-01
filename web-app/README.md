# Jira Sprint Progress Dashboard (Confluence Publishing)

On-demand local web app that pulls sprint progress from multiple Jira Cloud boards,
computes completion %, blockers, and burndown, displays it in a dashboard, and
publishes a combined view to a single Confluence page.

See `spec/` at the repo root for the full specification, plan, and task list.

## Stack

- `frontend/` — React 18 + Vite
- `backend/` — Node.js + Express + PostgreSQL 15 (via `pg`)
- `docker-compose.yml` — PostgreSQL 15 service

## Deployment model

Runs **locally, for a single operator** — not deployed to a shared host. There is
no application-level login; access is controlled by access to your machine. See
`spec/specification.md`'s "Deployment" section for details.

## Prerequisites

- Node.js 18+ and npm
- Docker (for PostgreSQL)

## Setup

1. **Start the database**

   ```powershell
   cd web-app
   docker compose up -d
   ```

2. **Configure the backend**

   ```powershell
   cd web-app/backend
   copy .env.example .env
   # Edit .env: set JIRA_BASE_URL/JIRA_EMAIL/JIRA_API_TOKEN and
   # CONFLUENCE_BASE_URL/CONFLUENCE_EMAIL/CONFLUENCE_API_TOKEN.
   # DATABASE_URL's default matches docker-compose.yml's defaults.
   npm install
   npm run migrate
   npm run dev
   ```

   The backend listens on `http://localhost:3001` (`GET /api/health` to verify).

3. **Start the frontend**

   ```powershell
   cd web-app/frontend
   npm install
   npm run dev
   ```

   Open `http://localhost:5173`. The dev server proxies `/api` to the backend.

4. **Configure boards and the Confluence page**

   Use the **Settings** tab in the UI to add Jira boards (board ID, display name,
   Jira project key) and set the target Confluence page ID. Then click **Refresh**
   on the **Dashboard** tab.

## Running tests

```powershell
# Backend (requires the Postgres container from step 1 to be running)
cd web-app/backend
npm test

# Frontend
cd web-app/frontend
npm test
```

## Linting

```powershell
npm run lint   # in web-app/backend and/or web-app/frontend
```

## Known limitations / risks

- **Burndown data** (`FR-004`) uses Jira's internal "greenhopper" sprint-report
  endpoint, which is not part of the official public API and may change without
  notice. If it breaks, the rest of a board's refresh (completion %, blockers)
  is unaffected.
- **Story points** are read from `customfield_10016`, which is the common default
  for that field in Jira Cloud but is instance-specific; if your instance uses a
  different field ID, completion % falls back to issue-count based calculation.
- No authentication, rate-limit handling, audit logging, or snapshot history/
  retention policy — all explicitly out of scope for this iteration (see
  `spec/clarify.md`).
- End-to-end verification against a **real** Jira/Confluence instance (tasks.md
  T039) has not been performed — only the integration test suite (mocked Jira/
  Confluence clients) and one manual smoke test against a real Jira Cloud auth
  endpoint (which correctly returned and isolated a 401 error) have been run.
