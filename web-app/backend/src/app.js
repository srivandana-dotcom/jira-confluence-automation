const express = require('express');
const cors = require('cors');
const dashboardRoutes = require('./routes/dashboard');
const configRoutes = require('./routes/config');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', dashboardRoutes);
  app.use('/api', configRoutes);

  // Centralized error handler — never leak stack traces to the client.
  app.use((err, req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
