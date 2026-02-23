
function createroutes(context) {

    const oledRoutes = require('./oled_routes')(context);
    const ledRoutes = require('./led_routes')(context);
    const buzzerRoutes = require('./buzzer_routes')(context);

    const router = require('express').Router();

    router.use('/oled', oledRoutes);
    router.use('/led', ledRoutes);
    router.use('/buzzer', buzzerRoutes);

    return router;
}

module.exports = createroutes;