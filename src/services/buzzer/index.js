function createBuzzerService({ signal, logger }) {
  return {
    beep(ms = 50) {
      throw new Error("Not implemented yet");
    },
    close() {}
  };
}

module.exports = { createBuzzerService };