const gpio = require('array-gpio');
const DIN   = gpio.out(11);  // phys 11
const CLK   = gpio.out(13);  // phys 13
const LATCH = gpio.out(15);  // phys 15

const sleep = ms => new Promise(r=>setTimeout(r, ms));
(async () => {
  DIN.off(); CLK.off(); LATCH.off();

  // make outputs transparent while LATCH is HIGH
  LATCH.on();

  // shift 16 ones slowly; you should see LEDs accumulate ON
  DIN.on();
  for (let i = 0; i < 16; i++) {
    CLK.on(); await sleep(250);
    CLK.off(); await sleep(250);
  }

  // lock outputs
  LATCH.off();
  process.exit(0);
})();
