// tests/pwm-test.js
const pigpio = require("pigpio-client").pigpio;

const gpio = pigpio({ host: "localhost" });
const BUZZER_GPIO = Number(process.env.BUZZER_GPIO ?? 18);

gpio.on("connected", () => {
  console.log("[pigpiod] connected");

  const buzzer = gpio.gpio(BUZZER_GPIO);

  const frequency = 880;     // Hz
  const dutyCycle = 500000;  // 50% (0..1_000_000)

  console.log(`[PWM] gpio=${BUZZER_GPIO} freq=${frequency}Hz duty=${dutyCycle}`);

  buzzer.hardwarePWM(frequency, dutyCycle);

  setTimeout(() => {
    buzzer.hardwarePWM(0, 0); // stop
    console.log("[PWM] stop");
    process.exit(0);
  }, 500).unref();
});

gpio.on("error", (err) => console.error("pigpio error:", err));