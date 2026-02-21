// src/bootstrap/phases/display_up.js
const { createOledService } = require("../../services/oled/index");

async function displayUp(context) {
    context.oled = createOledService({
    i2cBusNumber: 1,
    address: 0x3c,
    logger: context.logger,
  });

  context.gpio?.claim({
    name: "i2c SDA",
    owner: "OLED",
    pinNumber: 2,
    mode: "passive",
  });

  context.gpio?.claim({
    name: "i2c SCL",
    owner: "OLED",
    pinNumber: 3,
    mode: "passive",
  });

  const res = await context.oled?.init();

  // Register shutdown only if initialized successfully
  // Showing OLED phase only if ready
  if (res?.ready) {
    context.lifecycle.register("oled", () => {
      context.logger?.info?.("Shutting down OLED service...");
      return context.oled.close();
    });
    context.oled.phase("DISPLAY_UP");
  } else throw new Error("OLED initialization failed");

  return context;
}

module.exports = { displayUp };