const express = require('express');
const {createBuzzerRoutes} = require('./routes/buzzer_routes');




module.exports = function createApp(context) {
    const app = express();
    app.use(express.json());
    app.use('/api/buzzer', createBuzzerRoutes({buzzerService: context.buzzerService, logger: context.logger}));
    return app;
}