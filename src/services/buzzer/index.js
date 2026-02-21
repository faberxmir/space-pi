function createBuzzerService({ signal, logger }) {
  let timeout = null;
  return {
    beep(ms = 50) {
      signal.write(1);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        signal.write(0);
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