// src/platform/gpio/index.js
const { Output } = require("array-gpio");

function createGpioManager({ logger = console } = {}) {
  const claimed = new Map(); // gpioNumber -> { name, owner, idle, pin }

  function claim({ name, gpio, owner, idle = 0 }) {
    if (!Number.isInteger(gpio)) {
      throw new Error(`GPIO for ${name} must be an integer. Got: ${gpio}`);
    }

    if (claimed.has(gpio)) {
      const prev = claimed.get(gpio);
      throw new Error(
        `GPIO${gpio} already claimed by ${prev.owner} as ${prev.name}`
      );
    }

    // Export pin as output and immediately set idle state
    const pin = new Output(gpio);
    pin.write(idle ? 1 : 0);

    const record = { name, owner, idle: idle ? 1 : 0, gpio, pin };
    claimed.set(gpio, record);

    // Wrapper: expose safe operations only
    const wrapper = {
      name,
      gpio,
      owner,
      idle: record.idle,

      high() {
        pin.write(1);
      },

      low() {
        pin.write(0);
      },

      write(v) {
        pin.write(v ? 1 : 0);
      },

      // Optional helper for clean pulse behavior in later modules
      pulse(ms = 1) {
        pin.write(1);
        setTimeout(() => pin.write(record.idle), ms);
      },

      // For debugging
      toString() {
        return `${name} (GPIO${gpio}) owner=${owner} idle=${record.idle}`;
      },
    };

    logger.info(`[GPIO] claimed ${wrapper.toString()}`);
    return wrapper;
  }

  function listClaims() {
    return Array.from(claimed.values()).map(({ name, gpio, owner, idle }) => ({
      name,
      gpio,
      owner,
      idle,
    }));
  }

  return {
    claim,
    listClaims,
  };
}

module.exports = { createGpioManager };
