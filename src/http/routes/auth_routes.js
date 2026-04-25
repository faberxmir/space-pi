const router = require('express').Router();

let pam = null;
try { pam = require('authenticate-pam'); } catch (_) {}

function parseCookies(req) {
  return (req.headers.cookie || '').split(';').reduce((acc, pair) => {
    const [k, ...v] = pair.trim().split('=');
    if (k) acc[k.trim()] = decodeURIComponent(v.join('='));
    return acc;
  }, {});
}

function verifyPam(username, password) {
  if (!pam) return Promise.resolve(false);
  return new Promise(resolve => pam.authenticate(username, password, err => resolve(!err)));
}

function createRateLimiter() {
  const attempts = new Map();
  const max     = parseInt(process.env.LOGIN_RATE_MAX             || '5',  10);
  const window  = parseInt(process.env.LOGIN_RATE_WINDOW_SECONDS  || '60', 10) * 1000;
  const penalty = parseInt(process.env.LOGIN_RATE_PENALTY_SECONDS || '60', 10) * 1000;

  return function check(ip) {
    const now = Date.now();
    const rec = attempts.get(ip) || { count: 0, firstAt: now, blockedAt: null };

    if (rec.blockedAt && now - rec.blockedAt < penalty) return false;

    if (now - rec.firstAt > window) {
      rec.count   = 0;
      rec.firstAt = now;
      rec.blockedAt = null;
    }

    rec.count++;
    if (rec.count > max) {
      rec.blockedAt = now;
      attempts.set(ip, rec);
      return false;
    }

    attempts.set(ip, rec);
    return true;
  };
}

function createAuthRoutes({ sessionService, oledService, logger }) {
  const checkRate = createRateLimiter();

  router.get('/auth/status', (req, res) => {
    const cookies = parseCookies(req);
    const session = sessionService.get(cookies.space_session || '');
    res.json({ loggedIn: !!session, username: session?.pilotName ?? null });
  });

  router.post('/auth/login', async (req, res) => {
    const ip       = req.ip || req.socket.remoteAddress || '';
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');

    if (!checkRate(ip)) {
      return res.status(429).json({ ok: false, error: 'Too many failed attempts. Try again later.' });
    }

    const ok = await verifyPam(username, password);

    if (!ok) {
      logger?.warn?.(`[AUTH] failed login from ${ip} for user '${username}'`);
      oledService?.showToast('LOGIN FAIL', ip, 4000);
      return res.status(401).json({ ok: false, error: 'Login incorrect.' });
    }

    const token = sessionService.create(username);
    res.setHeader('Set-Cookie', `space_session=${token}; Path=/; HttpOnly`);
    logger?.info?.(`[AUTH] ${username} logged in from ${ip}`);
    res.json({ ok: true });
  });

  router.post('/auth/logout', (req, res) => {
    const cookies = parseCookies(req);
    if (cookies.space_session) sessionService.destroy(cookies.space_session);
    res.setHeader('Set-Cookie', 'space_session=; Path=/; HttpOnly; Max-Age=0');
    res.json({ ok: true });
  });

  return router;
}

module.exports = { createAuthRoutes };
