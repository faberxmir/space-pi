const router = require('express').Router();

const createOledRoutes = (context, logger) => {
    router.get('/setText/:text', (req, res) => {
        const text = req.params.text;
        context.oledService.setTextCenter(text);
        res.json({ message: `OLED text set to: ${text}` });
    });
    return router;
}

module.exports = {
    createOledRoutes
}