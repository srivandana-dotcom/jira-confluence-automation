-- One row per board per refresh. fetch_status covers the "no active sprint" signal
-- that the frontend's BoardSection component depends on (resolves analyze.md Gap #2).
CREATE TABLE IF NOT EXISTS sprint_snapshot (
  id SERIAL PRIMARY KEY,
  board_config_id INTEGER NOT NULL REFERENCES board_config(id) ON DELETE CASCADE,
  completion_pct NUMERIC(5, 2),
  burndown_data JSONB,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fetch_status TEXT NOT NULL CHECK (fetch_status IN ('ok', 'error', 'no_active_sprint')),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_sprint_snapshot_board_config_id ON sprint_snapshot (board_config_id);
