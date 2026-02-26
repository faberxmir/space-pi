const router = require('express').Router();

function createLedRoutes({ledService, logger}) {

    router.get('/', (req, res) => {
        ledService?.toggle(); //default toggle when the route is accessed
        res.json({ message: "LED routes are mounted!" });
    });
}

module.exports = {
    createLedRoutes
}