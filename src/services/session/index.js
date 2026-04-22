const crypto = require('crypto');

function createSessionService({ ttlSeconds = 3600 } = {}) {
  const sessions = new Map();

  function create(pilotName) {
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { pilotName, createdAt: Date.now() });
    return token;
  }

  function get(token) {
    const session = sessions.get(token);
    if (!session) return null;
    if (Date.now() - session.createdAt > ttlSeconds * 1000) {
      sessions.delete(token);
      return null;
    }
    return session;
  }

  function destroy(token) {
    sessions.delete(token);
  }

  return { create, get, destroy };
}

module.exports = { createSessionService };
