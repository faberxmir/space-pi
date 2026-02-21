function createLedService({ data, clk, latch, logger }) {
  return {
    set(mask) {
      throw new Error("Not implemented yet");
    },
    close() {}
  };
}

module.exports = { createLedService };