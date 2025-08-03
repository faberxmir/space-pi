const router = require('express').Router();
const {
    allLightsOn,
    allLightsOff
} = require('../controllers/pi_controller');

router.get('/on', allLightsOn);

router.get('/off', allLightsOff);

module.exports=router;