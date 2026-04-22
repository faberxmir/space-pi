# Space-Pi deployment (Raspberry Pi 3B+)

## 0. Scope
What this guide covers:
- OS base + packages
- Node.js + app install
- GPIO/I2C/SPI prerequisites
- Services (systemd)
- Config files + env vars
- Verification checklist
- Known pitfalls / fixes

## 1. Hardware + wiring assumptions
- Pi model: Raspberry Pi 3B+
- OLED: 128x64 (SSD1306) on I2C or SPI: ____
- LED driver: TB62706BN (16-bit shift register)
- 16 LEDs connected: ____
- Passive piezo buzzer on GPIO: ____

## 2. OS baseline
- Image / distro: ____
- Username: ____
- Hostname scheme: space-pi-01..space-pi-15
- SSH: enabled

## 3. Required system packages
List exact apt packages we need and why.

| Package | Why |
|---|---|
| `tcpdump` | Ping detection — the app spawns tcpdump to monitor incoming ICMP echo requests |
| `libpam0g-dev` | Needed to compile the `authenticate-pam` Node native module for web login auth |

```bash
sudo apt install tcpdump libpam0g-dev
sudo setcap cap_net_raw+eip $(which tcpdump)
npm install authenticate-pam   # run from the app directory; requires libpam0g-dev
```

> `setcap` is persistent across reboots — run once after install.

## 4. Interfaces & kernel modules
### I2C
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
- config can be /boot/firmware/config.txt or /boot/config.txt, depending on your image.

### SPI (if used)
- Enable SPI: ____
- Files changed: ____

## 5. Node.js runtime
- Node version: ____
- Install method: ____
- npm ci / npm install strategy: ____

## 6. Library decisions (GPIO / OLED / buzzer)
- GPIO backend: ____
- Why we rejected alternatives: ____
- Notes on I2C lockup history: ____

## 7. App configuration
### Environment variables
- .env keys (with examples): ____

### Pins (BCM vs physical)
- Convention used: ____
- Pin manager rules: ____

## 8. Running as a service (systemd)
- Unit file location: ____
- ExecStart: ____
- User/group: ____
- Restart policy: ____

## 9. Deployment procedure (repeatable)
1)
2)
3)

## 10. Verification checklist
- OLED shows ____ on boot
- LED test pattern works
- Buzzer test works
- API routes respond
- i2cdetect output: ____

## 11. Troubleshooting
- Symptom: I2C bus freezes → Fix: ____
- Symptom: permissions/GPIO access → Fix: ____
- Symptom: service won’t start → Fix: ____