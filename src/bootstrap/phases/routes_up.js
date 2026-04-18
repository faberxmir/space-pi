// src/bootstrap/phases/routes_up.js
const fs   = require('fs');
const path = require('path');
const {createHttpServer} = require("../../http/server");
const {createApp} = require("../../http/app");

const PILOT_JSON = path.join(__dirname, '../../../cockpit/pilot.json');

function loadPilotName() {
  try {
    return JSON.parse(fs.readFileSync(PILOT_JSON, 'utf8')).pilotName || 'no pilot';
  } catch (_) {
    return 'no pilot';
  }
}

async function routesUp(context) {
  let app = createApp(context);
  context.httpServer = createHttpServer(app, context.logger);
  context.httpServer.start();

  await context.oledService?.phase("ROUTES_UP");

  context.lifecycle.register("httpServer", context.httpServer.stop);

  await context.oledService?.bootComplete(loadPilotName());
}

module.exports = { routesUp };
