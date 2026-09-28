# Project Ideas: Jira/Confluence Automation

## 1. Automated Sprint Health Digest

**Problem it solves:** Managers spend time manually checking sprint boards to gauge progress, spot blockers, and identify at-risk tickets before standups or status meetings. This idea automates a daily/weekly summary posted to Slack/email or a Confluence page, highlighting overdue tickets, unassigned work, and scope changes.

**Data needed:**
- Jira issues in the active sprint (status, assignee, due date, story points, priority)
- Sprint start/end dates and burndown data
- Issue history/changelog (to detect scope creep — items added/removed mid-sprint)
- Comments or flags indicating blockers (e.g., "Blocked" status or label)

## 2. Cross-Team Dependency Tracker

**Problem it solves:** When multiple teams work on interdependent tickets (e.g., Team A's feature blocked by Team B's API), dependencies are often tracked manually or lost in comments. This automation scans linked issues across projects and generates a Confluence dashboard showing dependency chains and their current status, alerting managers when a blocking ticket's status changes.

**Data needed:**
- Jira issue links (e.g., "blocks"/"is blocked by" relationships)
- Issue status and target release/fix version per project
- Project/team ownership metadata (components, labels, or project keys)
- Watchers or assignees to notify on status changes

## 3. Auto-Generated Release Notes & Retrospective Summary

**Problem it solves:** At the end of a release or sprint, managers need to compile what was delivered for stakeholders and prepare retrospective talking points. This automation pulls completed Jira issues for a release/sprint and auto-drafts a Confluence page with categorized release notes (features, bug fixes, tech debt) plus basic retro metrics (cycle time, reopened tickets, scope changes).

**Data needed:**
- Jira issues resolved/closed within the release or sprint, grouped by issue type and labels
- Fix version / release field per issue
- Timestamps for created, in-progress, and resolved dates (to calculate cycle time)
- Count of reopened issues (status transition history)
