const {
    allLightsOff,
    allLightsOn,
    setCustom,
    toggleLight
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
    const regex = /^0b[01]{16}$/
    if (!regex.test(byte)) {
        res.status(400).json({error:"Invalid byte format. Use 0b followed by 16 bits."});
        return;
    }
    setCustom(byte);
    res.status(200).json({result:"ok"});
}

const toggleLight = (req, res) => {
    const byte = req.query.byte;
    const regex = /^0b[01]{16}$/
    if (!regex.test(byte)) {
        res.status(400).json({error:"Invalid byte format. Use 0b followed by 16 bits."});
        return;
    }
    toggleLight(byte);
    res.status(200).json({result:"ok"});
}

module.exports={
    lightsOn,
    lightsOff,
    setLight,
    toggleLight
}