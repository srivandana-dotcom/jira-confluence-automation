const BASE = '/api';

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;
  if (!res.ok) {
    const error = new Error(body?.error || `Request to ${path} failed (${res.status})`);
    error.status = res.status;
    error.body = body;
    throw error;
  }
  return body;
}

export const api = {
  getDashboard: () => request('/dashboard'),
  refreshDashboard: () => request('/dashboard/refresh', { method: 'POST' }),
  listBoards: () => request('/config/boards'),
  createBoard: (board) => request('/config/boards', { method: 'POST', body: JSON.stringify(board) }),
  deleteBoard: (id) => request(`/config/boards/${id}`, { method: 'DELETE' }),
  getConfluencePage: () => request('/config/confluence-page'),
  updateConfluencePage: (confluencePageId) =>
    request('/config/confluence-page', { method: 'PUT', body: JSON.stringify({ confluencePageId }) }),
};
