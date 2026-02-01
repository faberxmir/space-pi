// src/bootstrap/phases/display_up.js
const { createOledService } = require("../../services/oled");

async function displayUp(context) {
    context.oled = createOledService({
    i2cBusNumber: 1,
    address: 0x3c,
    logger: context.logger,
  });

  const res = await context.oled.init();

  // Register shutdown only if initialized successfully
  // Showing OLED phase only if ready
  if (res.ready) {
    context.oled.phase("DISPLAY_UP");
    context.lifecycle.register("oledShutdown", () => context.oled.close());
  }

  return context;
}

module.exports = { displayUp };