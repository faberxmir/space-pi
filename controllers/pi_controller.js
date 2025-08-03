const {
    allLightsOff,
    allLightsOn,
    setCustom
} = require('../handlers/pi_handler');

const allLightsOn = (req, res) => {
    allLightsOn();
    res.status(200).json({result:"ok"});
}

const allLightsOff = (req, res) => {
    allLightsOff();
    res.status(200).json({result:"ok"});
}

const setCustom = (req,res)=>{
    const byte=req.params.byte;
    setCustom(byte);
    res.status(200).json({result:"ok"});
}

module.exports={
    allLightsOn,
    allLightsOff,
    setCustom
}