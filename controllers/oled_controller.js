const {setCenterMessage, setTextAtPosition}= require('../handlers/oled_handler'); // Ensure OLED handler is initialized

const setCenterMessage = (req, res) => {
    const message = req.query.message || 'Default Message';
    try {
        setCenterMessage(message);
        res.status(200).json({result: "ok"});
    } catch (err) {
        console.error(Date.now(), '[OLED] Error setting center message:', err.message);
        res.status(500).json({error: "Failed to set center message"});
    }
}

module.exports = {
    setCenterMessage
}