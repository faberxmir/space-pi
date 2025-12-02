const gpio = require('array-gpio');
const {execSync} = require('child_process');

// TB62706BN pins
const dataPin  = gpio.out(11);  // DIN
const clockPin = gpio.out(13);  // CLK
const latchPin = gpio.out(15);  // LATCH
execSync('pinctrl -p set 3 a0; pinctrl -p set 5 a0');
init();

//--------------Light Patterns-----------------\\
runStartupRoutine();

function allLightsOn() {
    shiftOut16(255);

}
function allLightsOff() {
    shiftOut16(0);
}
function setCustom(byte) {
    shiftOut16(byte);

}
//--------------Light Patterns-----------------\\
async function runStartupRoutine() {
    shiftAllLightsOnce();
    await delay(1000);
    allLightsOn();
    await delay(1000);
    allLightsOff();
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

function shiftOut8(byte) {
  // Send 8 bits, MSB first
  for (let i = 7; i >= 0; i--) {
    dataPin.write((byte >> i) & 1);
    pulse(clockPin);
  }
  // Latch output
  pulse(latchPin);
}

function shiftOut16(byte) {
  // Send 16 bits, MSB first
  for (let i = 15; i >= 0; i--) {
    dataPin.write((byte >> i) & 1);
    pulse(clockPin);
  }
  pulse(latchPin);
}

function pulse(pin) {
  pin.on();
  pin.off();
}

function init() {
  dataPin.off();
  clockPin.off();
  latchPin.off();
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
}