const {setCenterMessage, setTextAtPosition}= require('../handlers/oled_handler'); // Ensure OLED handler is initialized

const controlMessage = (req, res) => {
    const message = req.query.message || 'Default Message';
    try {
        setCenterMessage(message);
        res.status(200).json({result: "ok"});
    } catch (err) {
        console.error(Date.now(), '[OLED] Error setting center message:', err.message);
        res.status(500).json({error: "Failed to set center message"});
    }
}

const setOledText = (req, res) => {
    const { text, x, y } = req.query;
    if (!text || x === undefined || y === undefined) {
        setTextAtPosition("ERROR", 7, 7)
        return res.status(400).json({ error: 'Missing required parameters: text, x, y' });
    }
    
    try {
        setTextAtPosition(text, parseInt(x), parseInt(y));
        res.status(200).json({ result: "ok" });
    } catch (err) {
        console.error(Date.now(), '[OLED] Error setting text at position:', err.message);
        res.status(500).json({ error: "Failed to set text at position" });
    }
}

module.exports = {
    controlMessage,
    setOledText
}