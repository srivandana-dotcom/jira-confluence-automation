const test = require('node:test');
const assert = require('node:assert/strict');
const { resetDb } = require('../helpers/db');
const { createApp } = require('../../src/app');

test('adding a board via the config API makes it appear in the next dashboard read', async () => {
  await resetDb();
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;
  const base = `http://localhost:${port}/api`;

  try {
    const createRes = await fetch(`${base}/config/boards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId: '42', displayName: 'New Board', jiraProjectKey: 'NEW' }),
    });
    assert.equal(createRes.status, 201);

    const listRes = await fetch(`${base}/config/boards`);
    const boards = await listRes.json();
    assert.equal(boards.length, 1);
    assert.equal(boards[0].board_id, '42');

    const dashboardRes = await fetch(`${base}/dashboard`);
    const dashboard = await dashboardRes.json();
    assert.equal(dashboard.length, 1);
    assert.equal(dashboard[0].board.board_id, '42');
    assert.equal(dashboard[0].snapshot, null); // no refresh run yet, but the board is visible
  } finally {
    server.close();
  }
});

test('rejects a board with missing required fields', async () => {
  await resetDb();
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/config/boards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId: '42' }),
    });
    assert.equal(res.status, 400);
  } finally {
    server.close();
  }
});
