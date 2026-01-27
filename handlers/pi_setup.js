// Check if running on a Raspberry Pi and do setup that is specific to Raspberry Pi hardware
const os = require('os');
const isRaspberryPi = os.platform() === 'linux' && os.arch().startsWith('arm');
console.info(`\n=== ${process.env.APPNAME} Pi Setup Handler ===`);
console.info(`OS Platform: ${os.platform()}, Architecture: ${os.arch()}\nRaspberry Pi detected: ${isRaspberryPi}`);

module.exports=(app) => {
    if(isRaspberryPi){
        console.info("Initializing Pi-dependent handlers and adding pi-dependent routes...");
        app.use('/led', require('../routers/led_routes'));
        console.info("/led routes added.");

        try {
            app.use('/oled', require('../routers/oled_routes'));
            console.info("/oled routes added.");
        } catch (err) {
            console.error(Date.now(), '[PI_SETUP]', err.message);
        }


    } else {
        console.warn("Not running on a Raspberry Pi. Startup limited to non-Pi functionality.");
    }
}