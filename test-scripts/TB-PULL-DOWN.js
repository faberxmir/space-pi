const gpio = require('array-gpio');

const DIN   = gpio.out(11);  // phys 11
const CLK   = gpio.out(13);  // phys 13
const LATCH = gpio.out(15);  // phys 15

DIN.off(); 
CLK.off(); 
LATCH.off();

const sleep = ms => new Promise(r=>setTimeout(r, ms));


runTest();

async function runTest() {
    console.log("Starting CLK test... measure pin 3...");
    await sleep(5000);
    for(let i=0; i < 5; i++) {
        console.log(`ON pulse ${i+1}/5`);
        CLK.on(); 
        await sleep(2000);
        CLK.off(); 
        console.log(`OFF pulse ${i+1}/5`);
        await sleep(2000);
    }
    console.log("Starting LATCH test... measure pin 4...");
    await sleep(5000);
    for(let i=0; i < 5; i++) {
        console.log(`ON pulse ${i+1}/5`);
        LATCH.on(); 
        await sleep(2000);
        LATCH.off(); 
        console.log(`OFF pulse ${i+1}/5`);
        await sleep(2000);
    }
    console.log("Starting DIN test... measure pin 2...");
    await sleep(5000);
    for(let i=0; i < 5; i++) {
        console.log(`ON pulse ${i+1}/5`);
        DIN.on(); 
        await sleep(2000);
        DIN.off(); 
        console.log(`OFF pulse ${i+1}/5`);
        await sleep(2000);
    }
}