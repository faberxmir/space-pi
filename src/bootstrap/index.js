// src/bootstrap/index.js
const { displayUp } = require("./phases/display_up");

// ... other phase imports ...

async function bootstrap(context) {
  // OLED must come first
  await displayUp(context);

  // ... then the rest of your phases in order ...
  // await coreIoUp(ctx);
  // await peripheralsUp(ctx);
  // await routesUp(ctx);
  // await runtime(ctx);

  return context;
}

module.exports = { bootstrap };
