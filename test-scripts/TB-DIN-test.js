const gpio = require('array-gpio');
const dataPin  = gpio.out(11);  // Pi phys 11 = GPIO17

(async () => {
  dataPin.off();                 // 0 V for 3 s
  await new Promise(r => setTimeout(r, 3000));
  dataPin.on();                  // ~3.3 V for 5 s
  await new Promise(r => setTimeout(r, 5000));
  dataPin.off();                 // back to 0 V for 3 s
  await new Promise(r => setTimeout(r, 3000));
  process.exit(0);
})();
