// src/platform/pins.js
const defaults = require("./pins.defaults");

function envInt(name) {
  if (!(name in process.env)) return undefined;
  const v = Number(process.env[name]);
  return Number.isInteger(v) ? v : undefined;
}

function resolvePins() {
  const pins = JSON.parse(JSON.stringify(defaults));

  // if envInt returns an integer, use it, else use defaults.
  pins.TB.CLK.pin   = envInt("PIN_TB_CLK")   ?? pins.TB.CLK.pin;
  pins.TB.LATCH.pin = envInt("PIN_TB_LATCH") ?? pins.TB.LATCH.pin;
  pins.TB.DATA.pin  = envInt("PIN_TB_DATA")  ?? pins.TB.DATA.pin;

  // Buzzer override
  pins.BUZZER.SIGNAL.pin =
    envInt("PIN_BUZZER") ?? pins.BUZZER.SIGNAL.pin;

  return pins;
}

module.exports = {
  resolvePins,
};
