// Check if running on a Raspberry Pi and do setup that is specific to Raspberry Pi hardware
const os = require('os');
const isRaspberryPi = os.platform() === 'linux' && os.arch().startsWith === 'arm';



module.exports=(app) => {
    if(isRaspberryPi){
        console.info("Raspberry Pi detected. Initializing Pi-specific handlers.");
        app.use('/led', require('../routers/led_routes'));
        
        try {
            const oled = require('../handlers/oled_handler');
            if(oled.init()) {
                console.info("OLED handler initialized successfully.");
                app.use('/oled', require('../routers/oled_routes'));
            }
        } catch (err) {
            console.error(Date.now(), '[PI_SETUP] Failed to initialize OLED handler:', err.message);
        }


    } else {
        console.warn("Not running on a Raspberry Pi. Startup limited to non-Pi functionality.");
    }
}