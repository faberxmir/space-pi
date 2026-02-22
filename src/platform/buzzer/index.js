// src/platform/buzzer/index.js
const { pigpio } = require("pigpio-client");

function createPlatformBuzzer({ pinHandle, host = "::1", logger = console } = {}) {
  if (!pinHandle || typeof pinHandle.pin !== "number") {
    throw new Error("[PLATFORM_BUZZER] missing pinHandle with .pin (passive claim handle)");
  }

  const pin = pinHandle.pin;
  const client = pigpio({ host });

  client.on("error", (err) => {
    logger?.warn?.(`[PLATFORM_BUZZER] pigpio error: ${err?.message || err}`);
    // Force reconnect on next use
    ready = false;
    gpio = null;
    connecting = null;
  });

  let gpio = null;
  let ready = false;
  let connecting = null;

  function dutyToPigpio(duty01) {
    const x = Math.max(0, Math.min(1, Number(duty01)));
    return Math.round(x * 1_000_000);
  }

  function connect() {
    if (ready) return Promise.resolve();
    if (connecting) return connecting;

    connecting = new Promise((resolve, reject) => {
      const cleanup = () => {
        client.off("connected", onConnected);
        client.off("error", onError);
      };

      const onConnected = () => {
        ready = true;
        gpio = client.gpio(pin);
        logger?.info?.(`[PLATFORM_BUZZER] pigpiod connected host=${host} gpio=BCM${pin}`);
        cleanup();
        connecting = null;
        resolve();
      };

      const onError = (err) => {
        cleanup();
        connecting = null;
        reject(err);
      };

      client.on("connected", onConnected);
      client.on("error", onError);
    });

    return connecting;
  }

  async function startTone(hz, duty = 0.5) {
    await connect();
    const freq = Math.max(0, Math.floor(Number(hz) || 0));
    const dc = dutyToPigpio(duty);
    gpio.hardwarePWM(freq, dc);
  }

  async function stop() {
    if (!ready || !gpio) return;
    gpio.hardwarePWM(0, 0);
  }

  async function close() {
    try { await stop(); } catch (_) {}
    try { client.end?.(); } catch (_) {}
    ready = false;
    gpio = null;
  }

  return { startTone, stop, close };
}

module.exports = { createPlatformBuzzer };