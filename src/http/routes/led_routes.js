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

    router.get('/sequence', (req, res) => {
        if (!ledService) return res.status(503).json({ error: "LED service not available" });
        ledService.sequence(); // fire-and-forget
        res.json({ message: "LED sequence started" });
    });

    return router;
}

module.exports = {
    createLedRoutes
}