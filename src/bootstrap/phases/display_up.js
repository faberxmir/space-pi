// src/bootstrap/phases/display_up.js
const { createOledService } = require("../../services/oled");

async function displayUp(context) {
  context.oled = createOledService({
    i2cBusNumber: 1,
    address: 0x3c,
    logger: context.logger,
  });

  const res = await context.oled.init();

  // If OLED is up, use it immediately for phase output
  if (res.ready) {
    context.oled.phase("DISPLAY_UP");
  }

  return context;
}

module.exports = { displayUp };