const {
    allLightsOff,
    allLightsOn,
    setCustom,
    toggleBit
} = require('../handlers/shift_register_handler');

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

const toggleLed = (req, res) => {
    const byte = req.query.byte;
    const regex = /^0b[01]{16}$/
    if (!regex.test(byte)) {
        res.status(400).json({error:"Invalid byte format. Use 0b followed by 16 bits."});
        return;
    }
    toggleBit(byte);
    res.status(200).json({result:"ok"});
}

module.exports={
    lightsOn,
    lightsOff,
    setLight,
    toggleLed
}