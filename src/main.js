// Entry point of the Supertoad space war application
require('dotenv').config({path: require('path').resolve(__dirname, '../.env')});
const {bootstrap} = require('./bootstrap');

async function main() {
  const context = {
    logger: console,
  };

  // Boot the system
  await bootstrap(context);

  // Central shutdown handler
  const shutdown = async (reason, err) => {
    try {
      if (err) context.logger?.error?.(`[SHUTDOWN] ${reason}`, err);
      else context.logger?.info?.(`[SHUTDOWN] ${reason}`);

      await context.lifecycle?.closeAll?.(reason);
    } finally {
      // exit codes: 0 = clean, 1 = error
      process.exitCode = err ? 1 : 0;
    }
  };

  // Signals
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));

  // Fatal errors
  process.once("uncaughtException", (err) => shutdown("uncaughtException", err));
  process.once("unhandledRejection", (err) => shutdown("unhandledRejection", err));
}

main().catch((err) => {
  console.error("[MAIN] bootstrap failed", err);
  throw err;
});