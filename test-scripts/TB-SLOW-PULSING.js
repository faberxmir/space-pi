// This script slowly pulses all LEDs ON.
const gpio = require('array-gpio');

const DIN   = gpio.out(11);  // physical pin 11 -> TB DIN
const CLK   = gpio.out(13);  // physical pin 13 -> TB CLK
const LATCH = gpio.out(15);  // physical pin 15 -> TB LATCH

function sleepMs(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

function pulse(pin) {
  pin.on();
  sleepMs(1);   // hold HIGH long enough to be a real pulse
  pin.off();
  sleepMs(1);   // small gap before next edge
}

function allOn() {
  for (let i = 0; i < 16; i++) {
    DIN.on();
    pulse(CLK);
  }
  pulse(LATCH);
}

allOn();
console.log("All LEDs should now light");
