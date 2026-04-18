const { createTerminalService } = require('../../services/terminal');
const commands = require('../../config/terminal-commands.json');

async function terminalUp(context) {
  context.terminalService = createTerminalService({ commands, logger: context.logger });
  context.logger?.info?.('[TERMINAL_UP] terminal service ready');
  return context;
}

module.exports = { terminalUp };
