const { Router } = require('express');
const boardConfigService = require('../services/boardConfigService');
const dashboardConfigService = require('../services/dashboardConfigService');

const router = Router();

router.get('/config/boards', async (req, res, next) => {
  try {
    res.json(await boardConfigService.listBoards());
  } catch (err) {
    next(err);
  }
});

/** FR-007: add a board; validated at the API boundary per the constitution. */
router.post('/config/boards', async (req, res, next) => {
  try {
    const { boardId, displayName, jiraProjectKey } = req.body || {};
    if (!boardId || typeof boardId !== 'string') {
      return res.status(400).json({ error: 'boardId is required and must be a string' });
    }
    if (!displayName || typeof displayName !== 'string') {
      return res.status(400).json({ error: 'displayName is required and must be a string' });
    }
    if (!jiraProjectKey || typeof jiraProjectKey !== 'string') {
      return res.status(400).json({ error: 'jiraProjectKey is required and must be a string' });
    }
    const board = await boardConfigService.createBoard({ boardId, displayName, jiraProjectKey });
    res.status(201).json(board);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: `Board ${req.body?.boardId} is already configured` });
    }
    next(err);
  }
});

router.delete('/config/boards/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id must be an integer' });
    }
    const deleted = await boardConfigService.deleteBoard(id);
    if (!deleted) {
      return res.status(404).json({ error: `Board ${id} not found` });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.get('/config/confluence-page', async (req, res, next) => {
  try {
    res.json(await dashboardConfigService.getDashboardConfig());
  } catch (err) {
    next(err);
  }
});

/** FR-008: update the target Confluence page ID. */
router.put('/config/confluence-page', async (req, res, next) => {
  try {
    const { confluencePageId } = req.body || {};
    if (!confluencePageId || typeof confluencePageId !== 'string') {
      return res.status(400).json({ error: 'confluencePageId is required and must be a string' });
    }
    res.json(await dashboardConfigService.updateConfluencePageId(confluencePageId));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
