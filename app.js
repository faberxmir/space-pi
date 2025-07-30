require('dotenv').config();
require('./controllers/pi_controller');

const express= require('express');
const app = express();

const router = require('./routers/default_router');

app.use(express.static('public'));
app.use(router);

const PORT = process.env.PORT;
app.listen(PORT, ()=> {
    console.info(`${process.env.APPNAME} is running!`);
})