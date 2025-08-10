const gpio = require('array-gpio');
const {execSync} = require('child_process');

// Important! array-gpio sets i2cpins to input by default.
// This is necessary to avoid interference with the OLED display.

function setPinOut(pin) {
    if(pin < 0 || pin > 27) {
        throw new Error('Invalid GPIO pin number: ' + pin);
    } else if(pin === 3 || pin === 5) {
        // Special case for pins used by OLED
        throw new Error('Cannot set pin ' + pin + ' to output, it is reserved for OLED display.');
    } else {
        execSync('pinctrl -p set 3 a0; pinctrl -p set 5 a0');
        return gpio.out(pin);

    }
}

function getGpio(){
    return gpio;
}

module.exports = {
    setPinOut,
    getGpio
}