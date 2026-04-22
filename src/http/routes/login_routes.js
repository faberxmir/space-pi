const fs     = require('fs');
const path   = require('path');
const router = require('express').Router();

const PILOT_JSON = path.join(__dirname, '../../../cockpit/pilot.json');

let pam = null;
try {
  pam = require('authenticate-pam');
} catch (_) {
  // authenticate-pam not available (dev environment or missing libpam0g-dev)
}

function parseCookies(req) {
  return (req.headers.cookie || '').split(';').reduce((acc, pair) => {
    const [k, ...v] = pair.trim().split('=');
    if (k) acc[k.trim()] = decodeURIComponent(v.join('='));
    return acc;
  }, {});
}

function loadPilot() {
  try { return JSON.parse(fs.readFileSync(PILOT_JSON, 'utf8')); } catch (_) { return {}; }
}

function verifyPam(username, password) {
  if (!pam) return Promise.resolve(false);
  return new Promise(resolve => {
    pam.authenticate(username, password, err => resolve(!err));
  });
}

function createRateLimiter() {
  const attempts = new Map();
  const max      = parseInt(process.env.LOGIN_RATE_MAX             || '5',  10);
  const window   = parseInt(process.env.LOGIN_RATE_WINDOW_SECONDS  || '60', 10) * 1000;
  const penalty  = parseInt(process.env.LOGIN_RATE_PENALTY_SECONDS || '60', 10) * 1000;

  return function check(ip) {
    const now  = Date.now();
    const rec  = attempts.get(ip) || { count: 0, firstAt: now, blockedAt: null };

    if (rec.blockedAt && now - rec.blockedAt < penalty) return false;

    if (now - rec.firstAt > window) {
      rec.count = 0;
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

function createLoginRoutes({ sessionService, oledService, logger }) {
  const checkRate = createRateLimiter();

  router.get('/login', (req, res) => {
    const pilot = loadPilot();
    res.render('login', { page: 'login', pilot });
  });

  router.post('/login', async (req, res) => {
    const ip       = req.ip || req.socket.remoteAddress || '';
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');

    if (!checkRate(ip)) {
      return res.status(429).render('login', {
        page: 'login',
        pilot: loadPilot(),
        error: 'Too many failed attempts. Try again later.',
      });
    }

    const ok = await verifyPam(username, password);

    if (!ok) {
      logger?.warn?.(`[LOGIN] failed attempt from ${ip} for user '${username}'`);
      oledService?.showLoginFail(ip);
      return res.status(401).render('login', {
        page: 'login',
        pilot: loadPilot(),
        error: 'Invalid credentials.',
      });
    }

    const token = sessionService.create(username);
    res.setHeader('Set-Cookie', `space_session=${token}; Path=/; HttpOnly`);
    logger?.info?.(`[LOGIN] ${username} logged in from ${ip}`);
    res.redirect('/');
  });

  router.post('/logout', (req, res) => {
    const cookies = parseCookies(req);
    if (cookies.space_session) sessionService.destroy(cookies.space_session);
    res.setHeader('Set-Cookie', 'space_session=; Path=/; HttpOnly; Max-Age=0');
    res.redirect('/login');
  });

  return router;
}

module.exports = { createLoginRoutes };
