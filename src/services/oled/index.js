// Wrapper for the oled service

const i2c = require("i2c-bus");
const os  = require("os");
const Oled = require("oled-i2c-bus");
const font = require("oled-font-5x7");

const PHASE_DELAY_MS = 100;
const delay = ms => new Promise(r => setTimeout(r, ms));

function createOledService({ i2cBusNumber = 1, address = 0x3C, width = 128, height = 64, logger = console } = {}) {
  let i2cBus = null;
  let oled = null;

  const state = {
    ready: false,
    error: null,
    buffer: [],
    last: {
      phase: null,
      lines: [],
    },
  };

  function assertReady() {
    if (!state.ready || !oled) throw new Error("OLED not ready. Call init() first.");
  }

  function normalizeLines(lines) {
    return lines
      .filter((v) => v !== undefined && v !== null)
      .map((v) => String(v))
      .slice(0, 5); // Allow up to 5 lines
  }

  function render(lines) {
    assertReady();

    oled.clearDisplay(true);

    const x = 0;
    const ys = [0, 12, 24, 36, 48];

    lines.forEach((text, idx) => {
      oled.setCursor(x, ys[idx] ?? 0);
      oled.writeString(font, 1, text, 1, true);
    });

    state.last.lines = lines;
  }

  function getLocalIp() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) return net.address;
      }
    }
    return null;
  }

  return {
    name: "oled",

    async init() {
      if (state.ready) {
        logger.warn("[OLED] init called but already ready");
        return { ...state }
      };

      try {
        i2cBus = i2c.openSync(i2cBusNumber);

        oled = new Oled(i2cBus, {
          width,
          height,
          address,
        });

        oled.clearDisplay();
        oled.turnOnDisplay();

        state.ready = true;
        state.error = null;

        this.write("OLED: OK", "SYSTEM CONSOLE");

        logger.info("[OLED] init OK");
      } catch (err) {
        state.ready = false;
        state.error = err;

        logger.error("[OLED] init failed", err);

        try {
          if (i2cBus) await i2cBus.close();
        } catch (_) {}
        i2cBus = null;
        oled = null;
      }

      return { ...state };
    },

    async start() {
      assertReady();
      return { ...state };
    },

    setTextCenter(text) {
      assertReady();
      oled.clearDisplay();
      const x = Math.max(0, Math.floor((width - text.length * 6) / 2));
      const y = Math.floor((height - 8) / 2);
      oled.setCursor(x, y);
      oled.writeString(font, 1, text, 1, true);
    },

    write(...lines) {
      const normalized = normalizeLines(lines);
      render(normalized);
    },

    async phase(name) {
      const label = `PHASE: ${String(name)}`;
      state.last.phase = label;
      logger.info(`[OLED] ${label}`);
      state.buffer.push(label);
      if (state.buffer.length > 5) state.buffer.shift();
      render(normalizeLines(state.buffer));
      await delay(PHASE_DELAY_MS);
    },

    async bootComplete({ shipName, pilotName, onDot } = {}) {
      if (!state.ready) return;

      const dotY = Math.floor((height - 8) / 2);
      for (const dots of ['.', '..', '...']) {
        oled.clearDisplay(true);
        const dotX = Math.floor((width - dots.length * 6) / 2);
        oled.setCursor(dotX, dotY);
        oled.writeString(font, 1, dots, 1, true);
        if (onDot) await onDot();
        await delay(1000);
      }

      const ship  = String(shipName  || '').toUpperCase();
      const pilot = String(pilotName || 'no pilot').toUpperCase();

      // size-2 char: ~12px wide, ~14px tall; size-1: ~6px wide, ~8px tall
      // total height ~14 + 4 + 8 = 26px; center vertically
      const shipY  = Math.floor((height - 26) / 2);
      const pilotY = shipY + 14 + 4;

      oled.clearDisplay(true);

      const shipX  = Math.max(0, Math.floor((width - ship.length  * 12) / 2));
      oled.setCursor(shipX, shipY);
      oled.writeString(font, 2, ship, 1, true);

      const pilotX = Math.max(0, Math.floor((width - pilot.length * 6)  / 2));
      oled.setCursor(pilotX, pilotY);
      oled.writeString(font, 1, pilot, 1, true);
    },

    module(name, status) {
      const line = `${String(name)}: ${String(status)}`;
      render(normalizeLines([line]));
    },

    error(message) {
      const msg = String(message);
      if (state.ready) {
        render(normalizeLines(["ERROR", msg]));
      }
    },

    getState() {
      return { ...state };
    },

    close() {
      try {
        if (oled) {
          try { oled.clearDisplay(true); } catch (_) {}
          try { oled.turnOffDisplay(); } catch (_) {}
        }
      } catch (_) {}

      try {
        if (i2cBus) {
          if (typeof i2cBus.closeSync === "function") i2cBus.closeSync();
        }
      } catch (_) {}

      oled = null;
      i2cBus = null;
      state.ready = false;

      return { ...state };
    },

  };
}

module.exports = { createOledService };
