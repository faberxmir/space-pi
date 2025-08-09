const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const font = require('oled-font-5x7');

const i2cBus = i2c.openSync(1);
const oled = new Oled(i2cBus, {
    widt: 128,
    height: 64,
    address: 0x3c
});
console.log('OLED initialized');

function showMessage(text) {
    oled.clearDisplay();
    oled.setCursor(0,0);
    oled.writeString(font,1,text,1,true);
}

showMessage('SPACEPI!');