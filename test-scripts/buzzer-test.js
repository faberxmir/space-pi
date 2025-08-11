// buzzer-test.js
const r = require('array-gpio');

// Physical pin 12 = GPIO18
const buz = r.out(12);

// Helper: tone for passive buzzers
function tone(pin, freq = 2000, durationMs = 2000) {
  const halfPeriodNs = BigInt(Math.round(1e9 / (2 * freq)));
  const stopAt = process.hrtime.bigint() + BigInt(durationMs) * 1_000_000n;

  let next = process.hrtime.bigint();
  let state = 0;

  while (process.hrtime.bigint() < stopAt) {
    const now = process.hrtime.bigint();
    if (now >= next) {
      state ^= 1;
      pin.write(state);
      next = now + halfPeriodNs;
    }
  }
  pin.low();
}

console.log("=== Active buzzer test: steady HIGH for 2s ===");
buz.high();
setTimeout(() => {
  buz.low();

  console.log("=== Passive buzzer test: 2kHz tone for 2s ===");
  tone(buz, 2000, 2000);

  console.log("Test done.");
}, 2000);
