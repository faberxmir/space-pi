// src/bootstrap/phases/core_io_up.js
const { resolvePins } = require("../../platform/pins");
const { createGpioManager } = require("../../platform/gpio");

async function coreIoUp(context) {
  const log = context.logger ?? console;

  context.oled?.phase("CORE_IO_UP");

  // 1. Resolve pin configuration
  const pins = resolvePins();
  context.pins = pins;

  // 2. Create GPIO manager
  const gpioManager = createGpioManager({ logger: log });
  context.gpioManager = gpioManager;

  context.gpio = {
    TB: {},
    BUZZER: {},
  };

  try {
    // 3. Claim TB pins
    for (const [name, def] of Object.entries(pins.TB)) {
      if (def.gpio == null) {
        throw new Error(`TB.${name} gpio not configured`);
      }

      context.gpio.TB[name] = gpioManager.claim({
        name: `TB_${name}`,
        gpio: def.gpio,
        idle: def.idle,
        owner: "TB",
      });
    }

    // 4. Claim buzzer pin
    if (pins.BUZZER.SIGNAL.gpio == null) {
      throw new Error("BUZZER.SIGNAL gpio not configured");
    }

    context.gpio.BUZZER.SIGNAL = gpioManager.claim({
      name: "BUZZER_SIGNAL",
      gpio: pins.BUZZER.SIGNAL.gpio,
      idle: pins.BUZZER.SIGNAL.idle,
      owner: "BUZZER",
    });

    context.oled?.module("GPIO", "OK");
    log.info("[CORE_IO_UP] GPIO OK");
  } catch (err) {
    context.oled?.module("GPIO", "FAIL");
    context.oled?.error(err.message);
    log.error("[CORE_IO_UP] failed", err);
    throw err;
  }

  return context;
}

module.exports = { coreIoUp };
