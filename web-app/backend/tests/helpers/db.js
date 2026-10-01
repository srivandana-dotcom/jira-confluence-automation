const { pool } = require('../../src/db');

/** Resets all tables between tests so integration tests don't interfere with each other. */
async function resetDb() {
  await pool.query('TRUNCATE blocker_item, sprint_snapshot, board_config RESTART IDENTITY CASCADE');
  await pool.query('UPDATE dashboard_config SET confluence_page_id = NULL WHERE id = 1');
}

module.exports = { resetDb };
