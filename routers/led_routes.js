const router = require('express').Router();
const {
    lightsOn,
    lightsOff,
    setLight,
    toggleLight
} = require('../controllers/led_controller');

router.get('/on', lightsOn);

router.get('/off', lightsOff);

router.get('/toggle', toggleLight);

module.exports=router;