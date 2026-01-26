const gpio = require('array-gpio');
const {execSync} = require('child_process');

// TB62706BN pins
const dataPin  = gpio.out(11);  // DIN
const clockPin = gpio.out(13);  // CLK
const latchPin = gpio.out(15);  // LATCH
execSync('pinctrl -p set 3 a0; pinctrl -p set 5 a0');

let state=0b0000000000000000;

init().then(async () => {
  //--------------Light Patterns-----------------\\
  await runStartupRoutine();
  console.info('Shift register initialized');
}).catch((err) => {
  console.error('Error initializing shift register:', err);
});


function allLightsOn() {
    state=0b1111111111111111
    shiftOut16(state);

}
function allLightsOff() {
    state=0b0000000000000000;
    shiftOut16(state);
}
async function setCustom(byte) {
    state=byte;
    await shiftOut16(byte);

}

function toggleBit(byte) {
    state=state ^ byte;
    shiftOut16(state);
}


//--------------Light Patterns-----------------\\
async function runStartupRoutine() {
    console.info('Running shift register startup routine');
    allLightsOff();
    await delay(500);
    allLightsOn();
    await delay(500);
    allLightsOff();
    await delay(500);
    await shiftAllLightsOnce();
    allLightsOn();
    await delay(1000);
    allLightsOff();
    await delay(1000);
    console.info('Shift register startup routine complete');
}

async function shiftAllLightsOnce(){
    for (let i = 0; i < 16; i++) {
        shiftOut16(1 << i);
        await delay(100);
    }
}

function knightRider() {

}

//-------------Private functions----------------\\
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function shiftOut16(byte) {
  byte = Number(byte);
  // Send 16 bits, MSB first
  for (let i = 15; i >= 0; i--) {
    dataPin.write(((byte >> i) & 1) ? 0 : 1);
    pulse(clockPin);
    await delay(2);
  }
  pulse(latchPin);
}

function pulse(pin) {
  pin.off();
  sleepMicroseconds(5) ;
  pin.on();
  sleepMicroseconds(5);
}

function sleepMicroseconds(us) {
  const start = process.hrtime.bigint();
  const end = start + BigInt(us) * BigInt(1000);
  while (process.hrtime.bigint() < end);
}

async function init() {
  dataPin.on(); // sets din at TB chip to 0V
  clockPin.on(); // sets clk at TB chip to 0V
  latchPin.on(); // sets latch at TB chip to 0V
  await setCustom(state);
}

//--------------Process Listeners-----------------\\
process.on('SIGINT', () => {
  shiftOut16(0);  // turn off all LEDs
  process.exit();
});

module.exports={
    allLightsOff,
    allLightsOn,
    knightRider,
    setCustom,
    toggleBit
}