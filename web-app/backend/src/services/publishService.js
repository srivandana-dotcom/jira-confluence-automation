const { requireEnv } = require('../config/env');
const { createConfluenceClient, renderDashboardContent } = require('../clients/confluenceClient');

/**
 * FR-006/FR-012: publishes the combined dashboard to the configured Confluence page.
 * Only a failure of this write call itself leaves the previous page content unchanged —
 * per-board fetch failures are rendered as placeholders and still get published (FR-011).
 */
async function publishDashboard(confluencePageId, boardResults, { fetchImpl } = {}) {
  const env = requireEnv(['CONFLUENCE_BASE_URL', 'CONFLUENCE_EMAIL', 'CONFLUENCE_API_TOKEN']);
  const client = createConfluenceClient({ env, fetchImpl });

  const page = await client.getPage(confluencePageId);
  const storageHtml = renderDashboardContent(boardResults);

  await client.updatePage(confluencePageId, {
    title: page.title,
    storageHtml,
    currentVersion: page.version.number,
  });
}

module.exports = { publishDashboard };
