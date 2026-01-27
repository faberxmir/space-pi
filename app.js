require('dotenv').config();

const express= require('express');
const app = express();
const defaultRoutes = require('./routers/default_routes');
const pi_setup = require('./handlers/pi_setup');

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use('/', defaultRoutes);

try {
    pi_setup(app);
} catch (err) {
    console.error(Date.now(), '[APP] Fatal error during Pi setup:', err.message);
    process.exit(1);
}


const PORT = process.env.PORT;

app.listen(PORT, ()=> {
    console.info(`${process.env.APPNAME} is running on port ${PORT}`);
    console.info(`Mode: ${process.env.PRODUCTION?'Development':'Production'}`); 
});