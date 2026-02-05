// src/bootstrap/phases/display_up.js
const { createOledService } = require("../../services/oled/index");

async function displayUp(context) {
    context.oled = createOledService({
    i2cBusNumber: 1,
    address: 0x3c,
    logger: context.logger,
  });

  const res = await context.oled?.init();

  // Register shutdown only if initialized successfully
  // Showing OLED phase only if ready
  if (res?.ready) {
    context.lifecycle.register("oled", () => context.oled.close());
    context.oled.phase("DISPLAY_UP");
  } else throw new Error("OLED initialization failed");

  return context;
}

module.exports = { displayUp };