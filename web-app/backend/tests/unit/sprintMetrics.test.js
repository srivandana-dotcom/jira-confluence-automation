const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateCompletion } = require('../../src/services/sprintMetrics');

test('zero-issue sprint does not divide by zero', () => {
  const result = calculateCompletion([]);
  assert.equal(result.completionPct, 0);
});

test('calculates completion by story points when present', () => {
  const issues = [
    { fields: { status: { name: 'Done' }, customfield_10016: 5 } },
    { fields: { status: { name: 'In Progress' }, customfield_10016: 5 } },
  ];
  const result = calculateCompletion(issues);
  assert.equal(result.basis, 'story_points');
  assert.equal(result.completionPct, 50);
});

test('falls back to issue count when no story points are set', () => {
  const issues = [
    { fields: { status: { name: 'Done' } } },
    { fields: { status: { name: 'Done' } } },
    { fields: { status: { name: 'To Do' } } },
  ];
  const result = calculateCompletion(issues);
  assert.equal(result.basis, 'issues');
  assert.equal(result.completionPct, 66.67);
});
