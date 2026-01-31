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
  pins.TB.CLK.gpio   = envInt("PIN_TB_CLK")   ?? pins.TB.CLK.gpio;
  pins.TB.LATCH.gpio = envInt("PIN_TB_LATCH") ?? pins.TB.LATCH.gpio;
  pins.TB.DATA.gpio  = envInt("PIN_TB_DATA")  ?? pins.TB.DATA.gpio;

  // Buzzer override
  pins.BUZZER.SIGNAL.gpio =
    envInt("PIN_BUZZER") ?? pins.BUZZER.SIGNAL.gpio;

  return pins;
}

module.exports = {
  resolvePins,
};
