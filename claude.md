# space-pi

Interactive spaceship controller for 2ITA wargames, running on a Raspberry Pi 3B+.
Students connect over LAN and control hardware (LEDs, OLED display, buzzer) via HTTP.

## Active vs legacy code

- **`src/`** — active codebase. All new work goes here.
- `controllers/`, `handlers/`, `routers/` — legacy directories being phased out. Do not add code here.

## Architecture: bootstrap phases + lifecycle

The app boots through sequential phases defined in `src/bootstrap/phases/`.
Each phase receives a shared `context` object, attaches its service to it, and registers a shutdown closer.

Rules when adding a new service:
1. Create a phase file in `src/bootstrap/phases/`
2. Attach the service to `context` (e.g. `context.myService = ...`)
3. Register a lifecycle closer: `context.lifecycle.register("name", () => service.close())`
4. Call the phase from `src/bootstrap/index.js` in the correct order
5. Lifecycle closers run in LIFO order — register GPIO/platform resources first so they close last

## Pin configuration

All GPIO pin numbers use BCM numbering and are defined in `.env`:

```
PIN_TB_CLK=27
PIN_TB_LATCH=22
PIN_TB_DATA=17
PIN_BUZZER=18
```

Never hardcode pin numbers. Add new pins to `.env` and resolve them via `src/platform/pins.js`.

`ACTIVE_BYTES` is a 16-bit bitmask controlling which TB62706BN outputs are active. Only change this if the hardware wiring changes.

## Hardware deployment requirements

The app only runs fully on the Raspberry Pi. Before deploying:

1. `pigpiod` must be running (required for buzzer PWM): `sudo pigpiod`
2. I2C baudrate must be set to 400 kHz for acceptable OLED performance.
   Add to `/boot/firmware/config.txt` (or `/boot/config.txt` on older Pi OS):
   ```
   dtparam=i2c_arm_baudrate=400000
   ```

See `docs/pi-deploy.md` for the full deployment checklist.

## code standards
- avoid magic numbers. Use config/.env when needed
- always use plan mode before changing code.
- work on the main branch.
- css is always kept in a file of its own. 
   - CSS common to all files are kept in main.css
   - css for [pagename].html are kept in [pagename].css

## web server
- each time we add routes for the API, also update the webpage documenting the routes.