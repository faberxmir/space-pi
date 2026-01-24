// Check if running on a Raspberry Pi
const os = require('os');
const isRaspberryPi = os.platform() === 'linux' && os.arch() === 'arm64';



module.exports=(app) => {
    if(isRaspberryPi){
        const ledRoutes = require('../routers/led_routes');
        app.use('/led', ledRoutes);
        console.info("Raspberry Pi detected. Initializing Pi-specific handlers.");
    } else {
        console.warn("Not running on a Raspberry Pi. Startup limited to non-Pi functionality.");
    }
}