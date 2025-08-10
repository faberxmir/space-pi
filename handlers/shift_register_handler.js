const {getGpio, setPinOut} = require('gpio-handler');

// TB62706BN pins
const dataPin  = setPinOut(11);  // DIN
const clockPin = setPinOut(13);  // CLK
const latchPin = setPinOut(15);  // LATCH

function allLightsOn() {
    shiftOut8(255);

}
function allLightsOff() {
    shiftOut8(0);
}
function setCustom(byte) {
    shiftOut8(byte);

}

function knightRider() {

}

//-------------Private functions----------------\\

function shiftOut8(byte) {
  // Send 8 bits, MSB first
  for (let i = 7; i >= 0; i--) {
    dataPin.write((byte >> i) & 1);
    pulse(clockPin);
  }
  // Latch output
  pulse(latchPin);
}

function pulse(pin) {
  pin.on();
  pin.off();
}

//--------------Process Listeners-----------------\\
process.on('SIGINT', () => {
  shiftOut8(0);  // turn off all LEDs
  process.exit();
});

module.exports={
    allLightsOff,
    allLightsOn,
    knightRider,
    setCustom,
}