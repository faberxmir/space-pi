const router = require('express').Router();
const { controlMessage, setOledText, init} = require('../controllers/oled_controller');


if(!init()){
    throw new Error("OLED initialization failed in oled_routes.js");
}

router.get('/', (req, res)=>{
    res.sendFile("index.html");
})

router.get('/setMessage', controlMessage)

router.get('/setText',setOledText);

module.exports=router;