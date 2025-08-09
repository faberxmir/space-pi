const r = require('array-gpio');

// TB62706BN pins
const dataPin  = r.out(11);  // DIN
// const clockPin = r.out(13);  // CLK
// const latchPin = r.out(15);  // LATCH

function allLightsOn() {

}
function allLightsOff() {

}
function setCustom(byte) {

}

function knightRider() {

}

module.exports={
    allLightsOff,
    allLightsOn,
    knightRider,
    setCustom,
}