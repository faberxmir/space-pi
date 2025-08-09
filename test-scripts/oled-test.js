console.info('version 2');
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
      oled.writeString(font, 1, 'Spacepi!', 1, true);
      oled.setCursor(0, 8);
      oled.writeString(font, 1, 'Running with array-gpio in my pants!', 1, true);
      oled.setCursor(0, 24);
      oled.writeString(font, 1, 'going wilderness!', 1, true);
      console.log(Date.now(), '[OLED] Display updated');
    }, 1000);

    console.log(Date.now(), '[OLED] Display initialized');
  } catch (err) {
    console.error(Date.now(), '[OLED] Initialization error:', err.message);
  }
} else {
  console.warn(Date.now(), '[OLED] Skipped: not running on Raspberry Pi');
}
