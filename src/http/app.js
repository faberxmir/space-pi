const express = require('express');
const {createBuzzerRoutes} = require('./routes/buzzer_routes');


function createApp(context) {
    const app = express();
    app.use(express.json());
    app.use('/api/buzzer', createBuzzerRoutes({buzzerService: context.buzzerService, logger: context.logger}));
    
    return app;
}

module.exports = {createApp };