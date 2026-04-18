# SpacePi Parts and Connections

This document lists the known hardware parts in the SpacePi project and how they are connected.

## 1. Core controller

### Raspberry Pi 3B+
The Raspberry Pi 3B+ is the main controller in the project.

It is responsible for:
- running the Node.js application
- exposing the API / web server
- controlling GPIO
- talking to the OLED over I²C
- controlling the LED chain through the shift register
- generating buzzer output

---

## 2. Display

### 128x64 OLED display
The display is an SSD1306-based OLED connected over I²C.

Known details:
- resolution: 128x64
- interface: I²C
- I²C bus: `/dev/i2c-1`
- I²C address: `0x3C`

### Connection
The OLED is connected to the Raspberry Pi I²C bus:
- SDA -> Raspberry Pi SDA
- SCL -> Raspberry Pi SCL
- VCC -> power
- GND -> ground

The exact physical pin numbers are not listed here, but the device is confirmed to be on the Pi's primary I²C bus.

---

## 3. LED driver chain

### TB62706BN 16-bit shift register / LED driver
This chip is used to control multiple LEDs while using only a few GPIO pins on the Raspberry Pi.

Known details:
- model: **TB62706BN**
- width: **16-bit**
- currently used outputs: **9 LEDs are in use**

### GPIO signals used for the LED chain
From your current setup:
- **BCM17** -> clock
- **BCM27** -> latch
- **BCM22** -> data

Environment variable mapping used in the project:
- `PIN_TB_CLK=17`
- `PIN_TB_LATCH=27`
- `PIN_TB_DATA=22`

### Connection overview
The Raspberry Pi sends serial data into the TB62706BN using 3 transistors that controls current to:
- Data
- Clock
- Latch

---

## 4. LEDs

### LED bank
The project uses 9 LEDs even though the driver can support more outputs.

Known behavior:
- the outputs are treated as **active-low** in software
- this means a low output state turns the LED path on

### Connection overview
The LEDs are not driven directly by the Raspberry Pi. Instead, they are driven through:
1. the TB62706BN driver
3. the LEDs themselves

This means the Pi is only handling logic control, while the LED switching happens further down the chain.

---

## 5. Transistor stage

### Transistors (Model BC547)
The project includes transistors in the LED chain.

What is known:
- the transistor stage sits between the TB62706BN and the PI
- it is acting as a switching stage
- it is used to control Voltage to the TB CLK/LATCH/DATA inputs
(this was necessary because supplying it directly from the PI sometimes gave to low V)

### connection pattern
The most likely arrangement is:

In simple terms:
- the pi control the transistors
- the transistors control V to DIN/LATCH/DATA

---

## 6. Buzzer

### Passive piezo buzzer
The project uses a passive piezo buzzer.

Known details:
- type: passive buzzer
- control method: PWM / frequency output
- GPIO pin: **BCM18**

Environment variable mapping:
- `PIN_BUZZER=18`

### Connection overview
The buzzer is connected to the Raspberry Pi on BCM18.

Basic path:

```text
Raspberry Pi BCM18 -> buzzer
```

Because it is a passive buzzer, the Pi does not just switch it on and off. Instead, it drives it with a frequency to produce tones.

---

## 7. Software-to-hardware mapping

Although this is a hardware document, these software pieces are tightly tied to the hardware and explain how the connections are used.

### OLED communication
- `i2c-bus`
- `oled-i2c-bus`

### GPIO for LED driver chain
- originally based on `array-gpio`
- later moved to **node-libgpiod** for stable GPIO control

### Buzzer control
- **pigpio / pigpio-client** for PWM on BCM18

---

## 8. Known pin summary

### Raspberry Pi pin usage in the project
- **BCM17** -> TB62706BN clock
- **BCM27** -> TB62706BN latch
- **BCM22** -> TB62706BN data
- **BCM18** -> passive buzzer
- **I²C bus 1** -> OLED display at `0x3C`

---

## 9. High-level system map

```text
Raspberry Pi 3B+
├── I²C bus 1
│   └── SSD1306 OLED display (0x3C)
├── BCM17
│   └── TB62706BN CLOCK
├── BCM27
│   └── TB62706BN LATCH
├── BCM22
│   └── TB62706BN DATA
│       └── transistor stage
│           └── 9 LEDs
└── BCM18
    └── passive piezo buzzer
```

---

## 11. Short version

SpacePi currently consists of:
- Raspberry Pi 3B+
- 128x64 SSD1306 OLED display on I²C (`0x3C`)
- TB62706BN 16-bit LED driver / shift register
- 9 LEDs
- passive piezo buzzer on BCM18
