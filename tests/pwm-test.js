// tests/pwm-test.js
const pigpio = require("pigpio-client").pigpio;

const gpio = pigpio({ host: "localhost" });
const BUZZER_GPIO = Number(process.env.BUZZER_GPIO ?? 18);

gpio.on("connected", () => {
  const buzzer = gpio.gpio(BUZZER_GPIO);

  console.log("buzzer keys:", Object.keys(buzzer).sort());
  console.log("buzzer proto keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(buzzer)).sort());

  process.exit(0);
});

gpio.on("error", (err) => console.error("pigpio error:", err));