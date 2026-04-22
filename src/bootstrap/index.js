// src/bootstrap/index.js
const { displayUp } = require("./phases/display_up");
const { coreIoUp } = require("./phases/core_io_up");
const { peripheralsUp } = require("./phases/peripherals_up");
const { createPinManager } = require("../platform/gpio");
const { createLifecycle } = require("./lifecycle");
const { routesUp } = require("./phases/routes_up");
const { terminalUp } = require("./phases/terminal_up");
const { cockpitUp } = require("./phases/cockpit_up");
const { ping_up }    = require("./phases/ping_up");
const { gunctrl_up } = require("./phases/gunctrl_up");
const { session_up } = require("./phases/session_up");

// ... other phase imports ...

async function bootstrap(context) {
  context.lifecycle = createLifecycle({logger: context.logger});
  context.gpio = createPinManager({ logger: context.logger });
  context.lifecycle.register("gpio", () => {
    context.logger?.info?.("Releasing all GPIO pins...");
    context.gpio.closeAll();
  });

  await displayUp(context);
  await coreIoUp(context);
  await peripheralsUp(context);
  await terminalUp(context);
  await session_up(context);
  await routesUp(context);
  await cockpitUp(context);
  await ping_up(context);
  await gunctrl_up(context);

  // await runtime(context);

  return context;
}

module.exports = { bootstrap };
