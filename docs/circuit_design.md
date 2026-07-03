# ESP32 Circuit Design & Wiring Semantics (Work Room 1)

This document provides the complete hardware wiring blueprint, pin mapping tables, and electrical design specifications for the **Work Room 1** monitoring microcontroller (ESP32).

---

## 🔌 1. Microcontroller Pin Mapping Table

The ESP32 DevKit V1 serves as the central control unit. Below is the mapping of ESP32 GPIO pins to the respective relays, indicator LEDs, sensor modules, and user interfaces.

| Peripheral Device | Pin Type | ESP32 GPIO Pin | Connection Destination / Function |
| :--- | :--- | :--- | :--- |
| **Relay 1 (Fan 1)** | Digital Output | `GPIO 16` | Input (IN) pin on Relay Module 1 |
| **Relay 2 (Fan 2)** | Digital Output | `GPIO 17` | Input (IN) pin on Relay Module 2 |
| **Relay 3 (Light 1)** | Digital Output | `GPIO 18` | Input (IN) pin on Relay Module 3 |
| **Relay 4 (Light 2)** | Digital Output | `GPIO 19` | Input (IN) pin on Relay Module 4 |
| **Relay 5 (Light 3)** | Digital Output | `GPIO 21` | Input (IN) pin on Relay Module 5 |
| **LED 1 (Fan 1 Status)** | Digital Output | `GPIO 22` | Anode of Red LED 1 (via 220Ω resistor) |
| **LED 2 (Fan 2 Status)** | Digital Output | `GPIO 23` | Anode of Red LED 2 (via 220Ω resistor) |
| **LED 3 (Light 1 Status)** | Digital Output | `GPIO 25` | Anode of Red LED 3 (via 220Ω resistor) |
| **LED 4 (Light 2 Status)** | Digital Output | `GPIO 26` | Anode of Red LED 4 (via 220Ω resistor) |
| **LED 5 (Light 3 Status)** | Digital Output | `GPIO 27` | Anode of Red LED 5 (via 220Ω resistor) |
| **INA219 SDA (I2C Data)** | Bidirectional | `GPIO 4` | SDA pin on INA219 current sensor board |
| **INA219 SCL (I2C Clock)** | Digital Output | `GPIO 5` | SCL pin on INA219 current sensor board |
| **Potentiometer Signal** | Analog Input | `GPIO 34` | Wiper/Signal (SIG) pin of the Potentiometer |
| **Pushbutton Switch** | Digital Input | `GPIO 32` | Button terminal (using internal `INPUT_PULLUP`) |

---

## ⚡ 2. Detailed Wiring Connection List

### A. Power Rails
- Connect `ESP32 VIN` (5V external/USB power) to the `VCC` rail of all 5 Relay modules.
- Connect `ESP32 3V3` to the `VCC` pin of the INA219 sensor module and the outer terminal of the Potentiometer.
- Connect `ESP32 GND` to the common ground rail (connects to GND of all relays, LEDs, INA219, potentiometer, and pushbutton).

### B. Relays and Status Indicators
- **Relays 1-5**: 
  - VCC to `5V` (VIN), GND to `GND`.
  - IN1-IN5 connected to GPIOs `16`, `17`, `18`, `19`, `21` respectively.
  - *Note: Relay inputs are active-low; sending a LOW signal energizes the relay.*
- **LEDs 1-5**:
  - Connect GPIOs `22`, `23`, `25`, `26`, `27` to a `220Ω` resistor in series with the anode of each LED.
  - Connect all LED cathodes to common `GND`.

### C. I2C Bus (INA219 Power Monitor)
- Connect `SDA` to GPIO `4`, `SCL` to GPIO `5`.
- Connect VCC to `3.3V`, GND to `GND`.
- **Sense Terminals**:
  - Connect `3.3V` to a `220Ω` load resistor.
  - Connect the other side of the load resistor to `VIN+` of INA219.
  - Connect `VIN-` of INA219 to common `GND`.

### D. User Interface Controls
- **Potentiometer**: Connect one outer pin to `3.3V`, the other outer pin to `GND`, and the center signal pin to GPIO `34`.
- **Pushbutton**: Connect one terminal to GPIO `32`, and the opposite terminal to common `GND`.

---

## 🧠 3. Electrical & Architectural Reasoning

### Safe Relay Isolation
Microcontroller GPIOs cannot drive heavy inductive/resistive loads directly. The 5V electromagnetic relay modules are used to safely switch 220V AC mains loads (fans and lights). The relays isolate the low-power DC control circuit (ESP32) from the high-power AC circuit, preventing noise or back-EMF from damaging the chip.

### Current Limiting Resistors
Status LEDs are paired with `220Ω` current-limiting resistors. At 3.3V operating voltage with a standard forward voltage drop of ~2.0V for red LEDs, this maintains current at safe levels:
$$I = \frac{3.3V - 2.0V}{220\Omega} \approx 5.9\text{ mA}$$
This keeps the total current drawn from the ESP32 pins well within the GPIO limit of 12mA.

### Debounced Pushbutton
The pushbutton is mapped with the ESP32's internal pull-up resistor enabled (`INPUT_PULLUP`), eliminating the need for an external resistor. Software debouncing of 50ms is implemented in the firmware to filter out transient electric contact bouncing when the button is pressed.

### INA219 I2C Current Sensor
The INA219 measures high-side shunt voltage and bus supply voltage over an I2C interface. In `DEMO_MODE=true` (simulated load mode), the potentiometer simulates a load so that changing its position alters the synthetic reported current. When `DEMO_MODE=false`, the INA219 measures the real physical current passing through the shunt resistor, allowing precise calculations of the total office power consumption.
