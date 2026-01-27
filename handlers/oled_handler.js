// oled_handler.js – eager, fail-fast singleton

const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const font = require('oled-font-5x7');

let i2cBus = null;
let oled = null;
let enabled = false;

const oledInit = async () => {
  console.info('initializing oled_handler.js');
  if( enabled ) {
    console.info('OLED already initialized');
    return true; // already initialized
  }
  try {
    console.info('Opening I2C bus 1');
    i2cBus = i2c.openSync(1);
  } catch (e) {
    console.warn('[OLED] I2C bus open failed:', e.message);
    return false;
  }

  try {
    oled = new Oled(i2cBus, { width: 128, height: 64, address: 0x3C });
    oled.clearDisplay();
    enabled = true;
    await oledStartupRoutine();
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
}

function setTextAtPosition(text, x, y) {
  if(!enabled || !oled) throw new Error('OLED not initialized'); 
  oled.setCursor(round(x), round(y));
  oled.writeString(font, 1, text, 1, true);
}

function isEnabled() {
  return enabled;
}

async function oledStartupRoutine(){
  if(!enabled || !oled) throw new Error('OLED not initialized'); 
  oled.clearDisplay();
  let prevX = null;
  let prevY = null;
  let y = 0;
  for(let x=0; x < oled.WIDTH-1; x++){

    if(x % 2 === 0) {
      drawHorizontalLine(y);
      if(prevY !== null) drawHorizontalLine(prevY, 0);
      prevY = y++;
    }
    
    drawVerticalLine(x);
    if(prevX !== null) drawVerticalLine(prevX, 0);

    prevX = x;
    oled.update();
    await asyncDelayMS(10); // control speed of animation
  }
  oled.clearDisplay();
  oled.update();
}

function drawVerticalLine(x, color=1) {
  oled.drawLine(x, 0, x, oled.HEIGHT-1, color);
}

function drawHorizontalLine(y, color=1) {
  oled.drawLine(0, y, oled.WIDTH-1, y, color);
}

function delayMS(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {}
}

async function asyncDelayMS(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { oledInit, isEnabled,setCenterMessage, setTextAtPosition };

