function createBuzzerService({ signal, logger }) {
  let timeout = null;
  return {
    beep(ms = 150, hz=2000) {
      logger?.debug?.(`[BUZZER] beep for ${ms}ms at ${hz}Hz`);

      const halfPeriodNs = BigInt(Math.round(1e9 / (2 * hz)));
      const stopAt = process.hrtime.bigint() + BigInt(ms) * 1_000_000n;

      let next = process.hrtime.bigint();
      let state = 0;

      while (process.hrtime.bigint() < stopAt) {
        const now = process.hrtime.bigint();
        if (now >= next) {
          state ^= 1; // toggle between 0 and 1
          signal.write(state);
          next += halfPeriodNs;
        }
      }
      signal.write(0);
    },
    close() {
      if (timeout) clearTimeout(timeout);
      timeout = null;
      signal.write(0);
    }
  };
}

module.exports = { createBuzzerService };