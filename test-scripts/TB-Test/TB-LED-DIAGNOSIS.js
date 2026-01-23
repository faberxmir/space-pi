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
  pin.on();  
  sleepMs(2);
  pin.off(); 
  sleepMs(2);
}

function latch() {
  CLK.off();
  sleepMs(2);
  pulse(LATCH);
  sleepMs(2);
}

function shiftBit(bit) {
  if (bit) DIN.off();
  else DIN.on();
  pulse(CLK);
}

function showOneAt(pos) {
  // shift 16 bits: a single '1' at index pos (0..15)
  for (let i = 0; i < 16; i++) {
    shiftBit(i === pos ? 1 : 0);
  }
  latch();
}


function showAll(bit) {
  for (let i = 0; i < 16; i++) shiftBit(bit);
  latch();
}

(async function run() {
  for (let pos = 0; pos < 16; pos++) {
    showOneAt(pos);
    console.log("pos", pos);
    sleepMs(2000);
  }

  console.log("ALL ON (5s)");
  showAll(1);
  sleepMs(5000);

  console.log("ALL OFF (5s)");
  showAll(0);
  sleepMs(5000);
})();