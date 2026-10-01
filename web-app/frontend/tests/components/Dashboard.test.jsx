import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../../src/pages/Dashboard';

describe('Dashboard', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('shows a Confluence publish error returned by a refresh, alongside the reloaded boards', async () => {
    global.fetch
      // initial GET /api/dashboard on mount
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => [],
      })
      // POST /api/dashboard/refresh
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({ boardResults: [], publishError: 'Confluence getPage failed (401) for page 1' }),
      })
      // GET /api/dashboard after the refresh
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => [],
      });

    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText(/no boards configured/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));

    await waitFor(() =>
      expect(screen.getByText(/Confluence publish failed/i)).toHaveTextContent(
        'Confluence publish failed: Confluence getPage failed (401) for page 1'
      )
    );
  });
});
