# Individual Contributions Record

This document outlines the specific features, components, and integrations implemented by this specific contributor during the hackathon. It is designed to help the team track who completed which parts of the project.

---

## 🎨 Frontend & UI/UX Development
- **Spatial Floor Plan Implementation**: 
  - Designed and built the visual `OfficeFloorPlan.jsx` overlay system.
  - Successfully aligned the CSS Grid coordinates so that interactive UI elements sit perfectly on top of the static architectural background image.
  - Resolved global viewport overflow issues to ensure the dashboard scrolls naturally at 100% zoom without clipping.
- **Custom SVG Animations**: 
  - Built a custom, realistic 3-blade wooden ceiling fan SVG that physically rotates when toggled on.
  - Built a custom lightbulb SVG that emits a glowing radial halo when activated, turning completely transparent when off to blend into the background.
- **Dashboard Cleanup**: Removed the hardcoded/fake Discord mock panel from the UI to ensure the dashboard only represents fully functional, live features.

## 🧠 Backend & API Integration
- **Live Energy Tracking (kWh)**: 
  - Wrote the `usageStore.js` module in the backend to accumulate true Kilowatt-hours (kWh) based on instantaneous wattage over the 5-second simulator ticks.
  - Exposed this new accumulated data through the `/usage` REST endpoint.
- **WebSocket Re-Wiring**: 
  - Merged the new `origin/backend` code into `main` and fully rewired the React frontend (`App.jsx`) to connect to the live backend WebSocket server on port 4000.
  - Mapped the backend's new ID schema (e.g., `drawing-fan-1`) to the frontend SVG icons so they render correctly.

## 🤖 Discord Bot Development
- **REST API Integration**: 
  - Rewrote the skeleton `bot/index.js` file to use native `fetch` to query the live backend server.
  - Secured the bot by extracting URLs and Tokens into environment variables (`.env`).
- **Humanized Embed Responses**: 
  - Built highly polished Discord Embeds (`EmbedBuilder`) for the `!status`, `!room`, and `!usage` commands to format the raw JSON data into beautiful, readable reports.
- **Proactive Alert Engine**: 
  - Engineered an automated polling interval inside the Discord Bot that securely checks the backend for active alerts every 10 seconds.
  - Implemented deduplication logic (using a `Set`) so the bot only pushes *new* `OVERTIME` and `AFTER_HOURS` energy waste warnings directly to a designated Discord channel.

## 📝 Architecture & Documentation
- **System Architecture**: Designed the Mermaid JS system flow diagram detailing the microservice interactions.
- **Circuit Schematic**: Authored the `circuit_schematic.md` detailing the ESP32 and Relay board mains-power logic.
- **Unit Testing**: Wrote the native Node.js tests (`alerts.test.js`) to validate the complex time-based alert engine.
