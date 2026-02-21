function createBuzzerService({ signal, logger }) {
  let timeout = null;
  return {
    beep(ms = 150, hz=2000) {
      logger?.debug?.(`[BUZZER] beep for ${ms}ms at ${hz}Hz`);
      signal.write(1);
      if (timeout){
        clearTimeout(timeout);
        timeout = null;
      } 

      if(this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      let level = 0;
      const halfPeriodMs = Math.max(1, Math.floor(1000 / (hz * 2)));

      this._interval = setInterval(() => {
        level ^= 1 - level; // toggle between 0 and 1
        signal.write(level);
      }, halfPeriodMs);

       timeout = setTimeout(() => {
      clearInterval(this._interval);
        this._interval = null;
        signal.write(0);
        timeout = null;
      }, ms);
    },
    close() {
      if (timeout) clearTimeout(timeout);
      timeout = null;
      signal.write(0);
    }
  };
}

module.exports = { createBuzzerService };