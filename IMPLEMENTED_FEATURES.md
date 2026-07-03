# 🚀 Implemented Features & Development Log

This document serves as a detailed record of exactly what was built, integrated, and implemented for the **Lights, Fans, Discord (LFD)** project.

---

## 1. 🎨 The Frontend Dashboard (React & Vite)
Instead of building a simple table of switches, we pushed the boundaries of UX to create a highly visual, spatial UI.

### What Was Implemented
- **Interactive Floor Plan**: Created `OfficeFloorPlan.jsx`, an interactive component mapping over an actual architectural floor plan image.
- **Custom SVG Animations**: 
  - Designed custom React SVG components (`DeviceIcon.jsx`) to represent ceiling fans and lights.
  - Implemented CSS animations so that fans physically rotate and lights emit a glowing radial halo when their status is set to `on`.
- **Absolute Positioning Engine**: Used CSS Grid and absolute percentages to precisely anchor dynamic icons over the pre-drawn fixtures in the floor plan.
- **Power Consumption Meter**: Built a dynamic, circular UI gauge that reflects instantaneous power draw, supported by a per-room visual bar chart.
- **WebSocket Integration**: Connected the React app to the backend using `socket.io-client`, ensuring the dashboard reacts to hardware changes in real-time.

---

## 2. 🧠 The Backend Ecosystem (Node.js & Express)
The backend acts as the single source of truth, simulating an active IoT environment and calculating load.

### What Was Implemented
- **Device Simulator**: Developed an automated event loop (`simulator.js`) that randomly toggles the state of a device every 5 seconds, allowing the UI to test live updates naturally.
- **Live Energy Accumulation**: Implemented `usageStore.js` to constantly calculate energy consumption. Every 5 seconds, the server calculates `(currentWatts * 5 seconds) / 3600000` to accrue an accurate `totalKWh` value over time.
- **Intelligent Alert Engine**: Built `alerts.js` with business logic to flag energy waste:
  1. **OVERTIME**: Detects if a device has been running continuously for more than 2 hours.
  2. **AFTER_HOURS**: Detects if a device is active outside of standard office hours (9:00 AM - 5:00 PM).
- **Pub/Sub WebSockets**: Bound the simulator and alert engine to Socket.io, emitting `device-update`, `usageUpdate`, and `alertsUpdate` events instantly to all clients.
- **REST Fallbacks**: Exposed `GET /devices`, `GET /devices/:room`, `GET /usage`, and `POST /devices/override` for deterministic queries and control.

---

## 3. 🤖 The Proactive Discord Bot (Discord.js)
We evolved the Discord bot from a static command responder into an intelligent, proactive agent.

### What Was Implemented
- **API Fetch Integration**: Updated `bot/index.js` to utilize native Node 18 `fetch` to securely query the backend REST endpoints (`/devices`, `/usage`, `/devices/:room`).
- **Humanized Embed Responses**: Replaced simple text replies with `EmbedBuilder`.
  - `!status` returns a beautiful panel detailing Active vs Inactive devices and total load.
  - `!room <name>` returns an encoded query, gracefully handling typos and returning formatted room breakdowns.
  - `!usage` surfaces both instantaneous wattage and the accumulated `totalKWh` energy load.
- **Proactive Alert Polling**: Implemented a standalone interval inside the bot that securely polls `GET /alerts` every 10 seconds.
- **Automated Discord Warnings**: If the bot detects a *new* alert ID (utilizing a `Set` to prevent spam), it instantly pushes a highly visible, color-coded warning embed to a designated Discord channel.

---

## 4. ⚙️ Configuration & Testing
To ensure the project is easily deployable and reliable.

### What Was Implemented
- **Environment Variables**: Stripped out hardcoded `localhost` URLs. Implemented `.env` variables (`VITE_BACKEND_URL`, `BACKEND_URL`, `DISCORD_TOKEN`) across the Dashboard and Bot.
- **Unit Testing**: Wrote a native Node.js test suite (`services/alerts.test.js`) leveraging `node:test` and `node:assert` to rigidly verify that the time-based `OVERTIME` logic functions flawlessly without relying on manual observation.
- **Documentation**: Generated world-class `README.md` documentation complete with Mermaid JS system architecture diagrams, and a dedicated `circuit_schematic.md` detailing the physical hardware relay logic.
