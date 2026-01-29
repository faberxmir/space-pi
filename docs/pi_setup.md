## I²C clock speed (100 kHz vs 400 kHz) – OLED performance note

### Files involved

On Raspberry Pi 3B+, the I²C bus configuration is controlled by firmware settings.

Relevant file:

- `/boot/firmware/config.txt`  
  (note: `/boot/config.txt` is deprecated on newer Raspberry Pi OS releases)

Relevant settings in that file:

- `dtparam=i2c_arm=on`  
  Enables the primary I²C bus (`/dev/i2c-1`).

- `dtparam=i2c_arm_baudrate=400000`  
  Overrides the default I²C clock speed.

No other system files were modified.  
The kernel driver in use is `i2c_bcm2835`, which does **not** expose the baudrate via `/sys`; configuration is firmware-only.

---

### 100 kHz vs 400 kHz – why this matters

Raspberry Pi defaults the I²C bus to **100 kHz**.  
While this is sufficient for sensors and low-bandwidth devices, it is a major bottleneck for OLED displays such as SSD1306 when doing full-frame updates.

An SSD1306 display is 128×64 pixels (1024 bytes per frame).  
At 100 kHz, the effective throughput limits practical refresh rates to only a few frames per second. In practice, this resulted in:

- very slow animations
- OLED updates appearing to “block” application startup
- misleading timing measurements unless the event loop was allowed to yield

Increasing the I²C clock to **400 kHz** (I²C Fast Mode):

- does not change application logic
- does not change OLED driver code
- significantly increases effective display refresh rate
- reduced full-screen redraw time by ~4× in observed tests

This change made OLED startup animations and runtime updates behave as expected, and resolved the perceived “delay explosion” when using `await`-based timing.

---

### Summary

- Default I²C speed (100 kHz) is a hidden performance limiter for OLEDs
- OLED full-frame updates are I/O-bound, not CPU-bound
- 400 kHz is within SSD1306 specifications and works reliably
- The issue manifests only when the event loop yields (e.g. `await setTimeout`)
- The fix is purely firmware-level and easy to forget without documentation