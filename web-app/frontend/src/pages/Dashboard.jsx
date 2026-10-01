import { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import BoardSection from '../components/BoardSection';
import RefreshButton from '../components/RefreshButton';

/** T023: combined dashboard view, one section per configured board. */
function Dashboard() {
  const [results, setResults] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async () => {
    try {
      setResults(await api.getDashboard());
      setLoadError(null);
    } catch (err) {
      setLoadError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1>Jira Sprint Dashboard</h1>
      <RefreshButton onRefreshed={load} />
      {loadError && <p role="alert">{loadError}</p>}
      {results.length === 0 && !loadError && <p>No boards configured yet.</p>}
      {results.map(({ board, snapshot, blockers }) => (
        <BoardSection key={board.id} board={board} snapshot={snapshot} blockers={blockers} />
      ))}
    </div>
  );
}

export default Dashboard;
