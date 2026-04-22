const { createSessionService } = require('../../services/session');

async function session_up(context) {
  const ttlSeconds = parseInt(process.env.SESSION_TTL_SECONDS || '3600', 10);
  context.sessionService = createSessionService({ ttlSeconds });
  context.logger?.info?.('[SESSION_UP] session service ready');
  return context;
}

module.exports = { session_up };
