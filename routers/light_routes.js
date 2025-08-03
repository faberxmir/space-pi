const router = require('express').Router();
const {
    allLightsOn,
    allLightsOff,
    setCustom
} = require('../handlers/pi_handler');

router.get('/on', allLightsOn);

router.get('/off', allLightsOff);

router.get('/custom', setCustom);

module.exports=router;