const STORY_POINTS_FIELD = 'customfield_10016';
const DONE_STATUS_NAMES = new Set(['done', 'closed', 'resolved']);

function isDone(issue) {
  const category = issue.fields?.status?.statusCategory?.key;
  if (category) return category === 'done';
  const name = (issue.fields?.status?.name || '').toLowerCase();
  return DONE_STATUS_NAMES.has(name);
}

/** FR-002: completion % — prefers story points when the sprint has any, else falls back to issue count. */
function calculateCompletion(issues) {
  if (issues.length === 0) {
    return { completionPct: 0, basis: 'issues', doneCount: 0, totalCount: 0 };
  }

  const storyPoints = issues.map((i) => Number(i.fields?.[STORY_POINTS_FIELD]) || 0);
  const totalStoryPoints = storyPoints.reduce((a, b) => a + b, 0);

  if (totalStoryPoints > 0) {
    const doneStoryPoints = issues.reduce(
      (sum, issue, idx) => sum + (isDone(issue) ? storyPoints[idx] : 0),
      0
    );
    return {
      completionPct: round2((doneStoryPoints / totalStoryPoints) * 100),
      basis: 'story_points',
      doneCount: doneStoryPoints,
      totalCount: totalStoryPoints,
    };
  }

  const doneCount = issues.filter(isDone).length;
  return {
    completionPct: round2((doneCount / issues.length) * 100),
    basis: 'issues',
    doneCount,
    totalCount: issues.length,
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { calculateCompletion, isDone, STORY_POINTS_FIELD };
