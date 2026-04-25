const { createCockpitService } = require('../../services/cockpit');

const LONG_FANFARE = [
  [523,  200],  // C5
  [659,  200],  // E5
  [784,  200],  // G5
  [1047, 200],  // C6
  [784,  150],  // G5
  [659,  150],  // E5
  [784,  150],  // G5
  [1047, 300],  // C6
  [1319, 300],  // E6
  [1568, 300],  // G6
  [2093, 600],  // C7
];

const NEGATIVE_FANFARE = [
  [784, 150],
  [440, 150],
  [220, 300],
];

const NOTE_GAP_MS = 20;
const delay = ms => new Promise(r => setTimeout(r, ms));

async function playLongFanfare(buzzerService) {
  if (!buzzerService) return;
  for (const [hz, ms] of LONG_FANFARE) {
    await buzzerService.playNote(hz, ms);
    await delay(NOTE_GAP_MS);
  }
}

async function playNegativeFanfare(buzzerService) {
  if (!buzzerService) return;
  for (const [hz, ms] of NEGATIVE_FANFARE) {
    await buzzerService.playNote(hz, ms);
    await delay(NOTE_GAP_MS);
  }
}

async function negativeFlash(ledService) {
  for (let i = 0; i < 3; i++) {
    ledService?.allOn();
    await delay(100);
    ledService?.allOff();
    await delay(100);
  }
}

async function cockpitUp(context) {
  const cockpitService = createCockpitService({
    sessionService: context.sessionService,
    logger: context.logger,
  });

  cockpitService.on('assigned', async ({ pilot }) => {
    context.logger?.info?.(`[COCKPIT] assigned to ${pilot.username}`);
    context.oledService?.setRestoreState({
      shipName:      pilot.shipName,
      pilotName:     pilot.pilotName,
      configured:    true,
      skipAnimation: true,
    });
    await context.oledService?.boardingSequence(pilot, context.buzzerService);
    await Promise.all([
      context.ledService?.sequence(),
      playLongFanfare(context.buzzerService),
    ]);
  });

  cockpitService.on('unassigned', async ({ reason }) => {
    context.logger?.info?.(`[COCKPIT] unassigned (${reason})`);
    context.oledService?.setRestoreState({ configured: false });
    await context.oledService?.bootComplete({ configured: false });
    await Promise.all([
      negativeFlash(context.ledService),
      playNegativeFanfare(context.buzzerService),
    ]);
  });

  cockpitService.on('securityLevel', (level) => {
    context.logger?.info?.(`[COCKPIT] security level: ${level}`);
  });

  context.cockpitService = cockpitService;
  context.lifecycle.register('cockpit', () => cockpitService.close());

  context.logger?.info?.('[COCKPIT_UP] cockpit service started');
}

module.exports = { cockpitUp };
