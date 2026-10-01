const test = require('node:test');
const assert = require('node:assert/strict');
const { resetDb } = require('../helpers/db');
const boardConfigService = require('../../src/services/boardConfigService');
const dashboardConfigService = require('../../src/services/dashboardConfigService');
const { refreshAll } = require('../../src/services/refreshService');

function fakeJiraClient() {
  return {
    async getActiveSprint() {
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

test('refresh publishes the combined dashboard to the configured Confluence page', async () => {
  await resetDb();
  await boardConfigService.createBoard({
    boardId: '1',
    displayName: 'Test Board',
    jiraProjectKey: 'TST',
  });
  await dashboardConfigService.updateConfluencePageId('999');

  const publishCalls = [];
  const fakePublishFn = async (pageId, boardResults) => {
    publishCalls.push({ pageId, boardResults });
  };

  const { publishError } = await refreshAll({
    jiraClientFactory: fakeJiraClient,
    publishFn: fakePublishFn,
  });

  assert.equal(publishError, null);
  assert.equal(publishCalls.length, 1);
  assert.equal(publishCalls[0].pageId, '999');
  assert.equal(publishCalls[0].boardResults.length, 1);
  assert.equal(publishCalls[0].boardResults[0].snapshot.fetch_status, 'ok');
});
