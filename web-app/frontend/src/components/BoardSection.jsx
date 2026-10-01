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
    </section>
  );
}

export default BoardSection;
