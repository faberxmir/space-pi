const router = require('express').Router();
const {
    lightsOn,
    lightsOff,
    setLight
} = require('../controllers/pi_controller');

router.get('/on', lightsOn);

router.get('/off', lightsOff);

router.get('/custom', setLight);

module.exports=router;