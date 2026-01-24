// oled_handler.js – eager, fail-fast singleton
console.info('initializing oled_handler.js');

const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const font = require('oled-font-5x7');

let i2cBus = null;
let oled = null;
let enabled = false;

const init = () => {
  if( enabled ) return true; // already initialized
  try {
    i2cBus = i2c.openSync(1);
  } catch (e) {
    console.warn('[OLED] I2C bus open failed:', e.message);
    return false;
  }

  try {
    oled = new Oled(i2cBus, { width: 128, height: 64, address: 0x3C });
    oled.clearDisplay();
    enabled = true;
    
    try {
      setTimeout(() => setCenterMessage('Paddeskip', 0, 0), 1000);
    } catch (e) {
      console.warn('[OLED] Initial message failed:', e.message);
    }
    console.log('[OLED] Display initialized');

    return true;
  } catch (e) {
    console.warn('[OLED] Display init failed:', e.message);
    try { i2cBus.closeSync(); } catch {};
    i2cBus = null;
    oled = null;
    enabled = false;
    return false;
  }
};

process.on('exit', () => {
  try { i2cBus.closeSync(); } catch {}
});

function round(n) { return Math.max(0, Math.round(n)); }

function setCenterMessage(text) {
  if(!enabled || !oled) throw new Error('OLED not initialized');

  oled.clearDisplay();
  const charW = 6, charH = 7; // 5x7 + spacing
  const w = oled.WIDTH  || 128;
  const h = oled.HEIGHT || 64;
  const x = Math.max(0, Math.round((w - text.length * charW) / 2));
  const y = Math.max(0, Math.round((h - charH) / 2));
  oled.setCursor(x, y);
  oled.writeString(font, 1, text, 1, true);
  // If your build requires it:
  // oled.update();
}

function setTextAtPosition(text, x, y) {
  if(!enabled || !oled) throw new Error('OLED not initialized'); 
  oled.setCursor(round(x), round(y));
  oled.writeString(font, 1, text, 1, true);
}

function isEnabled() {
  return enabled;
}

module.exports = { init, isEnabled,setCenterMessage, setTextAtPosition };

