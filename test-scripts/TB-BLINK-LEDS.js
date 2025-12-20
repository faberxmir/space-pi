const gpio = require('array-gpio');

const DIN   = gpio.out(11);  // GPIO17 / phys 11
const CLK   = gpio.out(13);  // GPIO27 / phys 13
const LATCH = gpio.out(15);  // GPIO22 / phys 15

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function pulse(pin) {
  pin.on();  await sleep(2);
  pin.off(); await sleep(2);
}

async function shiftBit(bit) {
  if (bit) DIN.on(); else DIN.off();
  await pulse(CLK);
}

async function showAll(bit) {
  for (let i = 0; i < 16; i++) await shiftBit(bit);
  await pulse(LATCH);
}

(async () => {
  while (true) {
    console.log("ALL ON");
    await showAll(1);
    await sleep(2000);

    console.log("ALL OFF");
    await showAll(0);
    await sleep(2000);
  }
})();
