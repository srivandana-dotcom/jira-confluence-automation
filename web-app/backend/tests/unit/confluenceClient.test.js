const test = require('node:test');
const assert = require('node:assert/strict');
const { renderDashboardContent } = require('../../src/clients/confluenceClient');

const board = { id: 1, board_id: '10', display_name: 'Board A' };

test('renders a burndown summary when burndown data is present (FR-005/FR-006)', () => {
  const content = renderDashboardContent([
    {
      board,
      snapshot: {
        fetch_status: 'ok',
        completion_pct: 60,
        burndown_data: {
          completedIssuesCount: 3,
          issuesNotCompletedCount: 2,
          completedIssuesInitialEstimateSum: 8,
          issuesNotCompletedInitialEstimateSum: 5,
        },
      },
      blockers: [],
    },
  ]);

  assert.match(content, /Done: 3 issues \(8 pts\)/);
  assert.match(content, /Remaining: 2 issues \(5 pts\)/);
});

test('renders a fallback message when burndown data is missing', () => {
  const content = renderDashboardContent([
    { board, snapshot: { fetch_status: 'ok', completion_pct: 60, burndown_data: null }, blockers: [] },
  ]);

  assert.match(content, /Burndown data unavailable/);
});
