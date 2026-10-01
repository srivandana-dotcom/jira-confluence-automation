const test = require('node:test');
const assert = require('node:assert/strict');
const { resetDb } = require('../helpers/db');
const boardConfigService = require('../../src/services/boardConfigService');
const { refreshAll, RefreshInProgressError } = require('../../src/services/refreshService');

function slowFakeJiraClient() {
  return {
    async getActiveSprint() {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return { id: 1 };
    },
    async getSprintIssues() {
      return [];
    },
    async getSprintBurndown() {
      return {};
    },
  };
}

test('a second refresh while one is in-flight is rejected (FR-013)', async () => {
  await resetDb();
  await boardConfigService.createBoard({ boardId: '1', displayName: 'Board', jiraProjectKey: 'A' });

  const first = refreshAll({ jiraClientFactory: slowFakeJiraClient });
  await assert.rejects(
    refreshAll({ jiraClientFactory: slowFakeJiraClient }),
    RefreshInProgressError
  );
  await first; // let the first refresh finish before the next test resets the DB
});
