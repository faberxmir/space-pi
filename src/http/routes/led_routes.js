const router = require('express').Router();

function createLedRoutes({ledService, logger}) {

    router.get('/on', (req, res) => {
        ledService?.allOn(); //default toggle when the route is accessed
        res.json({ message: "LEDs turned on!" });
    });

    router.get('/off', (req, res) => {
        ledService?.allOff();
        res.json({ message: "LEDs turned off!" });
    });
}

module.exports = {
    createLedRoutes
}