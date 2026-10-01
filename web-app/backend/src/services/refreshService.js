const dashboardConfigService = require('./dashboardConfigService');
const boardConfigService = require('./boardConfigService');
const snapshotRepository = require('./snapshotRepository');
const { createJiraClient } = require('../clients/jiraClient');
const { calculateCompletion } = require('./sprintMetrics');
const { detectBlockers } = require('./blockerDetector');
const { publishDashboard } = require('./publishService');

let refreshInFlight = false;

class RefreshInProgressError extends Error {
  constructor() {
    super('A refresh is already running');
    this.code = 'REFRESH_IN_PROGRESS';
  }
}

async function fetchAndPersistBoard(jira, board) {
  const sprint = await jira.getActiveSprint(board.board_id);

  if (!sprint) {
    await snapshotRepository.saveSnapshot(board.id, {
      fetchStatus: 'no_active_sprint',
      completionPct: null,
      burndownData: null,
      blockers: [],
    });
    return { board, snapshot: { fetch_status: 'no_active_sprint' }, blockers: [] };
  }

  const issues = await jira.getSprintIssues(sprint.id);
  const { completionPct } = calculateCompletion(issues);
  const blockers = detectBlockers(issues);

  // Burndown relies on an unofficial API (see jiraClient) — don't let its failure sink the board.
  let burndown = null;
  try {
    burndown = await jira.getSprintBurndown(board.board_id, sprint.id);
  } catch (err) {
    console.error(`Burndown fetch failed for board ${board.board_id}:`, err.message);
  }

  await snapshotRepository.saveSnapshot(board.id, {
    completionPct,
    burndownData: burndown,
    fetchStatus: 'ok',
    blockers,
  });

  return {
    board,
    snapshot: { fetch_status: 'ok', completion_pct: completionPct, burndown_data: burndown },
    blockers,
  };
}

/** FR-010/FR-011/FR-013: on-demand refresh, single-flight, per-board error isolation. */
async function refreshAll({ jiraClientFactory = createJiraClient, publishFn = publishDashboard } = {}) {
  if (refreshInFlight) {
    throw new RefreshInProgressError();
  }
  refreshInFlight = true;

  try {
    const dashboardConfig = await dashboardConfigService.getDashboardConfig();
    const boards = await boardConfigService.listBoards();
    const jira = jiraClientFactory(); // throws CONFIG_MISSING if Jira credentials are absent (FR-009)

    const boardResults = [];
    for (const board of boards) {
      try {
        boardResults.push(await fetchAndPersistBoard(jira, board));
      } catch (err) {
        await snapshotRepository.saveSnapshot(board.id, {
          fetchStatus: 'error',
          errorMessage: err.message,
          completionPct: null,
          burndownData: null,
          blockers: [],
        });
        boardResults.push({
          board,
          snapshot: { fetch_status: 'error', error_message: err.message },
          blockers: [],
        });
      }
    }

    let publishError = null;
    if (dashboardConfig.confluence_page_id) {
      try {
        await publishFn(dashboardConfig.confluence_page_id, boardResults);
      } catch (err) {
        // FR-012: the write call itself failed — previous Confluence content is untouched.
        publishError = err.message;
      }
    }

    return { boardResults, publishError };
  } finally {
    refreshInFlight = false;
  }
}

module.exports = { refreshAll, RefreshInProgressError };
