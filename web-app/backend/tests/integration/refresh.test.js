const test = require('node:test');
const assert = require('node:assert/strict');
const { resetDb } = require('../helpers/db');
const boardConfigService = require('../../src/services/boardConfigService');
const snapshotRepository = require('../../src/services/snapshotRepository');
const { refreshAll } = require('../../src/services/refreshService');

function fakeJiraClient() {
  return {
    async getActiveSprint() {
      return { id: 1, name: 'Sprint 1' };
    },
    async getSprintIssues() {
      return [
        { key: 'A-1', fields: { summary: 'Done work', status: { name: 'Done' }, customfield_10016: 3 } },
        {
          key: 'A-2',
          fields: { summary: 'Blocked work', status: { name: 'Blocked' }, customfield_10016: 2 },
        },
      ];
    },
    async getSprintBurndown() {
      return { completedIssuesInitialEstimateSum: 3, issuesNotCompletedInitialEstimateSum: 2 };
    },
  };
}

test('refresh fetches, computes, and persists completion/blockers/burndown for a board', async () => {
  await resetDb();
  const board = await boardConfigService.createBoard({
    boardId: '1',
    displayName: 'Test Board',
    jiraProjectKey: 'TST',
  });

  const { boardResults } = await refreshAll({ jiraClientFactory: fakeJiraClient });

  assert.equal(boardResults.length, 1);
  assert.equal(boardResults[0].snapshot.fetch_status, 'ok');
  assert.equal(boardResults[0].snapshot.completion_pct, 60); // 3 of 5 story points done
  assert.equal(boardResults[0].blockers.length, 1);
  assert.equal(boardResults[0].blockers[0].reason, 'status');

  const persisted = await snapshotRepository.getLatestSnapshots();
  assert.equal(persisted[0].board.id, board.id);
  assert.equal(persisted[0].snapshot.fetch_status, 'ok');
  assert.ok(persisted[0].snapshot.burndown_data);
  assert.equal(persisted[0].blockers.length, 1);
});
