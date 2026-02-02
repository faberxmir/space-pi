// Wrapper for the oled service

const i2c = require("i2c-bus");
const Oled = require("oled-i2c-bus");
const font = require("oled-font-5x7");


function createOledService({ i2cBusNumber = 1, address = 0x3C, width = 128, height = 64, logger = console } = {}) {
  let i2cBus = null;
  let oled = null;

  const state = {
    ready: false,
    error: null,
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
      .slice(0, 3);
  }

  function render(lines) {
    assertReady();

    // Minimal, stable rendering: clear + write lines at fixed y positions
    oled.clearDisplay();

    // Default font in oled-i2c-bus is 5x7; spacing 10px works well.
    const x = 0;
    const ys = [0, 12, 24];

    lines.forEach((text, idx) => {
      oled.setCursor(x, ys[idx] ?? 0);
      oled.writeString(font, 1, text, 1, true);
    });

    state.last.lines = lines;
  }

  return {
    name: "oled",

    async init() {
      if (state.ready) return { ...state };

      try {
        // Open I2C first (owned by this service)
        i2cBus = i2c.openSync(i2cBusNumber);

        // Create OLED instance
        oled = new Oled(i2cBus, {
          width,
          height,
          address,
        });

        oled = new Oled(i2cBus, { width, height, address });

        // 🔴 kill any internal read/tick loop if present
        if (oled && typeof oled.stopScroll === "function") {
          try { oled.stopScroll(); } catch (_) {}
        }
        if (oled && oled._timer) {
          try { clearTimeout(oled._timer); } catch (_) {}
          oled._timer = null;
        }
        if (oled && oled._interval) {
          try { clearInterval(oled._interval); } catch (_) {}
          oled._interval = null;
        }

        // Init display + clear
        oled.turnOnDisplay();
        oled.clearDisplay();

        state.ready = true;
        state.error = null;

        // Identify that we’re alive (system-level only)
        this.write("OLED: OK", "SYSTEM CONSOLE");

        logger.info("[OLED] init OK");
      } catch (err) {
        state.ready = false;
        state.error = err;

        logger.error("[OLED] init failed", err);

        // Best effort cleanup
        try {
          if (i2cBus) await i2cBus.close();
        } catch (_) {}
        i2cBus = null;
        oled = null;
      }

      return { ...state };
    },

    // No async loops here — “system console only”
    async start() {
      // Intentionally a no-op for now, but kept for lifecycle consistency
      assertReady();
      return { ...state };
    },

    write(...lines) {
      const normalized = normalizeLines(lines);
      render(normalized);
    },

    phase(name) {
      const label = `PHASE: ${String(name)}`;
      state.last.phase = label;
      render(normalizeLines([label]));
    },

    module(name, status) {
      const line = `${String(name)}: ${String(status)}`;
      render(normalizeLines([line]));
    },

    error(message) {
      // “Sticky” error screen: do not auto-clear afterward.
      const msg = String(message);
      if (state.ready) {
        render(normalizeLines(["ERROR", msg]));
      }
    },

    getState() {
      return { ...state };
    },    
    async close() {
      // Best-effort shutdown — must never throw
      try {
        if (oled) {
          try { oled.clearDisplay(); } catch (_) {}
          try { oled.turnOffDisplay(); } catch (_) {}
        }
      } catch (_) {}

      try {
        if (i2cBus) {
          // i2c-bus closeSync exists; but close() works too depending on version
          if (typeof i2cBus.closeSync === "function") i2cBus.closeSync();
          else if (typeof i2cBus.close === "function") await i2cBus.close();
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