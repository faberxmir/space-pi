function createBuzzerService({ platformBuzzer, logger }) {
  let timeout = null;

  async function beep(ms = 150, hz = 2000) {
    logger?.debug?.(`[BUZZER] beep ${ms}ms @ ${hz}Hz`);

    await platformBuzzer.startTone(hz);

    timeout = setTimeout(async () => {
      await platformBuzzer.stop();
      timeout = null;
    }, ms);
  }

  async function close() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    await platformBuzzer.stop();
  }

  return {
    beep,
    close
  };
}

module.exports = { createBuzzerService };