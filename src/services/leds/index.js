function createLedService({ data, clk, latch, logger }) {
    function pulse(line) {
        line.write(1);
        line.write(0);
    }
    return {
        set(mask) {
        // Force to unsigned 16-bit
        const value = (Number(mask) >>> 0) & 0xffff;

        // Shift out MSB -> LSB (bit 15 down to 0)
        for (let bit = 15; bit >= 0; bit--) {
            const b = (value >> bit) & 1;
            data.write(b);
            pulse(clk);
        }

        // Latch to outputs
        pulse(latch);

        logger?.debug?.(`[LEDS] set 0x${value.toString(16).padStart(4, "0")}`);
        },
        close() {},
  };
}

module.exports = { createLedService };