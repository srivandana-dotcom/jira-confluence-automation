const { Router } = require('express');
const snapshotRepository = require('../services/snapshotRepository');
const { refreshAll, RefreshInProgressError } = require('../services/refreshService');

const router = Router();

/** FR-014: latest cached snapshot per board, no live Jira call. */
router.get('/dashboard', async (req, res, next) => {
  try {
    const results = await snapshotRepository.getLatestSnapshots();
    res.json(results);
  } catch (err) {
    next(err);
  }
});

/** FR-010/FR-013: on-demand refresh; fetch all boards, persist, publish to Confluence. */
router.post('/dashboard/refresh', async (req, res, next) => {
  try {
    const { boardResults, publishError } = await refreshAll();
    res.json({ boardResults, publishError });
  } catch (err) {
    if (err instanceof RefreshInProgressError) {
      return res.status(409).json({ error: err.message });
    }
    // FR-009/Acceptance Scenario 3.2: missing/invalid credentials are a clear config error, not a 500.
    if (err.code === 'CONFIG_MISSING') {
      return res.status(400).json({ error: err.message, missing: err.missing });
    }
    next(err);
  }
});

module.exports = router;
