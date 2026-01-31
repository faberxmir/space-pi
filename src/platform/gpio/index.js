// src/platform/gpio/index.js
const r = require("array-gpio");

function createPinManager({ logger = console } = {}) {
  const claimed = new Map(); // pinNumber -> { name, owner, idle, pin }

  function claim({ name, pinNumber, owner, idle = 0 }) {
    if (!Number.isInteger(pinNumber)) {
      throw new Error(`Pin number for ${name} must be an integer. Got: ${pinNumber}`);
    }

    if (claimed.has(pinNumber)) {
      const prev = claimed.get(pinNumber);
      throw new Error(
        `PIN ${pinNumber} already claimed by ${prev.owner} as ${prev.name}`
      );
    }

    // Export pin as output and immediately set idle state
    const output = r.out(pinNumber);
    output.write(idle ? 1 : 0);

    const record = { name, owner, idle: idle ? 1 : 0, pinNumber, output };
    claimed.set(pinNumber, record);
    // Wrapper: expose safe operations only
    const wrapper = {
      name,
      pin: pinNumber,
      owner,
      idle: record.idle,

      high() {
        output.write(1);
      },

      low() {
        output.write(0);
      },

      write(v) {
        output.write(v ? 1 : 0);
      },

      // Optional helper for clean pulse behavior in later modules
      pulse(ms = 1) {
        output.write(1);
        setTimeout(() => output.write(record.idle), ms);
      },

      // For debugging
      toString() {
        return `${name} (PIN${pinNumber}) owner=${owner} idle=${record.idle}`;
      },
    };

    logger.info(`[PIN] claimed ${wrapper.toString()}`);
    return wrapper;
  }

  function listClaims() {
    return Array.from(claimed.values()).map(({ name, pin, owner, idle }) => ({
      name,
      pin,
      owner,
      idle,
    }));
  }

  return {
    claim,
    listClaims,
  };
}

module.exports = { createPinManager };
