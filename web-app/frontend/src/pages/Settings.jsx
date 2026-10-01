import { useEffect, useState } from 'react';
import { api } from '../api';

/** T033: operator settings — manage tracked boards and the target Confluence page ID. */
function Settings() {
  const [boards, setBoards] = useState([]);
  const [confluencePageId, setConfluencePageId] = useState('');
  const [form, setForm] = useState({ boardId: '', displayName: '', jiraProjectKey: '' });
  const [error, setError] = useState(null);

  async function loadAll() {
    try {
      const [boardList, dashboardConfig] = await Promise.all([
        api.listBoards(),
        api.getConfluencePage(),
      ]);
      setBoards(boardList);
      setConfluencePageId(dashboardConfig.confluence_page_id || '');
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleAddBoard(e) {
    e.preventDefault();
    try {
      await api.createBoard(form);
      setForm({ boardId: '', displayName: '', jiraProjectKey: '' });
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveBoard(id) {
    try {
      await api.deleteBoard(id);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveConfluencePage(e) {
    e.preventDefault();
    try {
      await api.updateConfluencePage(confluencePageId);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Settings</h1>
      {error && <p role="alert">{error}</p>}

      <h2>Confluence Page</h2>
      <form onSubmit={handleSaveConfluencePage}>
        <label>
          Confluence Page ID
          <input
            value={confluencePageId}
            onChange={(e) => setConfluencePageId(e.target.value)}
          />
        </label>
        <button type="submit">Save</button>
      </form>

      <h2>Tracked Boards</h2>
      <ul>
        {boards.map((b) => (
          <li key={b.id}>
            {b.display_name} ({b.board_id}) — {b.jira_project_key}{' '}
            <button onClick={() => handleRemoveBoard(b.id)}>Remove</button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddBoard}>
        <label>
          Board ID
          <input
            value={form.boardId}
            onChange={(e) => setForm({ ...form, boardId: e.target.value })}
            required
          />
        </label>
        <label>
          Display Name
          <input
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            required
          />
        </label>
        <label>
          Jira Project Key
          <input
            value={form.jiraProjectKey}
            onChange={(e) => setForm({ ...form, jiraProjectKey: e.target.value })}
            required
          />
        </label>
        <button type="submit">Add Board</button>
      </form>
    </div>
  );
}

export default Settings;
