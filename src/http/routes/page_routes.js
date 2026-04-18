const fs = require('fs');
const path = require('path');
const router = require('express').Router();

let pilot = { pilotName: 'CALLSIGN', pilotImageUrl: '' };
try {
  pilot = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../profile/pilot.json'), 'utf8'));
} catch (_) {}

function createPageRoutes() {
    router.get('/', (req, res) => res.render('index', { page: 'index', pilot }));
    router.get('/api-docs', (req, res) => res.render('api-docs', { page: 'api-docs', pilot }));
    return router;
}

module.exports = { createPageRoutes };
