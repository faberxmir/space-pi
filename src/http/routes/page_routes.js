const router = require('express').Router();

function createPageRoutes() {
    router.get('/', (req, res) => res.render('index', { page: 'index' }));
    router.get('/api-docs', (req, res) => res.render('api-docs', { page: 'api-docs' }));
    return router;
}

module.exports = { createPageRoutes };
