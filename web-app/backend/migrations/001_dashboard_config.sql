-- Dashboard-wide settings. Single row enforced by application logic (see dashboardConfigService).
CREATE TABLE IF NOT EXISTS dashboard_config (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  confluence_page_id TEXT,
  CONSTRAINT dashboard_config_singleton CHECK (id = 1)
);

INSERT INTO dashboard_config (id, confluence_page_id)
VALUES (1, NULL)
ON CONFLICT (id) DO NOTHING;
