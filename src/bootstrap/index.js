// src/bootstrap/index.js
const { displayUp } = require("./phases/display_up");

// ... other phase imports ...

async function bootstrap(context) {
  // OLED must come first
  await displayUp(ctx);

  // ... then the rest of your phases in order ...
  // await coreIoUp(ctx);
  // await peripheralsUp(ctx);
  // await routesUp(ctx);
  // await runtime(ctx);

  return ctx;
}

module.exports = { bootstrap };
