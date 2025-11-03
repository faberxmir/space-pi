
const gpio = require('array-gpio');
const DIN   = gpio.out(11);  // phys 11
const CLK   = gpio.out(13);  // phys 13
const LATCH = gpio.out(15);  // phys 15

DIN.off(); 
CLK.off(); 
LATCH.off();

const sleep = ms => new Promise(r=>setTimeout(r, ms));


for(let i=0; i < 5; i++) {
    CLK.on(); 
    await sleep(1000);
    CLK.off(); 
    await sleep(1000);
}