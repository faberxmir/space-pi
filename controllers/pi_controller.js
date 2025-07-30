const r = require('array-gpio');

// TB62706BN pins
const dataPin  = r.out(11);  // DIN
const clockPin = r.out(13);  // CLK
const latchPin = r.out(15);  // LATCH

knightRider();

function shiftOut16(value) {
  for (let i = 15; i >= 0; i--) {
    const bit = (value >> i) & 1;
    dataPin.write(bit);
    pulse(clockPin);
  }
  // Latch the outputs
  pulse(latchPin);
}

function pulse(pin) {
  pin.high();
  pin.low();
}

function shiftOut8(byte) {
  // Send 8 bits, MSB first
  for (let i = 7; i >= 0; i--) {
    dataPin.write((byte >> i) & 1);
    pulse(clockPin);
  }
  // Latch output
  pulse(latchPin);
}

async function knightRider() {
  const delay = ms => new Promise(r => setTimeout(r, ms));
  let pattern = 1;

  while (true) {
    // Sweep right
    for (let i = 0; i < 8; i++) {
      shiftOut8(pattern << i);
      await delay(60);
    }
    // Sweep left
    for (let i = 6; i > 0; i--) {
      shiftOut8(pattern << i);
      await delay(60);
    }
  }
}

process.on('SIGINT', () => {
  shiftOut8(0);  // turn off all LEDs
  process.exit();
});