const {
    allLightsOff,
    allLightsOn,
    setCustom
} = require('../handlers/shift_register_handler');

require('../handlers/oled_handler'); // Ensure OLED handler is initialized

const lightsOn = (req, res) => {
    console.info("Turning lights ON");
    allLightsOn();
    res.status(200).json({result:"ok"});
}

const lightsOff = (req, res) => {
    allLightsOff();
    console.info("Turning lights OFF");
    res.status(200).json({result:"ok"});
}

const setLight = (req,res)=>{
    const byte=req.query.byte;
    setCustom(byte);
    res.status(200).json({result:"ok"});
}

module.exports={
    lightsOn,
    lightsOff,
    setLight
}