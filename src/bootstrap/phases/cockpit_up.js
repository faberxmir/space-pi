const fs   = require('fs');
const path = require('path');

const PILOT_JSON  = path.join(__dirname, '../../../cockpit/pilot.json');
const COCKPIT_DIR = path.dirname(PILOT_JSON);

const FANFARE = [
  [523,  120],  // C5
  [659,  120],  // E5
  [784,  120],  // G5
  [1047, 500],  // C6 — held
];
const NEGATIVE_FANFARE = [
  [784, 150],  // G5 — high
  [440, 150],  // A4 — lower
  [220, 300],  // A3 — lowest, held
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
  try {
    fs.accessSync(path.join(COCKPIT_DIR, p.pilot_image));
  } catch (_) {
    return false;
  }
  return true;
}

async function playFanfare(buzzerService) {
  for (const [hz, ms] of FANFARE) {
    await buzzerService.playNote(hz, ms);
    await new Promise(r => setTimeout(r, NOTE_GAP_MS));
  }
}

async function playNegativeFanfare(buzzerService) {
  for (const [hz, ms] of NEGATIVE_FANFARE) {
    await buzzerService.playNote(hz, ms);
    await new Promise(r => setTimeout(r, NOTE_GAP_MS));
  }
}

async function negativeFlash(ledService) {
  for (let i = 0; i < 3; i++) {
    ledService?.allOn();
    await new Promise(r => setTimeout(r, 100));
    ledService?.allOff();
    await new Promise(r => setTimeout(r, 100));
  }
}

async function cockpitUp(context) {
  let pilot      = loadPilot();
  let configured = isPilotConfigured(pilot);
  let busy       = false;

  fs.watchFile(PILOT_JSON, { interval: 1000, persistent: false }, async (curr, prev) => {
    if (curr.mtimeMs === prev.mtimeMs) return;
    if (busy) return;

    const newPilot      = loadPilot();
    const newConfigured = isPilotConfigured(newPilot);

    if (newConfigured === configured) return;

    busy       = true;
    configured = newConfigured;
    pilot      = newPilot;

    try {
      if (configured) {
        context.logger?.info?.('[COCKPIT] pilot boarded — playing boarding sequence');
        await context.oledService?.bootComplete({
          shipName:   pilot.shipName,
          pilotName:  pilot.pilotName,
          configured: true,
        });
        await Promise.all([
          context.ledService?.sequence(),
          context.buzzerService ? playFanfare(context.buzzerService) : Promise.resolve(),
        ]);
      } else {
        context.logger?.info?.('[COCKPIT] pilot departed — showing NO PILOT screen');
        await context.oledService?.bootComplete({ configured: false });
        await Promise.all([
          negativeFlash(context.ledService),
          context.buzzerService ? playNegativeFanfare(context.buzzerService) : Promise.resolve(),
        ]);
      }
    } finally {
      busy = false;
    }
  });

  context.lifecycle.register('cockpitWatcher', () => {
    fs.unwatchFile(PILOT_JSON);
  });

  context.logger?.info?.('[COCKPIT_UP] watching cockpit/pilot.json');
  return context;
}

module.exports = { cockpitUp };
