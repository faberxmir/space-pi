const router = require('express').Router();

const createOledRoutes = ({oledService, logger}) => {
    router.get('/setText/:text', (req, res) => {
        const text = req.params.text;
        oledService.setTextCenter(text);
        logger.info(`OLED text set to: ${text}`);
        res.json({ message: `OLED text set to: ${text}` });
    });
    return router;
}

module.exports = {
    createOledRoutes
}