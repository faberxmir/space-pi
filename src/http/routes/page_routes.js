const fs = require('fs');
const path = require('path');
const router = require('express').Router();

const COCKPIT_DIR  = path.join(__dirname, '../../../cockpit');
const PILOT_JSON   = path.join(COCKPIT_DIR, 'pilot.json');
const PILOT_FALLBACK = { shipName: '', pilotName: 'no pilot', pilot_image: '' };

function loadPilot() {
  try {
    return JSON.parse(fs.readFileSync(PILOT_JSON, 'utf8'));
  } catch (_) {
    return { ...PILOT_FALLBACK };
  }
}

function isPilotConfigured(pilot) {
  if (!(pilot.shipName || '').trim()) return false;
  const name = (pilot.pilotName || '').trim().toLowerCase();
  if (!name || name === 'no pilot') return false;
  if (!(pilot.pilot_image || '').trim()) return false;
  try {
    fs.accessSync(path.join(COCKPIT_DIR, pilot.pilot_image));
  } catch (_) {
    return false;
  }
  return true;
}

function createPageRoutes() {
  router.get('/', (req, res) => {
    const pilot = loadPilot();
    res.render('index', { page: 'index', pilot, pilotConfigured: isPilotConfigured(pilot) });
  });
  router.get('/api-docs', (req, res) => {
    const pilot = loadPilot();
    res.render('api-docs', { page: 'api-docs', pilot, pilotConfigured: isPilotConfigured(pilot) });
  });
  return router;
}

module.exports = { createPageRoutes };
