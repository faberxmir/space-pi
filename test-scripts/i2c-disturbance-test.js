// probe.js — only initialize 11/13/15, do nothing else
const r = require('array-gpio');
const data  = r.out(11);
const clock = r.out(13);
const latch = r.out(15);

// keep process alive briefly so you can check pin states
setTimeout(() => {}, 60000);
