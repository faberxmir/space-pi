const gpio = require('array-gpio');

const dataPin  = gpio.out(11);  // Pi phys 11 = GPIO17 (DIN)
const clockPin = gpio.out(13);  // Pi phys 13 = GPIO27 (CLK)
const latchPin = gpio.out(15);  // Pi phys 15 = GPIO22 (LATCH)

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }
async function pulse(pin, ms=200){ pin.on(); await sleep(ms); pin.off(); await sleep(ms); }

(async () => {
  // Idle low
  dataPin.off(); clockPin.off(); latchPin.off();

  // Hold DIN HIGH and clock 16 times slowly (visible on a multimeter)
  dataPin.on();                             // logic "1" being shifted
  for (let i = 0; i < 16; i++) {
    await pulse(clockPin, 1000);
    console.log(`Clock pulse ${i+1}/16`);
  } 

  // Give LATCH a long, obvious pulse
  await pulse(latchPin, 800);

  // Keep running so you can probe with the meter if needed
  await sleep(3000);
  
  dataPin.off(); clockPin.off(); latchPin.off();
  process.exit(0);
})();
