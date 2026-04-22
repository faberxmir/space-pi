function parseCookies(req) {
  return (req.headers.cookie || '').split(';').reduce((acc, pair) => {
    const [k, ...v] = pair.trim().split('=');
    if (k) acc[k.trim()] = decodeURIComponent(v.join('='));
    return acc;
  }, {});
}

function createRequireAuth(sessionService) {
  return function requireAuth(req, res, next) {
    const path = req.path;
    if (path === '/login' || path.startsWith('/login/') || path === '/logout') {
      return next();
    }

    const cookies = parseCookies(req);
    const session = sessionService.get(cookies.space_session || '');
    if (session) {
      req.session = session;
      return next();
    }

    res.redirect('/login');
  };
}

module.exports = { createRequireAuth };
