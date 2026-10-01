CREATE TABLE IF NOT EXISTS blocker_item (
  id SERIAL PRIMARY KEY,
  sprint_snapshot_id INTEGER NOT NULL REFERENCES sprint_snapshot(id) ON DELETE CASCADE,
  issue_key TEXT NOT NULL,
  summary TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('status', 'label', 'overdue')),
  due_date DATE
);

CREATE INDEX IF NOT EXISTS idx_blocker_item_sprint_snapshot_id ON blocker_item (sprint_snapshot_id);
