// Central shutdown registry (LIFO).
// Bootstrap registers closers as phases/modules succeed.
// On shutdown we run them in reverse order.

function createLifecycle({ logger = console } = {}) {
  const closers = [];
  let closing = false;

  function register(name, fn) {
    if (typeof fn !== "function") return;
    closers.push({ name, fn });
  }

  async function closeAll(reason = "shutdown") {
    if (closing) return;
    closing = true;

    logger.info(`[LIFECYCLE] closeAll: ${reason} (${closers.length} closers)`);

    for (let i = closers.length - 1; i >= 0; i--) {
      const { name, fn } = closers[i];
      try {
        await fn();
        logger.info(`[LIFECYCLE] closed: ${name}`);
      } catch (err) {
        logger.error(`[LIFECYCLE] close failed: ${name}`, err);
      }
    }
  }

  return { register, closeAll };
}

module.exports = { createLifecycle };
