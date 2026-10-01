-- Tracked Jira boards. Each board belongs to the single dashboard_config row
-- (resolves spec/clarify.md data-model contradiction: Dashboard Config "owns" a list of boards).
CREATE TABLE IF NOT EXISTS board_config (
  id SERIAL PRIMARY KEY,
  dashboard_config_id SMALLINT NOT NULL DEFAULT 1 REFERENCES dashboard_config(id),
  board_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  jira_project_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
