//src/http/app.js
const express = require('express');
const {createBuzzerRoutes} = require('./routes/buzzer_routes');
const {createLedRoutes} = require('./routes/led_routes');

function createApp(context) {
    const app = express();
    app.use(express.json());
    app.use('/buzzer', createBuzzerRoutes({buzzerService: context.buzzerService, logger: context.logger}));
    app.use('/led', createLedRoutes({ledService: context.ledService, logger: context.logger}));
    return app;
}

module.exports = {createApp };