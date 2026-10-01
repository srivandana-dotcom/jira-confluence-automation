/** FR-005: formats the raw greenhopper burndown payload into a done-vs-remaining summary. */
function formatBurndown(burndown) {
  if (!burndown) return null;
  const {
    completedIssuesCount,
    issuesNotCompletedCount,
    completedIssuesInitialEstimateSum,
    issuesNotCompletedInitialEstimateSum,
  } = burndown;
  if (
    completedIssuesCount == null &&
    issuesNotCompletedCount == null &&
    completedIssuesInitialEstimateSum == null &&
    issuesNotCompletedInitialEstimateSum == null
  ) {
    return null;
  }
  return {
    doneIssues: completedIssuesCount ?? '—',
    remainingIssues: issuesNotCompletedCount ?? '—',
    donePoints: completedIssuesInitialEstimateSum ?? '—',
    remainingPoints: issuesNotCompletedInitialEstimateSum ?? '—',
  };
}

/** T024: renders one board's section, including the "no active sprint" and error states. */
function BoardSection({ board, snapshot, blockers }) {
  const title = `${board.display_name} (${board.board_id})`;

  if (!snapshot || snapshot.fetch_status === 'error') {
    return (
      <section className="board-section board-section--error">
        <h2>{title}</h2>
        <p role="alert">Error: {snapshot?.error_message || 'No data yet'}</p>
      </section>
    );
  }

  if (snapshot.fetch_status === 'no_active_sprint') {
    return (
      <section className="board-section">
        <h2>{title}</h2>
        <p>No active sprint.</p>
      </section>
    );
  }

  return (
    <section className="board-section">
      <h2>{title}</h2>
      <p>Completion: {snapshot.completion_pct}%</p>
      <h3>Blockers</h3>
      {blockers && blockers.length > 0 ? (
        <ul>
          {blockers.map((b) => (
            <li key={b.issue_key}>
              {b.issue_key} — {b.summary} ({b.reason})
            </li>
          ))}
        </ul>
      ) : (
        <p>No blockers.</p>
      )}
      <h3>Burndown</h3>
      {(() => {
        const burndown = formatBurndown(snapshot.burndown_data);
        return burndown ? (
          <ul>
            <li>
              Done: {burndown.doneIssues} issues ({burndown.donePoints} pts)
            </li>
            <li>
              Remaining: {burndown.remainingIssues} issues ({burndown.remainingPoints} pts)
            </li>
          </ul>
        ) : (
          <p>Burndown data unavailable.</p>
        );
      })()}
    </section>
  );
}

export default BoardSection;
