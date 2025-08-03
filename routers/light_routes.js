const router = require('express').Router();
const {
    allLightsOn,
    allLightsOff,
    setCustom
} = require('../controllers/pi_controller');

router.get('/on', allLightsOn);

router.get('/off', allLightsOff);

router.get('/custom', setCustom);

module.exports=router;