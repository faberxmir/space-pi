// src/platform/pins.defaults.js
module.exports = {
  TB: {
    CLK:   { gpio: null, direction: "out", idle: 0 },
    LATCH: { gpio: null, direction: "out", idle: 0 },
    DATA:  { gpio: null, direction: "out", idle: 0 },
  },

  BUZZER: {
    SIGNAL: { gpio: null, direction: "out", idle: 0 },
  },
};