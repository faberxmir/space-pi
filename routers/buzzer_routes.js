const router = require('express').Router();
const { playAnthem } = require('../controllers/buzzer_controller');

router.get('/playAnthem', playAnthem);

module.exports = router;