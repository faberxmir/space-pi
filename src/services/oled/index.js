// Wrapper for the oled service

const i2c = require("i2c-bus");
const os   = require("os");
const Oled = require("oled-i2c-bus");
const font = require("oled-font-5x7");

const PHASE_DELAY_MS = 100;
const delay = ms => new Promise(r => setTimeout(r, ms));

function createOledService({ i2cBusNumber = 1, address = 0x3C, width = 128, height = 64, logger = console } = {}) {
  let i2cBus = null;
  let oled = null;
  let pingTimer = null;

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

    async bootComplete({ shipName, pilotName, configured = false, skipAnimation = false } = {}) {
      if (!state.ready) return;

      if (!configured) {
        const ip     = getLocalIp() ?? 'lost in the void';
        const totalH = 8 + 4 + 8;
        const noY    = Math.floor((height - totalH) / 2);
        const ipY    = noY + 12;
        oled.clearDisplay(true);
        oled.setCursor(Math.floor((width - 'NO PILOT'.length * 6) / 2), noY);
        oled.writeString(font, 1, 'NO PILOT', 1, true);
        oled.setCursor(Math.floor((width - ip.length * 6) / 2), ipY);
        oled.writeString(font, 1, ip, 1, true);
        return;
      }

      const ship  = String(shipName  || '').toUpperCase();
      const pilot = String(pilotName || '').toUpperCase();

      if (skipAnimation) {
        const shipY  = Math.floor((height - 34) / 2);
        const line1Y = shipY + 14 + 4;
        const line2Y = line1Y + 3;
        const finalPilotY = line2Y + 1 + 4;
        oled.clearDisplay(true);
        const shipX = Math.max(0, Math.floor((width - ship.length * 12) / 2));
        oled.setCursor(shipX, shipY);
        oled.writeString(font, 2, ship, 1, true);
        oled.drawLine(6, line1Y, width - 6, line1Y, 1, true);
        oled.drawLine(6, line2Y, width - 6, line2Y, 1, true);
        const pilotX = Math.max(0, Math.floor((width - pilot.length * 6) / 2));
        oled.setCursor(pilotX, finalPilotY);
        oled.writeString(font, 1, pilot, 1, true);
        return;
      }

      // ── 1. "ship name:" slides from center to top (2 s, 20 frames) ──
      const LABEL      = 'ship name:';
      const labelX     = Math.floor((width  - LABEL.length * 6) / 2);
      const slideStart = Math.floor((height - 8) / 2);
      const slideEnd   = 4;
      const FRAMES     = 20;

      for (let i = 0; i < FRAMES; i++) {
        const y = Math.round(slideStart + (slideEnd - slideStart) * (i / (FRAMES - 1)));
        oled.clearDisplay(true);
        oled.setCursor(labelX, y);
        oled.writeString(font, 1, LABEL, 1, true);
        await delay(100);
      }

      // ── 2. Ship name letter by letter, size 2, centered ──────────────
      // "ship name:" stays at top; name fills remaining space
      const nameY = slideEnd + 8 + Math.floor(((height - slideEnd - 8) - 14) / 2);

      for (let i = 1; i <= ship.length; i++) {
        const part = ship.slice(0, i);
        const x    = Math.max(0, Math.floor((width - part.length * 12) / 2));
        oled.clearDisplay(true);
        oled.setCursor(labelX, slideEnd);
        oled.writeString(font, 1, LABEL, 1, true);
        oled.setCursor(x, nameY);
        oled.writeString(font, 2, part, 1, true);
        await delay(100);
      }
      await delay(1000);
      oled.clearDisplay(true);
      await delay(100);

      // ── 3. "pilot" label for 1 second ───────────────────────────────
      const pilotLabelY = Math.floor((height - 8) / 2);
      oled.setCursor(Math.floor((width - 5 * 6) / 2), pilotLabelY);
      oled.writeString(font, 1, 'pilot', 1, true);
      await delay(1000);
      oled.clearDisplay(true);
      await delay(100);

      // ── 4. Pilot name letter by letter, size 2, centered ─────────────
      const pilotNameY = Math.floor((height - 14) / 2);

      for (let i = 1; i <= pilot.length; i++) {
        const part = pilot.slice(0, i);
        const x    = Math.max(0, Math.floor((width - part.length * 12) / 2));
        oled.clearDisplay(true);
        oled.setCursor(x, pilotNameY);
        oled.writeString(font, 2, part, 1, true);
        await delay(100);
      }

      // ── 5. Final screen: ship (size 2) + two lines + pilot (size 1) ──
      // heights: 14 + 4 + 1 + 2 + 1 + 4 + 8 = 34 px total
      const shipY  = Math.floor((height - 34) / 2);
      const line1Y = shipY + 14 + 4;
      const line2Y = line1Y + 3;
      const finalPilotY = line2Y + 1 + 4;

      oled.clearDisplay(true);

      const shipX  = Math.max(0, Math.floor((width - ship.length  * 12) / 2));
      oled.setCursor(shipX, shipY);
      oled.writeString(font, 2, ship, 1, true);

      oled.drawLine(6, line1Y, width - 6, line1Y, 1, true);
      oled.drawLine(6, line2Y, width - 6, line2Y, 1, true);

      const pilotX = Math.max(0, Math.floor((width - pilot.length * 6) / 2));
      oled.setCursor(pilotX, finalPilotY);
      oled.writeString(font, 1, pilot, 1, true);
    },

    showPing(ip) {
      if (!state.ready) return;

      const msg   = 'INCOMING PING';
      const msgX  = Math.floor((width - msg.length * 6) / 2);
      const ipStr = String(ip);
      const ipX   = Math.floor((width - ipStr.length * 6) / 2);
      const totalH = 8 + 4 + 8;
      const msgY  = Math.floor((height - totalH) / 2);
      const ipY   = msgY + 12;

      oled.clearDisplay(true);
      oled.setCursor(Math.max(0, msgX), msgY);
      oled.writeString(font, 1, msg, 1, true);
      oled.setCursor(Math.max(0, ipX), ipY);
      oled.writeString(font, 1, ipStr, 1, true);

      if (pingTimer) clearTimeout(pingTimer);

      pingTimer = setTimeout(async () => {
        pingTimer = null;
        if (!state.ready) return;
        try {
          const fs   = require('fs');
          const path = require('path');
          const PILOT_JSON  = path.join(__dirname, '../../../cockpit/pilot.json');
          const COCKPIT_DIR = path.dirname(PILOT_JSON);
          let pilot = {};
          try { pilot = JSON.parse(fs.readFileSync(PILOT_JSON, 'utf8')); } catch (_) {}
          const sn = (pilot.shipName    || '').trim();
          const pn = (pilot.pilotName   || '').trim();
          const pi = (pilot.pilot_image || '').trim();
          let configured = !!(sn && pn && pn.toLowerCase() !== 'no pilot' && pi);
          if (configured) {
            try { fs.accessSync(path.join(COCKPIT_DIR, pi)); } catch (_) { configured = false; }
          }
          await this.bootComplete({ shipName: sn, pilotName: pn, configured, skipAnimation: true });
        } catch (_) {}
      }, 5000);
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
