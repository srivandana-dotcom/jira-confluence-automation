import { useState } from 'react';
import { api } from '../api';

/** T035/T036: triggers a refresh, shows a loading state, and surfaces the "already running" case. */
function RefreshButton({ onRefreshed }) {
  const [status, setStatus] = useState('idle'); // idle | loading | already-running | error
  const [errorMessage, setErrorMessage] = useState(null);

  async function handleClick() {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const result = await api.refreshDashboard();
      setStatus('idle');
      onRefreshed?.(result);
    } catch (err) {
      if (err.status === 409) {
        setStatus('already-running');
      } else {
        setStatus('error');
        setErrorMessage(err.message);
      }
    }
  }

  return (
    <div className="refresh-button">
      <button onClick={handleClick} disabled={status === 'loading'}>
        {status === 'loading' ? 'Refreshing…' : 'Refresh'}
      </button>
      {status === 'already-running' && <p role="status">A refresh is already running.</p>}
      {status === 'error' && <p role="alert">Refresh failed: {errorMessage}</p>}
    </div>
  );
}

export default RefreshButton;
