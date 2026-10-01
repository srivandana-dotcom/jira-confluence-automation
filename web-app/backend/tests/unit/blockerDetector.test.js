const test = require('node:test');
const assert = require('node:assert/strict');
const { detectBlockers } = require('../../src/services/blockerDetector');

test('flags an issue with a "Blocked" status', () => {
  const issues = [{ key: 'A-1', fields: { summary: 's', status: { name: 'Blocked' } } }];
  const blockers = detectBlockers(issues);
  assert.equal(blockers.length, 1);
  assert.equal(blockers[0].reason, 'status');
});

test('flags an issue with a "blocker" label', () => {
  const issues = [
    { key: 'A-2', fields: { summary: 's', status: { name: 'In Progress' }, labels: ['blocker'] } },
  ];
  const blockers = detectBlockers(issues);
  assert.equal(blockers.length, 1);
  assert.equal(blockers[0].reason, 'label');
});

test('flags an overdue, not-done issue', () => {
  const issues = [
    {
      key: 'A-3',
      fields: { summary: 's', status: { name: 'In Progress' }, duedate: '2020-01-01' },
    },
  ];
  const blockers = detectBlockers(issues);
  assert.equal(blockers.length, 1);
  assert.equal(blockers[0].reason, 'overdue');
});

test('does NOT flag a completed-but-overdue issue (edge case)', () => {
  const issues = [
    { key: 'A-4', fields: { summary: 's', status: { name: 'Done' }, duedate: '2020-01-01' } },
  ];
  const blockers = detectBlockers(issues);
  assert.equal(blockers.length, 0);
});

test('does NOT flag an issue matching none of the conditions', () => {
  const issues = [{ key: 'A-5', fields: { summary: 's', status: { name: 'In Progress' } } }];
  const blockers = detectBlockers(issues);
  assert.equal(blockers.length, 0);
});
