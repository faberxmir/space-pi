const r = require('array-gpio');

// TB62706BN pins
const dataPin  = r.out(11);  // DIN
const clockPin = r.out(13);  // CLK
const latchPin = r.out(15);  // LATCH


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