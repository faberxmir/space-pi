
const createOledRoutes = ({oledService, logger}) => {
    const router = require('express').Router();
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