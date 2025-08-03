const {
    allLightsOff,
    allLightsOn,
    setCustom
} = require('../handlers/pi_handler');

const lightsOn = (req, res) => {
    allLightsOn();
    res.status(200).json({result:"ok"});
}

const lightsOff = (req, res) => {
    allLightsOff();
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