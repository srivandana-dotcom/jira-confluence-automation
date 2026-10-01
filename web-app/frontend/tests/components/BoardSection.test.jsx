import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BoardSection from '../../src/components/BoardSection';

describe('BoardSection', () => {
  const board = { id: 1, board_id: '10', display_name: 'Board A' };

  it('shows the "no active sprint" state', () => {
    render(<BoardSection board={board} snapshot={{ fetch_status: 'no_active_sprint' }} blockers={[]} />);
    expect(screen.getByText(/no active sprint/i)).toBeInTheDocument();
  });

  it('shows an error state when the board failed to fetch', () => {
    render(
      <BoardSection
        board={board}
        snapshot={{ fetch_status: 'error', error_message: 'boom' }}
        blockers={[]}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('boom');
  });

  it('shows completion % and blockers when the fetch succeeded', () => {
    render(
      <BoardSection
        board={board}
        snapshot={{ fetch_status: 'ok', completion_pct: 42 }}
        blockers={[{ issue_key: 'A-1', summary: 'Fix it', reason: 'status' }]}
      />
    );
    expect(screen.getByText(/42%/)).toBeInTheDocument();
    expect(screen.getByText(/A-1/)).toBeInTheDocument();
  });
});
