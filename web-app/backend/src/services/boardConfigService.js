const { pool } = require('../db');

async function listBoards() {
  const { rows } = await pool.query(
    'SELECT id, board_id, display_name, jira_project_key, created_at FROM board_config ORDER BY id'
  );
  return rows;
}

async function createBoard({ boardId, displayName, jiraProjectKey }) {
  const { rows } = await pool.query(
    `INSERT INTO board_config (board_id, display_name, jira_project_key)
     VALUES ($1, $2, $3)
     RETURNING id, board_id, display_name, jira_project_key, created_at`,
    [boardId, displayName, jiraProjectKey]
  );
  return rows[0];
}

async function deleteBoard(id) {
  const { rowCount } = await pool.query('DELETE FROM board_config WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { listBoards, createBoard, deleteBoard };
