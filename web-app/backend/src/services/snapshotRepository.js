const { pool } = require('../db');

/** Persists one board's refresh result (FR-014). Snapshot + its blockers commit atomically. */
async function saveSnapshot(boardConfigId, { completionPct, burndownData, fetchStatus, errorMessage, blockers }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO sprint_snapshot (board_config_id, completion_pct, burndown_data, fetch_status, error_message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [boardConfigId, completionPct, burndownData ? JSON.stringify(burndownData) : null, fetchStatus, errorMessage || null]
    );
    const snapshotId = rows[0].id;

    for (const blocker of blockers || []) {
      await client.query(
        `INSERT INTO blocker_item (sprint_snapshot_id, issue_key, summary, reason, due_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [snapshotId, blocker.issueKey, blocker.summary, blocker.reason, blocker.dueDate]
      );
    }

    await client.query('COMMIT');
    return snapshotId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Latest snapshot per board, for GET /api/dashboard (FR-014). */
async function getLatestSnapshots() {
  const { rows: boards } = await pool.query(
    'SELECT id, board_id, display_name, jira_project_key FROM board_config ORDER BY id'
  );

  const results = [];
  for (const board of boards) {
    const { rows: snapshots } = await pool.query(
      `SELECT id, completion_pct, burndown_data, fetched_at, fetch_status, error_message
       FROM sprint_snapshot WHERE board_config_id = $1 ORDER BY fetched_at DESC LIMIT 1`,
      [board.id]
    );
    const snapshot = snapshots[0] || null;
    let blockers = [];
    if (snapshot) {
      const { rows } = await pool.query(
        'SELECT issue_key, summary, reason, due_date FROM blocker_item WHERE sprint_snapshot_id = $1',
        [snapshot.id]
      );
      blockers = rows;
    }
    results.push({ board, snapshot, blockers });
  }
  return results;
}

module.exports = { saveSnapshot, getLatestSnapshots };
