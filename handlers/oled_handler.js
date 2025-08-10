// oled_handler.js – eager, fail-fast singleton
console.info('initializing oled_handler.js');

const isPi = process.platform === 'linux' && process.arch.startsWith('arm');
if (!isPi) {
  throw new Error('[OLED] Not running on Raspberry Pi ARM – aborting.');
}

const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const font = require('oled-font-5x7');

const i2cBus = (() => {
  try {
    return i2c.openSync(1);
  } catch (e) {
    throw new Error(`[OLED] Could not open I²C bus 1: ${e.message}`);
  }
})();

const oled = (() => {
  try {
    const d = new Oled(i2cBus, { width: 128, height: 64, address: 0x3C });
    
    setTimeout(() => setCenterMessage('Spacepi for everyone!'), 1000);
    console.log('[OLED] Display initialized');
    return d;
  } catch (e) {
    throw new Error(`[OLED] Init failed: ${e.message}`);
  }
})();

process.on('exit', () => {
  try { i2cBus.closeSync(); } catch {}
});

function round(n) { return Math.max(0, Math.round(n)); }

function setCenterMessage(text) {
  // eager init guarantees oled exists; if not, let it throw
  oled.clearDisplay();
  const charW = 6, charH = 7; // 5x7 font + 1px spacing
  const x = round((oled.width  - text.length * charW) / 2);
  const y = round((oled.height - charH) / 2);
  oled.setCursor(x, y);
  oled.writeString(font, 1, text, 1, true);
}

function setTextAtPosition(text, x, y) {
  oled.setCursor(round(x), round(y));
  oled.writeString(font, 1, text, 1, true);
}

module.exports = { setCenterMessage, setTextAtPosition };
