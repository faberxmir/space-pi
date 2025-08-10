const router = require('express').Router();
const { setCenterMessage} = require('../controllers/oled_controller');

router.get('/', (req, res)=>{
    controlMessage(req, res);
    res.sendFile("index.html");
})

module.exports=router;