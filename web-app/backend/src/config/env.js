require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) return { name, present: false };
  return { name, present: true, value };
}

function loadEnv() {
  const keys = [
    'DATABASE_URL',
    'JIRA_BASE_URL',
    'JIRA_EMAIL',
    'JIRA_API_TOKEN',
    'CONFLUENCE_BASE_URL',
    'CONFLUENCE_EMAIL',
    'CONFLUENCE_API_TOKEN',
  ];
  const resolved = keys.map(required);
  const missing = resolved.filter((r) => !r.present).map((r) => r.name);
  const env = Object.fromEntries(resolved.filter((r) => r.present).map((r) => [r.name, r.value]));
  env.PORT = process.env.PORT || '3001';
  return { env, missing };
}

/** Throws a clear error naming every missing credential, per FR-009. */
function requireEnv(keys) {
  const { env, missing } = loadEnv();
  const relevantMissing = missing.filter((m) => keys.includes(m));
  if (relevantMissing.length > 0) {
    const err = new Error(`Missing required configuration: ${relevantMissing.join(', ')}`);
    err.code = 'CONFIG_MISSING';
    err.missing = relevantMissing;
    throw err;
  }
  return env;
}

module.exports = { loadEnv, requireEnv };
