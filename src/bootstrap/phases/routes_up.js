// src/bootstrap/phases/routes_up.js
const fs   = require('fs');
const path = require('path');
const {createHttpServer} = require("../../http/server");
const {createApp} = require("../../http/app");

const PILOT_JSON = path.join(__dirname, '../../../cockpit/pilot.json');

const FANFARE = [
  [523,  120],  // C5
  [659,  120],  // E5
  [784,  120],  // G5
  [1047, 500],  // C6 — held
];
const NOTE_GAP_MS = 20;

function loadPilot() {
  try {
    const p = JSON.parse(fs.readFileSync(PILOT_JSON, 'utf8'));
    return {
      shipName:    (p.shipName    || '').trim(),
      pilotName:   (p.pilotName   || '').trim(),
      pilot_image: (p.pilot_image || '').trim(),
    };
  } catch (_) {
    return { shipName: '', pilotName: '', pilot_image: '' };
  }
}

function isPilotConfigured(p) {
  if (!p.shipName) return false;
  if (!p.pilotName || p.pilotName.toLowerCase() === 'no pilot') return false;
  if (!p.pilot_image) return false;
  return true;
}

async function playFanfare(buzzerService) {
  for (const [hz, ms] of FANFARE) {
    await buzzerService.playNote(hz, ms);
    await new Promise(r => setTimeout(r, NOTE_GAP_MS));
  }
}

async function routesUp(context) {
  const app = createApp(context);
  context.httpServer = createHttpServer(app, context.logger);
  context.httpServer.start();

  await context.oledService?.phase("ROUTES_UP");

  context.lifecycle.register("httpServer", context.httpServer.stop);

  const pilot = loadPilot();

  await context.oledService?.bootComplete({
    shipName:   pilot.shipName,
    pilotName:  pilot.pilotName,
    configured: isPilotConfigured(pilot),
  });

  await Promise.all([
    context.ledService?.sequence(),
    context.buzzerService ? playFanfare(context.buzzerService) : Promise.resolve(),
  ]);
}

module.exports = { routesUp };
