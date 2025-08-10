console.info('initializing oled_handler.js');
let oled;

if (process.platform === 'linux' && process.arch.startsWith('arm')) {
  try {
    const i2c = require('i2c-bus');
    const Oled = require('oled-i2c-bus');
    const font = require('oled-font-5x7');

    const i2cBus = i2c.openSync(1);

    oled = new Oled(i2cBus, {
      width: 128,
      height: 64,
      address: 0x3C
    });
    
    setCenterMessage('Spacepi 1!');

    // Delay OLED usage by 1 second for safety
    // setTimeout(() => {
    //   oled.clearDisplay();  // Just clear — don't turn off/on yet
    //   oled.setCursor(0, 0);
    //   oled.writeString(font, 1, 'Spacepi!', 1, true);
    //   oled.setCursor(0, 8);
    //   oled.writeString(font, 1, 'Happy times!', 1, true);
    //   console.log('[OLED] Display updated');
    // }, 1000);

    console.log('[OLED] Display initialized');
  } catch (err) {
    console.error('[OLED] Initialization error:', err.message);
  }
} else {
  console.warn('[OLED] Skipped: not running on Raspberry Pi');
}

function setCenterMessage(text) {
    const x = (oled.width - (text.length * 6)) / 2; // 6 is the width of each character in 5x7 font
    const y = (oled.height - 7) / 2; // 7 is the height of the font
    oled.setCursor(x, y);
    oled.writeString(font, 1, text, 1, true);
}

function setTextAtPosition(text, x, y) {
    oled.setCursor(x, y);
    oled.writeString(font, 1, text, 1, true);
}

module.exports = {
    showMessage,
    setTextAtPosition
};
