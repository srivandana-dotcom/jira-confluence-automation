import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RefreshButton from '../../src/components/RefreshButton';

describe('RefreshButton', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('shows a loading state while refreshing, then calls onRefreshed', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ boardResults: [], publishError: null }),
    });
    const onRefreshed = vi.fn();
    render(<RefreshButton onRefreshed={onRefreshed} />);

    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
    expect(screen.getByRole('button', { name: /refreshing/i })).toBeDisabled();

    await waitFor(() => expect(onRefreshed).toHaveBeenCalled());
  });

  it('shows "already running" message on a 409 response', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 409,
      headers: { get: () => 'application/json' },
      json: async () => ({ error: 'A refresh is already running' }),
    });
    render(<RefreshButton />);

    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/already running/i));
  });
});
