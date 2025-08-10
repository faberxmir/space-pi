const router = require('express').Router();
const { controlMessage, setOledText} = require('../controllers/oled_controller');

router.get('/', (req, res)=>{
    res.sendFile("index.html");
})

router.get('/control', controlMessage)

router.get('/setText',setOledText);

module.exports=router;