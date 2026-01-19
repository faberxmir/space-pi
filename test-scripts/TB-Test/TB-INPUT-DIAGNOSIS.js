// This script alternates the output of the TB DIN,CLK,LATCH pins
// between HIGH and LOW every 2 seconds using a transistor inverter.
// Usefull for diagnistic purposes to verify that signals to TB is working.

const gpio = require("array-gpio");

// BYTT 17 til GPIO-pinnen du har koblet til transistor-basen
const din = gpio.output(11);
const clk = gpio.output(13);
const latch = gpio.output(15);

let state = false;

setInterval(() => {
  state = !state;

  if (state) {
    din.on();  // Pi = 3.3V → transistor PÅ → TB DIN ca 0V
    clk.on();
    latch.on();
    console.log("Pi GPIO: HIGH  | TB DIN: LOW (~0V)");
  } else {
    din.off();   // Pi = 0V → transistor AV → TB DIN ca 5V
    clk.off();
    latch.off();
    console.log("Pi GPIO: LOW   | TB DIN: HIGH (~5V)");
  }
}, 2000); // bytter hvert 2. sekund
