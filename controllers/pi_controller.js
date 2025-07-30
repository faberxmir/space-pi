import { Gpio } from "onoff";

const dataPin = new Gpio(17, 'out');
const clockPin = new Gpio(27, 'out');
const latchPin = new Gpio(22, 'out');


async function pulse(pin){
    await pin.write(1); //ON
    await pin.write(0); //OFF
}

async function shiftOut(byte){
    for(let i = 7; i >= 0; i--){
        const bit = (byte >> i) & 1;
        await dataPin.write(bit);
        await pulse(clockPin);
    }
}

async function setOutput(byte) {
    await latchPin.write(0);
    await shiftOut(byte);
    await latchPin.write(1);
}

async function main() {
    while(true) {
        for(let i = 0; i < 8; i++){
            const val = 1 << i;
            await setOutput(val);
            await sleep(200);
        }
    }
}

async function knightRider() {
  const leds = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80];

  while (true) {
    // Forward
    for (let val of leds) {
      await setOutput(~val & 0xFF);  // Invert if needed
      await sleep(100);
    }
    // Backward
    for (let val of leds.slice(1, -1).reverse()) {
      await setOutput(~val & 0xFF);  // Invert if needed
      await sleep(100);
    }
  }
}

knightRider();
process.on('SIGINT', ()=>{
    dataPin.unexport();
    clockPin.unexport();
    latchPin.unexport();
    process.exit();
});