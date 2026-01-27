// Check if running on a Raspberry Pi and do setup that is specific to Raspberry Pi hardware
const os = require('os');
const isRaspberryPi = os.platform() === 'linux' && os.arch().startsWith('arm');
console.info(`\n=== ${process.env.APPNAME} Pi Setup Handler ===`);
console.info(`OS Platform: ${os.platform()}, Architecture: ${os.arch()}\nRaspberry Pi detected: ${isRaspberryPi}`);
const oledHandler = require('../handlers/oled_handler');
//const buzzerHandler = require('../handlers/buzzer_handler');


module.exports=async (app) => {
    if(isRaspberryPi){
        console.info("Initializing Pi-dependent handlers and adding pi-dependent routes...");
        console.log('network interfaces ' + os.networkInterfaces());
        try {
            await oledHandler.oledInit();
            app.use('/oled', require('../routers/oled_routes'));
            console.info("/oled routes added.");
        } catch (err) {
            console.error(Date.now(), '[PI_SETUP]', err.message);
            if(process.env.PRODUCTION){
                throw new Error('OLED initialization failed in production mode. Aborting startup.');
            } else {
                console.warn('Continuing in development mode despite OLED initialization failure.');
            }
        }
        app.use('/led', require('../routers/led_routes'));
        console.info("/led routes added.");



    } else {
        console.warn("Not running on a Raspberry Pi. Startup limited to non-Pi functionality.");
    }
}