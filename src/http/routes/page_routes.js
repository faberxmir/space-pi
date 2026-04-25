const fs      = require('fs');
const path    = require('path');
const express = require('express');

const FACTORY_SETTINGS_PATH = path.join(__dirname, '../../../cockpit/factory-settings.json');

function loadFactorySettings() {
  try { return JSON.parse(fs.readFileSync(FACTORY_SETTINGS_PATH, 'utf8')); } catch (_) { return {}; }
}

function parseCookies(req) {
  return (req.headers.cookie || '').split(';').reduce((acc, pair) => {
    const [k, ...v] = pair.trim().split('=');
    if (k) acc[k.trim()] = decodeURIComponent(v.join('='));
    return acc;
  }, {});
}

function createPageRoutes(context) {
  const router = express.Router();

  function getTemplateVars(req) {
    const cockpitState = context.cockpitService?.currentState() ?? { assigned: false, reason: 'empty', pilot: null, securityLevel: 0 };
    const cookies      = parseCookies(req);
    const session      = context.sessionService?.get(cookies.space_session || '');
    return {
      assigned:        cockpitState.assigned,
      pilot:           cockpitState.pilot,
      securityLevel:   cockpitState.securityLevel,
      reason:          cockpitState.reason,
      loggedIn:        !!session,
      factorySettings: cockpitState.assigned ? {} : loadFactorySettings(),
    };
  }

  router.get('/', (req, res) => {
    res.render('index', { page: 'index', ...getTemplateVars(req) });
  });

  router.get('/api-docs', (req, res) => {
    res.render('api-docs', { page: 'api-docs', ...getTemplateVars(req) });
  });

  return router;
}

module.exports = { createPageRoutes };
