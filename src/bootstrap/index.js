// src/bootstrap/index.js
const { displayUp } = require("./phases/display_up");
const { coreIoUp } = require("./phases/core_io_up");
const { peripheralsUp } = require("./phases/peripherals_up");
const { createPinManager } = require("../platform/gpio");
const { createLifecycle } = require("./lifecycle");
const { routesUp } = require("./phases/routes_up");

// ... other phase imports ...

async function bootstrap(context) {
  context.lifecycle = createLifecycle({logger: context.logger});
  context.gpio = createPinManager({ logger: context.logger });

  await displayUp(context);
  await coreIoUp(context);
  await peripheralsUp(context);
  context.buzzerService.beep();
  await routesUp(context);
  
  // await runtime(context);

  return context;
}

module.exports = { bootstrap };
