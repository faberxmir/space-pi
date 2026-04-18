const fs = require('fs');
const path = require('path');
const router = require('express').Router();

const PILOT_PATH = path.join(__dirname, '../../../profile/pilot.json');
const PILOT_FALLBACK = { pilotName: 'CALLSIGN', pilotImageUrl: '' };

function loadPilot() {
  try {
    return JSON.parse(fs.readFileSync(PILOT_PATH, 'utf8'));
  } catch (_) {
    return PILOT_FALLBACK;
  }
}

function createPageRoutes() {
    router.get('/', (req, res) => res.render('index', { page: 'index', pilot: loadPilot() }));
    router.get('/api-docs', (req, res) => res.render('api-docs', { page: 'api-docs', pilot: loadPilot() }));
    return router;
}

module.exports = { createPageRoutes };
