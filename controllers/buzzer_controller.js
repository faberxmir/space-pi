const buzzer_handler = require('../handlers/buzzer_handler');

const playAnthem = async (req, res) => {
    buzzer_handler.playTune(buzzer_handler.ANTHEM_SEQUENCE);
    res.status(200).json({result: "Playing anthem"});
}

module.exports = {
    playAnthem
}