// This script alternates on setting three GPIO pins high to test
// the corresponding inputs on the TB-INPUT-DIAGNOSIS boards.
// Usefull to check voltage, and if the intended pin settings in the 
// program match the actual wiring.

const gpio = require("array-gpio");

// BYTT 17 til GPIO-pinnen du har koblet til transistor-basen
const din = gpio.output(11);
const clk = gpio.output(13);
const latch = gpio.output(15);

let state = 0;

setInterval(() => {
  
  switch (state) {
  case 0:
    console.log("\n-- Pi 11 LOW → TB DIN HIGH --");
    console.log(" (TB should see 5V at DIN/serial input)");
    setDin();
    break;
  case 1:
    console.log("\n-- Pi 13 LOW → TB CLK HIGH --");
    console.log(" (TB should see 5V at CLK/clock input)");
    setClk();
    break;
  case 2:
    console.log("\n-- Pi 15 LOW → TB LATCH HIGH --");
    console.log(" (TB should see 5V at LATCH/latch input)");
    setLatch();
    break;
  }

  state < 2 ? state++ : state = 0;
}, 2000); // bytter hvert 2. sekund


function setDin() {
  din.off();
  clk.on();
  latch.on();
}
function setClk() {
  din.on();
  clk.off();
  latch.on();
}
function setLatch() {
  din.on();
  clk.on();
  latch.off();
}