const r = require('array-gpio');

const dataPin = new Gpio(11, {mode:Gpio.OUTPUT}); //Physical 11 blue
const clockPin = new Gpio(13, {mode:Gpio.OUTPUT}); //Physical 13 green
const latchPin = new Gpio(15, {mode:Gpio.OUTPUT}); //Physical 15 yellow


function shiftOut16(value) {
  for (let i = 15; i >= 0; i--) {
    const bit = (value >> i) & 1;
    dataPin.write(bit);
    clockPin.on();
    clockPin.off();
  }
  // Latch the outputs
  latchPin.on();
  latchPin.off();
}

// Simple LED chaser pattern
let pos = 0;
setInterval(() => {
  const ledPattern = 1 << pos;  // one LED on
  shiftOut16(ledPattern);       // high byte = 0
  pos = (pos + 1) % 8;
}, 150);