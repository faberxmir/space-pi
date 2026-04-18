const router = require('express').Router();

function createTerminalRoutes({ terminalService, logger }) {
  router.post('/:command', async (req, res) => {
    const { command } = req.params;
    const args = Array.isArray(req.body?.args) ? req.body.args.map(String) : [];

    logger?.info?.(`[TERMINAL] ${command} ${args.join(' ')}`);
    const result = await terminalService.run(command, args);

    if (!result.allowed) return res.status(403).json({ allowed: false, message: 'Command not allowed' });
    res.json(result);
  });

  return router;
}

module.exports = { createTerminalRoutes };
