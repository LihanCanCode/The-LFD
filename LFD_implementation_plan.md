# "Lights, Fans, Discord" (LFD) - Hackathon Implementation Plan

This document outlines a highly optimized 12-hour workflow tailored for a 4-person team. It divides responsibilities to maximize parallel development, ensuring all deliverables (Backend, Dashboard, Discord Bot, Circuit, and Documentation) are completed efficiently.

## 👥 Team Roles & Responsibilities

To avoid merge conflicts and blocked work, tasks are divided into four distinct streams.

| Role | Name / Assignee | Primary Focus |
| :--- | :--- | :--- |
| **Member 1 (Backend)** | *Assignee 1* | Node.js/Express REST API, WebSocket server, device simulator, alert logic. |
| **Member 2 (Frontend)** | *Assignee 2* | Web Dashboard (React/Vite), live device grid, power meter, alert panels. |
| **Member 3 (Bot Dev)** | *Assignee 3* | Discord Bot (discord.js), REST API consumption, conversational responses. |
| **Member 4 (Docs/Hardware)** | *Assignee 4* | System architecture, Wokwi circuit schematic, UX polish, final video demo. |

---

## 🛠️ Tech Stack Lock-in
*   **Backend**: Node.js + Express + Socket.IO (Fastest setup for REST + WS).
*   **Frontend**: React (via Vite) + Vanilla CSS/Tailwind (Focus on aesthetic UI).
*   **Discord Bot**: Node.js + discord.js (Can live in the same monorepo).
*   **Simulated Hardware**: Wokwi (ESP32 + Relays).
*   **Design/Diagram**: Excalidraw / draw.io.

---

## 📅 The 12-Hour Timeline

### **Hour 0–1: Setup & Architecture Lock-in**
*   **All Members**: Read this plan. Agree on the REST API JSON structures.
*   **Member 4 (DevOps)**: 
    *   Initialize the monorepo with folders: `/backend`, `/dashboard`, `/bot`, `/docs`.
    *   Set up the GitHub repository and branch protection rules.
    *   Push initial `.gitignore` and `README.md` scaffolding.
*   **Member 1 (Backend)**: Start initializing the Node.js project. Define the in-memory array for the 18 devices (3 rooms * (2 fans + 3 lights)).

### **Hour 1–3: Core Infrastructure (Parallel Development)**
*   **Member 1 (Backend)**:
    *   Implement `GET /devices`, `GET /devices/:room`, `GET /usage`.
    *   Set up the simulator interval (e.g., every 5s randomly toggle 1-2 devices).
    *   Implement Alert logic (Server-side checks for >2hrs on, or after-hours 9AM-5PM).
    *   Broadcast changes via Socket.IO.
*   **Member 2 (Frontend)**:
    *   Initialize React app (`npm create vite@latest dashboard -- --template react`).
    *   Build static UI components (Device Cards, Power Meter, Alert List).
    *   *Tip: Use mock data until the backend API is ready.*
*   **Member 3 (Bot Dev)**:
    *   Initialize Discord Bot project. Register the bot on Discord Developer Portal.
    *   Write basic command handlers for `!status`, `!room <name>`, and `!usage`.
    *   *Tip: Hardcode dummy responses initially to test command routing.*
*   **Member 4 (Docs/Hardware)**:
    *   Draw the **System Diagram** (Device -> Simulator -> Backend -> Dashboard/Bot).
    *   Build the **Circuit Schematic** in Wokwi (ESP32 + 2 fans/relays + 3 lights/LEDs).
    *   Save screenshots/links to `/docs`.

### **Hour 3–6: Wiring it Together (Integration Phase 1)**
*   **Member 1 (Backend)**: Assist Frontend and Bot dev with API integration. Debug WebSocket event payloads. Expose `GET /alerts`.
*   **Member 2 (Frontend)**: 
    *   Connect to Socket.IO. Render live device status.
    *   Calculate and display total & per-room power dynamically.
    *   Fetch and render the `/alerts` list.
*   **Member 3 (Bot Dev)**: 
    *   Connect bot commands to the backend REST API (`axios` or `fetch`).
    *   Format responses to be human-readable.
*   **Member 4 (Docs/Hardware)**: 
    *   Start writing the final `README.md` (Setup instructions, API documentation).
    *   Help Member 2 with CSS/Aesthetics (Gradients, micro-animations, glowing lights).

### **Hour 6–9: Advanced Features & UX Polish**
*   **Member 1 (Backend)**: Add a manual override endpoint (e.g., `POST /devices/override`) to easily trigger test cases for the demo video.
*   **Member 2 (Frontend)**: 
    *   Implement the **Bonus Feature**: Visual office floorplan with glowing lights/spinning fans (CSS animations linked to React state).
    *   Ensure the dashboard looks *premium* (Dark mode, glassmorphism).
*   **Member 3 (Bot Dev)**: 
    *   Implement the **Bonus Feature**: Background task polling `/alerts` and actively pushing messages to a `#alerts` channel.
    *   Add LLM-generated phrasing (optional/if time permits).
*   **Member 4 (Docs/Hardware)**: 
    *   Perform an end-to-end QA test. Force a device to be on for >2 hours and verify both the Dashboard and Discord bot report the alert simultaneously.

### **Hour 9–12: Finalization & Submission**
*   **Member 4 (Docs/Hardware)**: 
    *   Record the ≤3 minute demo video.
    *   Ensure all code is pushed, branches are merged to `main`, and commit history is clean.
*   **Member 1, 2, 3**: Fix any final bugs discovered during video recording. Clean up code comments and remove console.logs.

---

## 🔀 GitHub Collaboration Strategy

1.  **Branching**: Never commit directly to `main`. Use descriptive branch names:
    *   `feat/backend-simulator`
    *   `feat/dashboard-ui`
    *   `docs/system-diagram`
    *   `fix/bot-alerts`
2.  **Pull Requests**: When a feature is complete, open a Pull Request (PR) and ask another team member to quickly review and merge it.
3.  **Communication**: Keep a voice channel open (Discord/Meet) to instantly resolve integration blockers (e.g., "Hey, what did you name the wattage field in the JSON payload?").

## 🔌 API Contract Definition (Draft)

**Device Object:**
```json
{
  "id": "dr-light-1",
  "type": "light",
  "room": "Drawing Room",
  "status": "on",
  "watts": 15,
  "lastChanged": "2026-07-03T10:00:00Z"
}
```

**Alert Object:**
```json
{
  "id": "alert-123",
  "deviceId": "dr-light-1",
  "type": "OVERTIME",
  "message": "Drawing Room Light 1 has been left on for over 2 hours.",
  "timestamp": "2026-07-03T12:00:00Z"
}
```

---
*Ready to begin? The first step is to initialize the monorepo structure in the current repository.*
