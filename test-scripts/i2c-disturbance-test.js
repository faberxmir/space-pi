// probe.js — only initialize 11/13/15, do nothing else
const r = require('array-gpio');
const {execSync} = require('child_process');

const data  = r.out(11);
const clock = r.out(13);
const latch = r.out(15);

execSync('pinctrl -p set 3 a0; pinctrl -p set 5 a0');
require('./oled-test');


// keep process alive briefly so you can check pin states
setTimeout(() => {}, 60000);
