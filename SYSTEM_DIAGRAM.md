# The-LFD System Architecture

This diagram illustrates the full, event-driven microservices architecture of the **Lights, Fans, Discord (LFD)** platform. It shows how the Frontend, Backend, Discord Bot, and physical Hardware (ESP32) integrate in real-time.

```mermaid
flowchart TD
    %% Define Styles
    classDef frontend fill:#61DAFB,stroke:#282C34,stroke-width:2px,color:black
    classDef backend fill:#43853D,stroke:#333,stroke-width:2px,color:white
    classDef discord fill:#7289DA,stroke:#333,stroke-width:2px,color:white
    classDef hardware fill:#E44D26,stroke:#333,stroke-width:2px,color:white
    classDef database fill:#f9f,stroke:#333,stroke-width:2px,color:black

    subgraph Client [React Client Application]
        Dash[Vite React Dashboard]:::frontend
    end

    subgraph DiscordEcosystem [Discord Ecosystem]
        Bot[Discord.js Bot Server]:::discord
        Channel[Discord Guild Channels]:::discord
        Channel <-->|Discord API| Bot
    end

    subgraph BackendService [Node.js Backend Service]
        API[Express REST API]:::backend
        WS[Socket.IO Pub/Sub Server]:::backend
        Sim[IoT Device Simulator]:::backend
        Alerts[Alerts Engine]:::backend
        State[(In-Memory State)]:::database
        
        API <--> State
        WS <--> State
        Sim --> State
        Alerts --> State
    end

    subgraph HardwareNetwork [Hardware Integration]
        ESP32[ESP32 Microcontroller]:::hardware
        Relays[Sensors & Relays]:::hardware
        ESP32 <--> Relays
    end

    %% Cross-service connections
    Bot <-->|Polls /devices\nPushes Alerts| API
    Dash <-->|WebSocket Real-time Sync| WS
    Dash <-->|POST /devices/override| API
    ESP32 -->|HTTP POST /api/devices/report| API
```

## Key Components:

1. **React Client**: Renders the spatial SVG dashboard and receives real-time state updates via WebSockets. Sends manual override commands via REST.
2. **Node.js Backend**: The central source of truth. It holds the in-memory state, runs the background anomaly detection (Alerts Engine), and broadcasts changes to all connected clients.
3. **Discord Bot**: Runs independently, polling the backend for alerts and anomalies, and pushing notifications directly to the Discord channel.
4. **Hardware (ESP32)**: The physical layer that reads sensor data (INA219) and controls relays, reporting its status periodically to the backend via HTTP POST requests.
