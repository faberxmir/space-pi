// src/bootstrap/phases/display_up.js
const { createOledService } = require("../../services/oled");

async function displayUp(ctx) {
  ctx.oled = createOledService({
    i2cBusNumber: 1,
    address: 0x3C,
    logger: ctx.logger,
  });

  const res = await ctx.oled.init();

  // If OLED is up, use it immediately for phase output
  if (res.ready) {
    ctx.oled.phase("DISPLAY_UP");
  }

  return ctx;
}

module.exports = { displayUp };