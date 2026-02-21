// tests/pwm-test.js
const { Gpio } = require("pigpio");

// Pick the GPIO pin you wired the buzzer signal to (BCM number).
// From earlier context you used BCM18 for PWM in some tests sometimes,
// but set this to the pin you actually use now.
const BUZZER_GPIO = Number(process.env.BUZZER_GPIO ?? 18);

const buzzer = new Gpio(BUZZER_GPIO, { mode: Gpio.OUTPUT });

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

// pigpio hardware PWM:
// - frequency in Hz
// - dutyCycle in range 0..1_000_000 (1e6 = 100%)
function playTone({ frequency, duty = 0.5, ms = 500 }) {
  const dutyCycle = Math.round(clamp(duty, 0, 1) * 1_000_000);

  console.log(`[PWM] gpio=${BUZZER_GPIO} freq=${frequency}Hz duty=${duty} ms=${ms}`);

  // Start PWM
  buzzer.hardwarePwmWrite(frequency, dutyCycle);

  // Stop later (non-blocking)
  setTimeout(() => {
    buzzer.hardwarePwmWrite(0, 0); // stop PWM
    console.log("[PWM] stop");
    process.exit(0);
  }, ms).unref();
}

// Example: A5 (880 Hz) for 0.5s
playTone({ frequency: 880, duty: 0.5, ms: 500 });