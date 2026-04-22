const { spawn } = require('child_process');

const TIMEOUT_MS = 10000;

function createTerminalService({ commands, logger }) {
  const internalHandlers = {};

  function run(commandName, args = []) {
    if (internalHandlers[commandName]) {
      return Promise.resolve().then(() => internalHandlers[commandName](args));
    }

    const config = commands[commandName];
    if (!config) return Promise.resolve({ allowed: false });

    const argv = config.allowArgs ? args : [];

    return new Promise((resolve) => {
      const proc = spawn(config.bin, argv);
      let out = '';
      let settled = false;

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        proc.kill();
        resolve({ allowed: true, success: false, output: (out + `\n[killed: timeout after ${TIMEOUT_MS / 1000}s]`).trimStart() });
      }, TIMEOUT_MS);

      proc.stdout.on('data', d => { out += d; });
      proc.stderr.on('data', d => { out += d; });
      proc.on('close', code => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        logger?.debug?.(`[TERMINAL] ${commandName} exited ${code}`);
        resolve({ allowed: true, success: code === 0, output: out.trimEnd() });
      });
      proc.on('error', err => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const msg = err.code === 'ENOENT'
          ? `'${config.bin}' not installed on this system`
          : err.message;
        resolve({ allowed: true, success: false, output: msg });
      });
    });
  }

  return {
    run,
    commands,
    registerInternal(name, handler) { internalHandlers[name] = handler; },
  };
}

module.exports = { createTerminalService };
