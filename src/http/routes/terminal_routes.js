const router = require('express').Router();

function parseCookies(req) {
  return (req.headers.cookie || '').split(';').reduce((acc, pair) => {
    const [k, ...v] = pair.trim().split('=');
    if (k) acc[k.trim()] = decodeURIComponent(v.join('='));
    return acc;
  }, {});
}

function createTerminalRoutes({ terminalService, sessionService, logger }) {
  router.post('/:command', async (req, res) => {
    const cookies = parseCookies(req);
    const session = sessionService?.get(cookies.space_session || '');
    if (!session) return res.status(401).json({ allowed: false, error: 'Not authenticated' });

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
