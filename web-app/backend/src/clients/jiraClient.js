const { requireEnv } = require('../config/env');

function authHeader(email, apiToken) {
  const token = Buffer.from(`${email}:${apiToken}`).toString('base64');
  return `Basic ${token}`;
}

/**
 * Minimal Jira Cloud client.
 * `fetchImpl` is injectable so tests can supply a stub instead of calling the real network.
 * `sprintIssuesPageSize` is injectable so tests can exercise pagination without 100+ fixtures.
 */
function createJiraClient({ fetchImpl = fetch, sprintIssuesPageSize = 100 } = {}) {
  const env = requireEnv(['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN']);
  const headers = {
    Authorization: authHeader(env.JIRA_EMAIL, env.JIRA_API_TOKEN),
    Accept: 'application/json',
  };

  async function getJson(path) {
    const res = await fetchImpl(`${env.JIRA_BASE_URL}${path}`, { headers });
    if (!res.ok) {
      throw new Error(`Jira request failed (${res.status}) for ${path}`);
    }
    return res.json();
  }

  /** Returns the active sprint for a board, or null if there isn't one (FR-001). */
  async function getActiveSprint(boardId) {
    const data = await getJson(`/rest/agile/1.0/board/${boardId}/sprint?state=active`);
    return data.values && data.values.length > 0 ? data.values[0] : null;
  }

  /** Returns all issues in a sprint, paging through results (FR-001, FR-002, FR-003 inputs). */
  async function getSprintIssues(sprintId) {
    let startAt = 0;
    let issues = [];
    // Jira paginates this endpoint; keep fetching until a page comes back short of the page size.
    for (;;) {
      const data = await getJson(
        `/rest/agile/1.0/sprint/${sprintId}/issue?fields=summary,status,duedate,labels,flagged,customfield_10016&startAt=${startAt}&maxResults=${sprintIssuesPageSize}`
      );
      const page = data.issues || [];
      issues = issues.concat(page);
      if (page.length < sprintIssuesPageSize) break;
      startAt += page.length;
    }
    return issues;
  }

  /**
   * Burndown data (FR-004). Jira Cloud does not expose sprint burndown via REST API v3 or the
   * public Agile API — this uses the same internal "greenhopper" endpoint the Jira UI itself
   * calls. It is unofficial and may change/break without notice (see spec/clarify.md risk note);
   * callers must treat its absence/failure as non-fatal to the rest of the refresh (FR-011).
   */
  async function getSprintBurndown(boardId, sprintId) {
    const data = await getJson(
      `/rest/greenhopper/1.0/rapid/charts/sprintreport?rapidViewId=${boardId}&sprintId=${sprintId}`
    );
    return {
      completedIssuesInitialEstimateSum: data.contents?.completedIssuesInitialEstimateSum ?? null,
      issuesNotCompletedInitialEstimateSum: data.contents?.issuesNotCompletedInitialEstimateSum ?? null,
      completedIssuesCount: data.contents?.completedIssues?.length ?? null,
      issuesNotCompletedCount: data.contents?.issuesNotCompletedInCurrentSprint?.length ?? null,
    };
  }

  return { getActiveSprint, getSprintIssues, getSprintBurndown };
}

module.exports = { createJiraClient };
