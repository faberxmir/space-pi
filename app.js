require('dotenv').config();
require('./handlers/oled_handler');

const express= require('express');
const app = express();

const html_router = require('./routers/default_router');
const led_router = require('./routers/light_routes');

app.use(express.static('public'));
app.use(led_router);
app.use(html_router);

const PORT = process.env.PORT;

app.listen(PORT, ()=> {
    console.info(`${process.env.APPNAME} is running!`);
})