const test = require('node:test');
const assert = require('node:assert/strict');
const { createJiraClient } = require('../../src/clients/jiraClient');

function setEnv() {
  process.env.JIRA_BASE_URL = 'https://example.atlassian.net';
  process.env.JIRA_EMAIL = 'user@example.com';
  process.env.JIRA_API_TOKEN = 'token';
}

test('getSprintIssues pages through results until a short page is returned', async () => {
  setEnv();
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    const startAt = Number(new URL(url).searchParams.get('startAt'));
    // Two full pages of 2, then a short final page of 1 — total 5 issues across 3 calls.
    const pages = {
      0: [{ key: 'A-1' }, { key: 'A-2' }],
      2: [{ key: 'A-3' }, { key: 'A-4' }],
      4: [{ key: 'A-5' }],
    };
    return { ok: true, json: async () => ({ issues: pages[startAt] }) };
  };

  const jira = createJiraClient({ fetchImpl, sprintIssuesPageSize: 2 });
  const issues = await jira.getSprintIssues(123);

  assert.deepEqual(
    issues.map((i) => i.key),
    ['A-1', 'A-2', 'A-3', 'A-4', 'A-5']
  );
  assert.equal(calls.length, 3);
});

test('getSprintIssues stops after a single short page', async () => {
  setEnv();
  const fetchImpl = async () => ({ ok: true, json: async () => ({ issues: [{ key: 'A-1' }] }) });

  const jira = createJiraClient({ fetchImpl, sprintIssuesPageSize: 2 });
  const issues = await jira.getSprintIssues(123);

  assert.deepEqual(
    issues.map((i) => i.key),
    ['A-1']
  );
});
