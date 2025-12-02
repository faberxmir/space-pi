const gpio = require("array-gpio");

// BYTT 17 til GPIO-pinnen du har koblet til transistor-basen
const din = gpio.output(11);

let state = false;

setInterval(() => {
  state = !state;

  if (state) {
    din.high();  // Pi = 3.3V → transistor PÅ → TB DIN ca 0V
    console.log("Pi GPIO: HIGH  | TB DIN: LOW (~0V)");
  } else {
    din.low();   // Pi = 0V → transistor AV → TB DIN ca 5V
    console.log("Pi GPIO: LOW   | TB DIN: HIGH (~5V)");
  }
}, 2000); // bytter hvert 2. sekund
