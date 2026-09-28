# Requirements: Jira Sprint Progress Dashboard

## Overview
An on-demand Python script that pulls sprint progress data from multiple Jira Cloud boards and publishes a combined dashboard to a single Confluence page.

## Data Source
- **Jira Cloud** (REST API v3), authenticated via email + API token (stored in `.env`, already excluded via `.gitignore`).

## Scope
- **Multiple boards**, identified by explicit **board IDs** listed in a config file (not auto-discovered).

## Metrics per Board
- **Completion %** — issues/story points done vs. total in the current sprint.
- **Blockers / at-risk items** — flagged using a **combination** of:
  - Status is "Blocked" (or equivalent)
  - Issue has a flag/impediment or specific label
  - Due date has passed and issue is still open
- **Burndown trend** — sourced from Jira's own sprint report data (no custom historical snapshot storage, since refresh is on-demand only).

## Output
- **Confluence**: a single combined dashboard page, updated in place on each run, with one section per board.
- Confluence page ID and Jira board IDs will be left as **placeholders** in a config file for the user to fill in.

## Refresh Behavior
- **On-demand only** — the user runs the script manually when they want an updated snapshot; no scheduler/cron/Task Scheduler integration.

## Implementation
- **Language:** Python, consistent with the rest of the workspace.
- **Libraries:** `requests` (Jira/Confluence REST calls), `python-dotenv` (credential loading from `.env`).

## Open Items (to be filled in before running)
- Real Jira board IDs to track.
- Real Confluence page ID to update.
