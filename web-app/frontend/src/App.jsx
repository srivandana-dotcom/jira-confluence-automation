import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div>
      <nav>
        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={() => setPage('settings')}>Settings</button>
      </nav>
      {page === 'dashboard' ? <Dashboard /> : <Settings />}
    </div>
  );
}

export default App;
