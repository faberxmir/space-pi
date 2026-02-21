function createLedService({ data, clk, latch, logger }) {
    function pulse(line) {
        line.write(1);
        let start = Date.now();
        while (Date.now() - start < 5) {} // short delay to ensure pulse is registered (adjust as needed)
        line.write(0);
        start = Date.now();
        while (Date.now() - start < 5) {} // short delay to ensure pulse is registered (adjust as needed)
    }
    return {
        set(mask) {
        // Force to unsigned 16-bit
        const value = (Number(mask) >>> 0) & 0xffff;

        // Shift out MSB -> LSB (bit 15 down to 0)
        for (let bit = 15; bit >= 0; bit--) {
            const b = (value >> bit) & 1;
            data.write(b ? 0:1); // active low
            pulse(clk);
        }

        // Latch to outputs
        pulse(latch);

        logger?.debug?.(`[LEDS] set 0x${value.toString(16).padStart(4, "0")}`);
        },
        allOn() {
            this.set(0xffff);
        },
        allOff() {
            this.set(0);
        },
        close() {},
  };
}

module.exports = { createLedService };