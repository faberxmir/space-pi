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

async function oledStartupRoutine(){
  const starttime = Date.now();
  if(!enabled || !oled) throw new Error('OLED not initialized'); 
  oled.clearDisplay();

  let prevX = null;
  for(let x=0; x < oled.WIDTH; x++){
    const t1 = Date.now();
    
    drawVerticalLine(x);
    if(prevX !== null) drawVerticalLine(prevX, 0); // erase previous line
    const t2 = Date.now();
    await asyncDelayMS(20); // control speed of animation
    console.info(`Column ${x} drawn in ${t2-t1} ms`);
    prevX = x;
    t3 = Date.now();
    console.info(`frame runtime including delay: ${t3-t1} ms`);
  }
  const executionTime = (Date.now() - starttime)/1000;
  console.log(executionTime + ' seconds for OLED startup routine');
}

function drawVerticalLine(x, color=1) {
  oled.drawLine(x, 0, x, oled.HEIGHT-1, color);
  oled.update();
}

function delayMS(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {}
}

async function asyncDelayMS(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { oledInit, isEnabled,setCenterMessage, setTextAtPosition };

