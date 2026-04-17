function createLedService({ data, clk, latch, logger, activeBytes = 0xffff }) {
  // Extract sorted list of active bit positions from the bitmask
  const activeBits = [];
  for (let i = 0; i < 16; i++) {
    if ((activeBytes >> i) & 1) activeBits.push(i);
  }

  let sequencing = false;

  function pulse(line) {
    line.write(1);
    line.write(0);
  }

  function set(mask) {
    const value = (Number(mask) >>> 0) & 0xffff;
    for (let bit = 15; bit >= 0; bit--) {
      const b = (value >> bit) & 1;
      data.write(b ? 0 : 1); // active low
      pulse(clk);
    }
    pulse(latch);
    logger?.debug?.(`[LEDS] set 0x${value.toString(16).padStart(4, "0")}`);
  }

  function buildSteps() {
    const n = activeBits.length;
    const masks = [];
    // Forward: single LED, then sliding window of 2
    masks.push(1 << activeBits[0]);
    for (let i = 1; i < n; i++) {
      masks.push((1 << activeBits[i - 1]) | (1 << activeBits[i]));
    }
    // Reverse: sliding window back to single LED, then all off
    for (let tail = n - 2; tail >= 0; tail--) {
      masks.push(tail === 0
        ? (1 << activeBits[0])
        : (1 << activeBits[tail - 1]) | (1 << activeBits[tail])
      );
    }
    masks.push(0);
    return masks;
  }

  async function sequence({ stepDelay = 100 } = {}) {
    if (sequencing) return;
    sequencing = true;
    try {
      const steps = buildSteps();
      for (const mask of steps) {
        set(mask);
        await new Promise(r => setTimeout(r, stepDelay));
      }
    } finally {
      sequencing = false;
    }
  }

  return {
    set,
    allOn() { set(0xffff); },
    allOff() { set(0); },
    sequence,
    close() {},
  };
}

module.exports = { createLedService };
