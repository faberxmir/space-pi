const {createLedService} = require("../../services/leds");
const {createBuzzerService} = require("../../services/buzzer");

// src/bootstrap/phases/peripherals_up.js
async function peripheralsUp(context) {

    if(!context?.pin?.TB) throw new Error("TB pins not initialized, cannot resume peripheralsUp phase");
    if(!context?.pin?.TB?.CLK || !context?.pin?.TB?.LATCH || !context?.pin?.TB?.DATA) throw new Error("TB CLK/LATCH/DATA pins not initialized, cannot resume peripheralsUp phase");
    if(!context?.pin?.BUZZER || !context?.pin?.BUZZER?.SIGNAL) throw new Error("BUZZER pin not initialized, cannot resume peripheralsUp phase");

    context.leds = createLedService({
      data: context.pin.TB.DATA,
      clk: context.pin.TB.CLK,
      latch: context.pin.TB.LATCH,
      logger: context.logger,
    });

    context.lifecycle.registerShutdownHandler("leds", async () => {
      context.logger?.info?.("Shutting down LED service...");
      await context.leds.close();
    });
        

    context.buzzer = createBuzzerService({
      signal: context.pin.BUZZER.SIGNAL,
      logger: context.logger,
    });
    context.lifecycle.registerShutdownHandler("buzzer", async () => {
      context.logger?.info?.("Shutting down Buzzer service...");
      await context.buzzer.close();
    });
    
    // TODO: create context.leds using already-claimed TB pins from coreIoUp
    // TODO: create context.buzzer using already-claimed buzzer pin from coreIoUp

    // TODO: register lifecycle shutdown handlers
    // TODO: optionally show OLED phase if ready
    context.oled?.phase("PERIPHERALS_UP");
    context.logger?.info?.("[BOOT] Peripherals not initialized yet, skipping for now");
  return context;
}

module.exports = { peripheralsUp };