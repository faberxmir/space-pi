// src/platform/gpio/index.js
const { Chip } = require("node-libgpiod");

function createPinManager({ logger = console, chipIndex = 0 } = {}) {
  const claimed = new Map(); // pinNumber -> record
  const chip = new Chip(chipIndex);

  function claim({ name, pinNumber, owner, mode = "output", idle = 0 } = {}) {
    if (!Number.isInteger(pinNumber)) {
      throw new Error(`Pin number for ${name} must be an integer. Got: ${pinNumber}`);
    }
    if (!name || !owner) {
      throw new Error(`claim() requires { name, owner, pinNumber }. Got name=${name} owner=${owner}`);
    }
    if (claimed.has(pinNumber)) {
      const prev = claimed.get(pinNumber);
      throw new Error(`PIN ${pinNumber} already claimed by ${prev.owner} as ${prev.name} (${prev.mode})`);
    }

    // Passive reservations: registry-only, no hardware touch.
    if (mode === "passive") {
      const record = { name, owner, mode, pinNumber, idle: null, line: null };
      claimed.set(pinNumber, record);
      logger.info(`[PIN] claimed ${name} (BCM${pinNumber}) owner=${owner} mode=passive`);
      return {
        name,
        pin: pinNumber,
        owner,
        mode,
        release() {
          claimed.delete(pinNumber);
          logger.info(`[PIN] released ${name} (BCM${pinNumber}) owner=${owner} mode=passive`);
        },
        toString() {
          return `${name} (BCM${pinNumber}) owner=${owner} mode=passive`;
        },
      };
    }

    // Output mode (implemented now)
    if (mode !== "output") {
      throw new Error(`Unsupported mode: ${mode}. Supported: output, passive (input reserved for later).`);
    }

    const line = chip.getLine(pinNumber);
    line.requestOutputMode();
    line.setValue(idle ? 1 : 0);

    const record = { name, owner, mode, pinNumber, idle: idle ? 1 : 0, line };
    claimed.set(pinNumber, record);

    const wrapper = {
      name,
      pin: pinNumber,
      owner,
      mode,
      idle: record.idle,

      high() {
        line.setValue(1);
      },
      low() {
        line.setValue(0);
      },
      write(v) {
        line.setValue(v ? 1 : 0);
      },
      pulse(ms = 1) {
        const active = record.idle ? 0 : 1; // pulse opposite of idle
        line.setValue(active);
        setTimeout(() => line.setValue(record.idle), ms);
      },
      release() {
        try {
          line.release();
        } catch (_) {}
        claimed.delete(pinNumber);
        logger.info(`[PIN] released ${name} (BCM${pinNumber}) owner=${owner} mode=output`);
      },
      toString() {
        return `${name} (BCM${pinNumber}) owner=${owner} idle=${record.idle} mode=output`;
      },
    };

    logger.info(`[PIN] claimed ${wrapper.toString()}`);
    return wrapper;
  }

  function releaseByOwner(owner) {
    for (const [pinNumber, rec] of claimed.entries()) {
      if (rec.owner !== owner) continue;
      if (rec.line) {
        try { rec.line.release(); } catch (_) {}
      }
      claimed.delete(pinNumber);
      logger.info(`[PIN] released ${rec.name} (BCM${pinNumber}) owner=${owner} mode=${rec.mode}`);
    }
  }

  function listClaims() {
    return Array.from(claimed.values()).map(({ name, pinNumber, owner, mode, idle }) => ({
      name,
      pin: pinNumber,
      owner,
      mode,
      idle,
    }));
  }

  // Optional: call on shutdown if you want a “best effort” cleanup
  function closeAll() {
    for (const [pinNumber, rec] of claimed.entries()) {
      if (rec.line) {
        try { rec.line.release(); } catch (_) {}
      }
      claimed.delete(pinNumber);
    }
  }

  return { claim, releaseByOwner, listClaims, closeAll };
}

module.exports = { createPinManager };