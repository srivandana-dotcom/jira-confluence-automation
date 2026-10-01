function authHeader(email, apiToken) {
  const token = Buffer.from(`${email}:${apiToken}`).toString('base64');
  return `Basic ${token}`;
}

/** Minimal Confluence Cloud client. `fetchImpl` is injectable for tests. */
function createConfluenceClient({ env, fetchImpl = fetch }) {
  const headers = {
    Authorization: authHeader(env.CONFLUENCE_EMAIL, env.CONFLUENCE_API_TOKEN),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  async function getPage(pageId) {
    const res = await fetchImpl(`${env.CONFLUENCE_BASE_URL}/rest/api/content/${pageId}?expand=version`, {
      headers,
    });
    if (!res.ok) {
      throw new Error(`Confluence getPage failed (${res.status}) for page ${pageId}`);
    }
    return res.json();
  }

  /** FR-006/FR-012: overwrites the page in place; throws (page left unchanged) if the write itself fails. */
  async function updatePage(pageId, { title, storageHtml, currentVersion }) {
    const res = await fetchImpl(`${env.CONFLUENCE_BASE_URL}/rest/api/content/${pageId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        id: pageId,
        type: 'page',
        title,
        version: { number: currentVersion + 1 },
        body: { storage: { value: storageHtml, representation: 'storage' } },
      }),
    });
    if (!res.ok) {
      throw new Error(`Confluence updatePage failed (${res.status}) for page ${pageId}`);
    }
    return res.json();
  }

  return { getPage, updatePage };
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** FR-005/FR-006: formats the raw greenhopper burndown payload into a done-vs-remaining summary. */
function renderBurndown(burndown) {
  const {
    completedIssuesCount,
    issuesNotCompletedCount,
    completedIssuesInitialEstimateSum,
    issuesNotCompletedInitialEstimateSum,
  } = burndown || {};
  if (
    completedIssuesCount == null &&
    issuesNotCompletedCount == null &&
    completedIssuesInitialEstimateSum == null &&
    issuesNotCompletedInitialEstimateSum == null
  ) {
    return '<h3>Burndown</h3><p>Burndown data unavailable.</p>';
  }
  return `<h3>Burndown</h3><ul>
    <li>Done: ${completedIssuesCount ?? '—'} issues (${completedIssuesInitialEstimateSum ?? '—'} pts)</li>
    <li>Remaining: ${issuesNotCompletedCount ?? '—'} issues (${issuesNotCompletedInitialEstimateSum ?? '—'} pts)</li>
  </ul>`;
}

/**
 * FR-006/FR-011: renders one section per board in Confluence storage format.
 * Boards that failed to fetch (or have no active sprint) render as a labeled placeholder
 * instead of blocking the rest of the page from publishing.
 */
function renderDashboardContent(boardResults) {
  const sections = boardResults.map(({ board, snapshot, blockers }) => {
    const heading = `<h2>${escapeHtml(board.display_name)} (${escapeHtml(board.board_id)})</h2>`;

    if (!snapshot || snapshot.fetch_status === 'error') {
      const reason = snapshot?.error_message || 'Unknown error';
      return `${heading}<p><strong>⚠ Error fetching this board:</strong> ${escapeHtml(reason)}</p>`;
    }

    if (snapshot.fetch_status === 'no_active_sprint') {
      return `${heading}<p>No active sprint.</p>`;
    }

    const blockerRows = (blockers || [])
      .map(
        (b) =>
          `<tr><td>${escapeHtml(b.issue_key)}</td><td>${escapeHtml(b.summary)}</td><td>${escapeHtml(b.reason)}</td></tr>`
      )
      .join('');

    const blockerTable =
      blockers && blockers.length > 0
        ? `<table><tbody><tr><th>Issue</th><th>Summary</th><th>Reason</th></tr>${blockerRows}</tbody></table>`
        : '<p>No blockers.</p>';

    return `${heading}<p>Completion: ${snapshot.completion_pct}%</p>${blockerTable}${renderBurndown(snapshot.burndown_data)}`;
  });

  const updatedAt = new Date().toISOString();
  return `<p><em>Last updated: ${escapeHtml(updatedAt)}</em></p>${sections.join('')}`;
}

module.exports = { createConfluenceClient, renderDashboardContent };
