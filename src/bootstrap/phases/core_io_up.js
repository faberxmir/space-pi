// src/bootstrap/phases/core_io_up.js
const { resolvePins } = require("../../platform/pins");

async function coreIoUp(context) {
  const log = context.logger ?? console;

  if(context.oled?.getState?.().ready) context.oled.phase("CORE_IO_UP");

  // 1. Resolve pin configuration
  const pins = resolvePins();
  context.pins = pins;

  context.pin = {
    TB: {},
    BUZZER: {},
  };

  try {
    // 3. Claim TB pins
    for (const [name, def] of Object.entries(pins.TB)) {
      if (def.pin == null) {
        throw new Error(`TB.${name} not configured`);
      }

      context.pin.TB[name] = context.gpio.claim({
        name: `TB_${name}`,
        pinNumber: def.pin,
        idle: def.idle,
        owner: "TB",
        mode: "output",
      });
    }

    // 4. Claim buzzer pin
    if (pins.BUZZER.SIGNAL.pin == null) {
      throw new Error("BUZZER.SIGNAL pin not configured");
    }

    context.pin.BUZZER.SIGNAL = context.gpio.claim({
      name: "BUZZER_SIGNAL",
      pinNumber: pins.BUZZER.SIGNAL.pin,
      idle: pins.BUZZER.SIGNAL.idle,
      owner: "BUZZER",
      mode: "output",
    });

    context.oled?.module("PIN", "OK");
    log.info("[CORE_IO_UP] PINS OK");
  } catch (err) {
    context.oled?.module("PIN", "FAIL");
    context.oled?.error(err.message);
    log.error("[CORE_IO_UP] failed", err);
    throw err;
  }

  return context;
}

module.exports = { coreIoUp };
