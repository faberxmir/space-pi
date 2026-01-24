const router = require('express').Router();
const {
    lightsOn,
    lightsOff,
    setLight,
    toggleLed
} = require('../controllers/led_controller');

router.get('/on', lightsOn);

router.get('/off', lightsOff);

router.get('/toggle', toggleLed);

router.get('/set', setLight);

module.exports=router;