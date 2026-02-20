// src/bootstrap/index.js
const { displayUp } = require("./phases/display_up");
const { coreIoUp } = require("./phases/core_io_up");
const { createPinManager } = require("../../platform/gpio");
const { createLifecycle } = require("./lifecycle");

// ... other phase imports ...

async function bootstrap(context) {
  context.lifecycle = createLifecycle({logger: context.logger});
  constext.pinManager = {gpio: createPinManager({ logger: context.logger })};

  //await coreIoUp(context);
  await displayUp(context);

  // ... then the rest of your phases in order ...
  // await peripheralsUp(ctx);
  // await routesUp(ctx);
  // await runtime(ctx);

  return context;
}

module.exports = { bootstrap };
