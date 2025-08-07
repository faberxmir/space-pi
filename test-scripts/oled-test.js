const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const font = require('oled-font-5x7');

const i2cBus = i2c.openSync(1);

const oled = new Oled(i2cBus, {
  width: 128,
  height: 64,
  address: 0x3C
});

// Delay 500ms before writing
setTimeout(() => {
  oled.clearDisplay();
  oled.setCursor(0, 0);
  oled.writeString(font, 1, 'SPACEPI!', 1, true);
}, 500);
