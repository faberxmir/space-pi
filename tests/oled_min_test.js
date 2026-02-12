require("dotenv").config();

const {createOledService} = require("../src/services/oled/index");

(async () => {
    console.log('Starting OLED minimal test');
    const oled = createOledService({
        i2cBusNumber: 1,
        address: 0x3c,
        logger: console,
        height: 64,
        width: 128,
    });

    await oled.init();


    oled.phase("TEST_PHASE");
    oled.write("Hello, OLED!", "Line 2", "Line 3");

    setTimeout(() => {
        oled.close();
        console.log("OLED test completed");
    }, 5000);

})().catch(e => {
    console.error("OLED test failed:", e);
    oled?.shutdown?.();
    process.exit(1);
});