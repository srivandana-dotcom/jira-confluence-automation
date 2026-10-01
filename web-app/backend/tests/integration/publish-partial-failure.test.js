const test = require('node:test');
const assert = require('node:assert/strict');
const { resetDb } = require('../helpers/db');
const boardConfigService = require('../../src/services/boardConfigService');
const dashboardConfigService = require('../../src/services/dashboardConfigService');
const { refreshAll } = require('../../src/services/refreshService');
const { renderDashboardContent } = require('../../src/clients/confluenceClient');

function fakeJiraClientWithOneFailure() {
  return {
    async getActiveSprint(boardId) {
      if (boardId === '2') {
        throw new Error('Jira request failed (401) for board 2');
      }
      return { id: 1 };
    },
    async getSprintIssues() {
      return [{ key: 'A-1', fields: { summary: 'Work', status: { name: 'Done' } } }];
    },
    async getSprintBurndown() {
      return {};
    },
  };
}

test('2 of 3 boards succeed: publish still happens with an error placeholder for the failed board', async () => {
  await resetDb();
  await boardConfigService.createBoard({ boardId: '1', displayName: 'Board One', jiraProjectKey: 'A' });
  await boardConfigService.createBoard({ boardId: '2', displayName: 'Board Two', jiraProjectKey: 'B' });
  await boardConfigService.createBoard({ boardId: '3', displayName: 'Board Three', jiraProjectKey: 'C' });
  await dashboardConfigService.updateConfluencePageId('999');

  const publishCalls = [];
  const fakePublishFn = async (pageId, boardResults) => {
    publishCalls.push({ pageId, boardResults });
  };

  const { boardResults, publishError } = await refreshAll({
    jiraClientFactory: fakeJiraClientWithOneFailure,
    publishFn: fakePublishFn,
  });

  assert.equal(publishError, null);
  assert.equal(boardResults.length, 3);

  const statuses = boardResults.map((r) => r.snapshot.fetch_status);
  assert.deepEqual(statuses, ['ok', 'error', 'ok']);

  // The publish step still ran (FR-011/FR-012: a board-fetch failure is not a "publish step" failure).
  assert.equal(publishCalls.length, 1);

  const content = renderDashboardContent(publishCalls[0].boardResults);
  assert.match(content, /Board One/);
  assert.match(content, /Board Three/);
  assert.match(content, /Board Two/);
  assert.match(content, /Error fetching this board/);
});
