require('dotenv').config();

const express= require('express');
const app = express();
const defaultRoutes = require('./routers/default_routes');
require('./handlers/pi_setup');

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use('/', defaultRoutes);


const PORT = process.env.PORT;

app.listen(PORT, ()=> {
    console.info(`${process.env.APPNAME} is running on port ${PORT}`);
    console.info(`Mode: ${process.env.PRODUCTION?'Development':'Production'}`); 
});