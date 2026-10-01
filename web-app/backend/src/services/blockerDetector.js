const { isDone } = require('./sprintMetrics');

function isFlaggedOrLabeled(issue) {
  const flagged = issue.fields?.flagged;
  if (Array.isArray(flagged) && flagged.length > 0) return true;
  const labels = issue.fields?.labels || [];
  return labels.some((label) => /block/i.test(label));
}

function isStatusBlocked(issue) {
  const name = (issue.fields?.status?.name || '').toLowerCase();
  return name.includes('block');
}

function isOverdue(issue) {
  const dueDate = issue.fields?.duedate;
  if (!dueDate) return false;
  // FR-003 edge case: a completed issue is never a blocker, even if its due date has passed.
  if (isDone(issue)) return false;
  return new Date(dueDate) < new Date();
}

/**
 * FR-003: flags an issue as blocked/at-risk if it matches ANY of the three conditions
 * (status is "Blocked"-like, OR flagged/labeled, OR overdue-and-not-done).
 * Resolves spec/clarify.md's AND/OR ambiguity as OR, per tasks.md T018.
 */
function detectBlockers(issues) {
  const blockers = [];
  for (const issue of issues) {
    if (isStatusBlocked(issue)) {
      blockers.push(toBlockerItem(issue, 'status'));
    } else if (isFlaggedOrLabeled(issue)) {
      blockers.push(toBlockerItem(issue, 'label'));
    } else if (isOverdue(issue)) {
      blockers.push(toBlockerItem(issue, 'overdue'));
    }
  }
  return blockers;
}

function toBlockerItem(issue, reason) {
  return {
    issueKey: issue.key,
    summary: issue.fields?.summary || '',
    reason,
    dueDate: issue.fields?.duedate || null,
  };
}

module.exports = { detectBlockers };
