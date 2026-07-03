# Hardware Circuit Schematic

This document outlines the high-level physical hardware setup for the Lights, Fans, Discord (LFD) project, representing how the backend interfaces with physical IoT components.

## Relay Control Logic

```mermaid
graph LR
    %% Hardware Components
    MCU[Microcontroller <br/> ESP32 / Arduino]
    RelayBoard[4-Channel Relay Module]
    Power[Mains AC Power Supply]
    
    %% Output Devices
    Fan1((Drawing Fan))
    Fan2((Work Room Fan))
    Light1((Drawing Light))
    Light2((Work Room Light))

    %% Connections
    MCU -- "GPIO 1 (Digital OUT)" --> RelayBoard
    MCU -- "GPIO 2 (Digital OUT)" --> RelayBoard
    MCU -- "GPIO 3 (Digital OUT)" --> RelayBoard
    MCU -- "GPIO 4 (Digital OUT)" --> RelayBoard
    
    Power -- "Live Wire (L)" --> RelayBoard
    
    RelayBoard -- "Switched Live (CH1)" --> Fan1
    RelayBoard -- "Switched Live (CH2)" --> Fan2
    RelayBoard -- "Switched Live (CH3)" --> Light1
    RelayBoard -- "Switched Live (CH4)" --> Light2
    
    Fan1 -- "Neutral (N)" --> Power
    Fan2 -- "Neutral (N)" --> Power
    Light1 -- "Neutral (N)" --> Power
    Light2 -- "Neutral (N)" --> Power
    
    %% Styling
    classDef mcu fill:#3b82f6,stroke:#1e40af,color:white;
    classDef relay fill:#ef4444,stroke:#991b1b,color:white;
    classDef device fill:#10b981,stroke:#047857,color:white;
    classDef power fill:#f59e0b,stroke:#b45309,color:white;
    
    class MCU mcu;
    class RelayBoard relay;
    class Fan1,Fan2,Light1,Light2 device;
    class Power power;
```

### Components List
1. **Microcontroller**: An ESP32 or Arduino board that receives commands from the Node.js backend (via Serial, MQTT, or HTTP).
2. **Relay Module**: A standard 5V multi-channel relay module. The MCU uses 3.3V/5V logic to trigger the optocouplers on the relay board.
3. **Mains Power**: 120V/240V AC supply. **(Warning: Ensure proper isolation and safety protocols when working with mains voltage).**
4. **Appliances**: The physical ceiling fans and light bulbs representing the office fixtures.

### Data Flow
1. User clicks the "Toggle" switch on the React Dashboard.
2. Dashboard sends a `POST /devices/override` request to the Node.js backend.
3. Backend updates the database state and emits a command to the ESP32 (e.g., via a connected Serial port or local Wi-Fi API).
4. The ESP32 pulls the corresponding GPIO pin HIGH or LOW.
5. The Relay clicks, closing or opening the circuit for that specific appliance.
