<div align="center">
  <img src="./dashboard/public/favicon.svg" alt="Logo" width="80" height="80">
  <h1 align="center">Techathon Rover Summit: The-LFD</h1>

  <p align="center">
    <strong>Lights, Fans, Discord (LFD)</strong>
    <br />
    A world-class, fully integrated smart office IoT simulation platform featuring a highly interactive React dashboard, a real-time Node.js backend, and a proactive Discord Bot.
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
    <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.io" />
    <img src="https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white" alt="Discord" />
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#-project-overview">Project Overview</a></li>
    <li><a href="#-system-design--architecture">System Design & Architecture</a></li>
    <li><a href="#-key-innovations">Key Innovations</a></li>
    <li><a href="#-getting-started">Getting Started</a></li>
    <li><a href="#-testing--validation">Testing & Validation</a></li>
    <li><a href="#-hardware-integration">Hardware Integration</a></li>
  </ol>
</details>

---

## 📖 Project Overview

For the Techathon Rover Summit, we were challenged to build a comprehensive IoT dashboard with a hardware-simulation backend and a Discord bot. We went above and beyond standard requirements to build a truly **real-time, interactive, and intelligent ecosystem**.

Instead of a generic table of switches, we built a visually stunning, spatial floor plan where physical fixtures on the ceiling animate dynamically. Instead of a bot that just answers commands, we built an intelligent agent that actively monitors energy waste and alerts the team proactively.

---

## 🏗️ System Design & Architecture

Our system is engineered as a modern, event-driven microservices architecture. It is designed to be highly decoupled, perfectly synchronizing the UI, the Bot, and the Backend in real-time.

### Architectural Diagram

```mermaid
graph TD
    subgraph Discord Ecosystem
        DB[Discord.js Bot Server]
        DC[Discord Guild Channels]
    end

    subgraph Node.js Backend Service
        API[Express REST API]
        WS[Socket.IO Pub/Sub Server]
        SIM[IoT Device Simulator]
        ALT[Alerts Engine]
        DB_Mock[(In-Memory State & Usage Store)]
    end

    subgraph React Client Application
        UI[Vite React Dashboard]
    end

    %% Bot Connections
    DC <-->|Discord JS API| DB
    DB -->|GET /devices, /usage| API
    DB <-->|Proactive Polling (Every 10s)| API

    %% UI Connections
    UI <-->|WebSockets (Live Sync)| WS
    UI -->|POST /devices/override| API

    %% Internal Backend
    API <--> DB_Mock
    SIM -->|Updates State (Tick)| DB_Mock
    SIM -->|Triggers Broadcast| WS
    ALT -->|Validates State| DB_Mock
    ALT -->|Pushes Alerts| WS
```

### Design Decisions & Patterns
1. **Event-Driven Synchronization**: The `Node.js` backend acts as the single source of truth. Rather than the React client polling for data, the backend utilizes a `Socket.io` Pub/Sub model to push state changes (`device-update`, `usageUpdate`, `alertsUpdate`) instantly to all connected clients.
2. **Stateless REST Fallbacks**: While WebSockets handle real-time streaming, intentional state mutations (like a user clicking a light switch) are handled via a stateless REST API (`POST /devices/override`). This ensures predictable transactional behavior.
3. **Decoupled Discord Polling**: The Discord bot operates completely independently. It uses a lightweight polling mechanism against the backend REST APIs to guarantee it never misses an alert, even if the bot is restarted independently of the backend.

---

## 🌟 Key Innovations

1. **Interactive Spatial UI**: We abandoned standard data grids. Using CSS Grid and absolute positioning, we overlaid interactive SVG components (spinning wooden fans, glowing bulbs) directly onto an office floor plan. The UI feels like a smart-home control panel from the future.
2. **Live Energy Accumulation**: Energy tracking isn't mocked. The backend simulator recalculates instantaneous wattage every 5 seconds, accurately accumulating real Kilowatt-hour (kWh) load over time and streaming it to the dashboard's circular gauge.
3. **Proactive Energy Monitoring**: The Alert Engine validates the timestamps of all active devices against business logic (e.g., detecting devices left on for >2 hours, or active outside 9 AM - 5 PM). The Discord bot detects these anomalies and instantly pushes formatted embeds to an alert channel.

---

## 🚀 Getting Started

To run the full stack locally, you will need **three separate terminal windows** open (one for each service).

### 1. The Backend Service
The backend is the brain of the operation, managing the simulator and alert engine.
```bash
cd backend
npm install
npm run dev
```
- **Port**: `http://localhost:4000`

### 2. The Frontend Dashboard
The React dashboard visualizes the office state with live SVG animations.
1. Create a `.env` file in the `dashboard` directory:
   ```env
   VITE_BACKEND_URL=http://localhost:4000
   ```
2. Start the application:
   ```bash
   cd dashboard
   npm install
   npm run dev
   ```
- **Port**: `http://localhost:5173`

### 3. The Discord Bot
The bot allows users to query office status and sends proactive warnings for energy waste.
1. Create a `.env` file in the `bot` directory with your real Discord credentials:
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   DISCORD_ALERT_CHANNEL_ID=your_discord_channel_id_here
   BACKEND_URL=http://localhost:4000
   ```
2. Start the bot:
   ```bash
   cd bot
   npm install
   node index.js
   ```

---

## 🧪 Testing & Validation

We prioritize reliability. The complex time-based logic inside the Alerts Engine is fully covered by native Node.js unit tests.

To run the test suite:
```bash
cd backend
node --test ../services/alerts.test.js
```

---

## 🔌 Hardware Integration

While this repository contains the software simulation and control surfaces, the system is designed to seamlessly integrate with real-world IoT hardware.

Please see our **[Hardware Circuit Schematic Diagram](docs/circuit_schematic.md)** for detailed documentation on how the Node.js backend interfaces with an ESP32 microcontroller and a 4-channel relay board to safely control physical mains-powered office fixtures.

---
<div align="center">
  <p>Built with ❤️ for the Techathon Rover Summit</p>
</div>
