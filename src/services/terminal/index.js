const { spawn } = require('child_process');

function createTerminalService({ commands, logger }) {
  function run(commandName, args = []) {
    const config = commands[commandName];
    if (!config) return Promise.resolve({ allowed: false });

    const argv = config.allowArgs ? args : [];

    return new Promise((resolve) => {
      const proc = spawn(config.bin, argv);
      let out = '';
      proc.stdout.on('data', d => { out += d; });
      proc.stderr.on('data', d => { out += d; });
      proc.on('close', code => {
        logger?.debug?.(`[TERMINAL] ${commandName} exited ${code}`);
        resolve({ allowed: true, success: code === 0, output: out.trimEnd() });
      });
      proc.on('error', err => {
        const msg = err.code === 'ENOENT'
          ? `'${config.bin}' not installed on this system`
          : err.message;
        resolve({ allowed: true, success: false, output: msg });
      });
    });
  }

  return { run, commands };
}

module.exports = { createTerminalService };
