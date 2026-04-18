const { createPingMonitor } = require('../../services/ping_monitor');

const PING_LED_MASK = (1 << 3) | (1 << 4) | (1 << 5); // LEDs 4, 5, 6 (1-indexed)
const FLASH_DURATION_MS = 50;

async function ping_up(context) {
  const { ledService, buzzerService, oledService, logger } = context;

  const pingMonitor = createPingMonitor({
    logger,
    onPing(sourceIp) {
      buzzerService?.beep(FLASH_DURATION_MS);

      ledService?.set(PING_LED_MASK);
      setTimeout(() => ledService?.set(0), FLASH_DURATION_MS);

      oledService?.showPing(sourceIp);
    },
  });

  context.lifecycle.register('pingMonitor', () => pingMonitor.close());

  logger?.info?.('[PING_UP] ping monitor active');
  return context;
}

module.exports = { ping_up };
