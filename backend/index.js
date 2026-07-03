const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for the hackathon
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Define single source of truth for devices
const rooms = ["Drawing Room", "Work Room 1", "Work Room 2"];
let devices = [];

// Initialize 18 devices
let idCounter = 1;
rooms.forEach(room => {
  for (let i = 1; i <= 2; i++) {
    devices.push({ id: `fan-${idCounter++}`, type: 'fan', room, status: 'off', watts: 0, lastChanged: new Date().toISOString() });
  }
  for (let i = 1; i <= 3; i++) {
    devices.push({ id: `light-${idCounter++}`, type: 'light', room, status: 'off', watts: 0, lastChanged: new Date().toISOString() });
  }
});

// Mock alerts array
let alerts = [];

// --- REST API ENDPOINTS ---
app.get('/devices', (req, res) => {
  res.json(devices);
});

app.get('/devices/:room', (req, res) => {
  const room = req.params.room;
  res.json(devices.filter(d => d.room.toLowerCase() === room.toLowerCase()));
});

app.get('/usage', (req, res) => {
  // TODO: Calculate usage
  res.json({ totalKWh: 0 });
});

app.get('/alerts', (req, res) => {
  res.json(alerts);
});

// --- WEBSOCKETS ---
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Send initial state to the new client
  socket.emit('initialData', devices);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// --- SIMULATOR LOOP (To be implemented by Member 1) ---
setInterval(() => {
  // TODO: Randomly toggle states and emit via socket.io
  // io.emit('deviceUpdate', updatedDevice);
}, 5000);

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
