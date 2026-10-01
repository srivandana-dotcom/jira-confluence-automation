const { pool } = require('../db');

/** Always returns the single dashboard_config row (id=1), seeded by migration 001. */
async function getDashboardConfig() {
  const { rows } = await pool.query('SELECT id, confluence_page_id FROM dashboard_config WHERE id = 1');
  return rows[0];
}

async function updateConfluencePageId(confluencePageId) {
  const { rows } = await pool.query(
    'UPDATE dashboard_config SET confluence_page_id = $1 WHERE id = 1 RETURNING id, confluence_page_id',
    [confluencePageId]
  );
  return rows[0];
}

module.exports = { getDashboardConfig, updateConfluencePageId };
