const gpio = require('array-gpio');

const DIN   = gpio.out(11);  // TB pin 2
const CLK   = gpio.out(13);  // TB pin 3
const LATCH = gpio.out(15);  // TB pin 4

function pulse(pin) {
  pin.on();
  sleepMs(10);
  pin.off();
  sleepMs(10);
}

function allOn() {
  // shift in 16 bits of "1"
  for (let i = 0; i < 16; i++) {
    DIN.on();
    pulse(CLK);
  }
  pulse(LATCH);
}

allOn();
console.log("All LEDs should now light");

function sleepMs(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}