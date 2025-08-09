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

    // Delay OLED usage by 1 second for safety
    setTimeout(() => {
      oled.clearDisplay();  // Just clear — don't turn off/on yet
      oled.setCursor(0, 0);
      oled.writeString(font, 1, 'Hello Geir!', 1, true);
      oled.setCursor(0, 8);
      oled.writeString(font, 1, 'This is awesome!', 1, true);
      oled.setCursor(0, 16);
      oled.writeString(font, 1, 'This is 5v running on!!', 1, true);
      console.log('[OLED] Display updated');
    }, 1000);

    console.log('[OLED] Display initialized');
  } catch (err) {
    console.error('[OLED] Initialization error:', err.message);
  }
} else {
  console.warn('[OLED] Skipped: not running on Raspberry Pi');
}

function showMessage(text) {
    oled.clearDisplay();
    oled.setCursor(0,0);
    oled.writeString(font,1,text,1,true);
}

showMessage('SPACEPI!');