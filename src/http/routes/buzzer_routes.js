// http/routes/buzzer_routes.js
const router = require('express').Router(); 

function createBuzzerRoutes({buzzerService, logger}) {

    router.get('/', (req, res) => {
        buzzerService?.beep(); //default beep when the route is accessed
        res.json({ message: "Buzzer routes are mounted!" });
    });

    return router;
}

module.exports = {
    createBuzzerRoutes
}