# The-LFD Monorepo

Welcome to the Lights, Fans, Discord hackathon project monorepo! This repository is set up with skeletons for the backend, dashboard, and bot.

## 🚀 Getting Started

### 1. Backend (Node.js/Express/Socket.io)
The backend acts as the single source of truth, simulating the IoT devices and exposing REST endpoints + WebSockets.
```bash
cd backend
npm install
npm run dev
```
It will start on `http://localhost:4000`.

#### Device override testing
`POST /devices/override` accepts `{ id, status }` and also supports an optional `hoursOn` number. Setting `hoursOn` lets you force an overtime scenario without a separate endpoint. For example, `hoursOn: 3` means “treat this device as if it was turned on 3 hours ago.”

```json
{ "id": "drawing-light-1", "status": "on", "hoursOn": 3 }
```

### 2. Dashboard (React/Vite)
The dashboard is the frontend UI.
```bash
cd dashboard
npm install
npm run dev
```
It will start on `http://localhost:5173`.

### 3. Discord Bot
The bot connects to Discord and fetches data from the backend.
1. Copy `bot/.env.example` to `bot/.env` and add your `DISCORD_TOKEN`.
```bash
cd bot
npm install
npm start
```

## 🛠️ Workflows
- **Member 1 (Backend)**: Work in the `/backend` folder. Start filling out the TODOs in `backend/index.js` for the simulation interval and alert logic.
- **Member 1 (Backend)**: Work in the `/backend` folder. The device override endpoint at `POST /devices/override` also supports `hoursOn` for forcing overtime alerts, so a separate `POST /devices/force-overtime` route is not needed.
- **Member 2 (Frontend)**: Work in the `/dashboard` folder. You can clean up the Vite boilerplate in `src/App.jsx` and start building the device grid. Connect to Socket.io!
- **Member 3 (Bot)**: Work in the `/bot` folder. Implement the API fetches to the backend using `axios` or `fetch`.
- **Member 4 (Docs/Hardware)**: Add your circuit diagrams to `/docs` and manage the project board!

Happy Hacking!
