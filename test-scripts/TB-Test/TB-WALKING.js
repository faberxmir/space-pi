// This script lights up one LED at a time in a walking pattern.
const gpio = require('array-gpio');

const DIN   = gpio.out(11);  // GPIO17 / pin11
const CLK   = gpio.out(13);  // GPIO27 / pin13
const LATCH = gpio.out(15);  // GPIO22 / pin15

function sleepMs(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

function pulse(pin) {
  pin.on();  sleepMs(2);
  pin.off(); sleepMs(2);
}

function latch() {
  pulse(LATCH);
}

function shiftBit(bit) {
  if (bit) DIN.on();
  else DIN.off();
  pulse(CLK);
}

function showOneAt(pos) {
  // shift 16 bits: a single '1' at index pos (0..15)
  for (let i = 0; i < 16; i++) {
    shiftBit(i === pos ? 1 : 0);
  }
  latch();
}

(async function run() {
  for (let pos = 0; pos < 16; pos++) {
    showOneAt(pos);
    console.log("pos", pos);
    sleepMs(500);
  }
})();
