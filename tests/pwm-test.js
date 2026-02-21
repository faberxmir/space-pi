// tests/pwm-test.js
const pigpio = require('pigpio-client').pigpio;

const gpio = pigpio({ host: 'localhost' });

// Use the BCM number of your buzzer pin
const BUZZER_GPIO = Number(process.env.BUZZER_GPIO ?? 18);

gpio.on('connected', () => {
  console.log('[pigpiod] connected');

  const buzzer = gpio.gpio(BUZZER_GPIO);

  const frequency = 880;        // Hz
  const dutyCycle = 500000;     // 50% (range 0–1_000_000)

  console.log(`[PWM] gpio=${BUZZER_GPIO} freq=${frequency}Hz`);

  buzzer.hardwarePwmWrite(frequency, dutyCycle);

  setTimeout(() => {
    buzzer.hardwarePwmWrite(0, 0);
    console.log('[PWM] stop');
    process.exit(0);
  }, 500);
});

gpio.on('error', (err) => {
  console.error('pigpio error:', err);
});