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
    origin: '*', 
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Define single source of truth for devices
const rooms = ["Drawing Room", "Work Room 1", "Work Room 2"];
let devices = [];
let totalKWh = 0; // Accumulated power usage
let alerts = [];

// Constants for simulation
const FAN_WATTS = 60;
const LIGHT_WATTS = 15;
const ALERT_OVERTIME_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

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

// --- REST API ENDPOINTS ---
app.get('/devices', (req, res) => res.json(devices));

app.get('/devices/:room', (req, res) => {
  res.json(devices.filter(d => d.room.toLowerCase() === req.params.room.toLowerCase()));
});

app.get('/usage', (req, res) => {
  res.json({ totalKWh: totalKWh.toFixed(4) });
});

app.get('/alerts', (req, res) => res.json(alerts));

// Testing Endpoint: Manually trigger an alert by forcing a device on for > 2 hours
app.post('/devices/override', (req, res) => {
  const { deviceId, status, hoursOn } = req.body;
  const device = devices.find(d => d.id === deviceId);
  if (!device) return res.status(404).json({ error: "Device not found" });

  device.status = status;
  device.watts = status === 'on' ? (device.type === 'fan' ? FAN_WATTS : LIGHT_WATTS) : 0;
  
  if (hoursOn) {
    const pastTime = new Date(Date.now() - (hoursOn * 60 * 60 * 1000));
    device.lastChanged = pastTime.toISOString();
  } else {
    device.lastChanged = new Date().toISOString();
  }

  io.emit('deviceUpdate', device);
  checkAlerts(); // Force alert check immediately
  res.json({ message: "Device overridden for testing", device });
});

// --- WEBSOCKETS ---
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.emit('initialData', devices);
  socket.emit('alertsUpdate', alerts);
  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

// --- ALERTS LOGIC ---
function checkAlerts() {
  const now = new Date();
  const currentHour = now.getHours();
  const isAfterHours = currentHour < 9 || currentHour >= 17;
  
  let newAlerts = [];

  devices.forEach(device => {
    if (device.status === 'on') {
      const timeOnMs = now.getTime() - new Date(device.lastChanged).getTime();
      
      // Check 1: Continuous usage > 2 hours
      if (timeOnMs > ALERT_OVERTIME_MS) {
        newAlerts.push({
          id: `alert-time-${device.id}-${now.getTime()}`,
          deviceId: device.id,
          type: 'OVERTIME',
          message: `${device.room} ${device.type} (${device.id}) has been left on for over 2 hours!`,
          timestamp: now.toISOString()
        });
      }
      
      // Check 2: After hours (9AM-5PM is work hours)
      if (isAfterHours) {
        newAlerts.push({
          id: `alert-afterhours-${device.id}-${now.getTime()}`,
          deviceId: device.id,
          type: 'AFTER_HOURS',
          message: `Energy Waste: ${device.room} ${device.type} is ON after office hours!`,
          timestamp: now.toISOString()
        });
      }
    }
  });

  // Basic deduplication to avoid spamming the same alert
  alerts = newAlerts.slice(0, 10); // Keep latest 10
  io.emit('alertsUpdate', alerts);
}

// --- SIMULATOR LOOP (Runs every 5 seconds) ---
setInterval(() => {
  // 1. Randomly toggle 1 device to simulate activity
  if (Math.random() > 0.5) { 
    const randomIdx = Math.floor(Math.random() * devices.length);
    const device = devices[randomIdx];
    
    device.status = device.status === 'on' ? 'off' : 'on';
    device.watts = device.status === 'on' ? (device.type === 'fan' ? FAN_WATTS : LIGHT_WATTS) : 0;
    device.lastChanged = new Date().toISOString();
    
    io.emit('deviceUpdate', device);
  }

  // 2. Accumulate power usage (Convert Watts to kWh for this 5-second interval)
  // kWh = (Watts / 1000) * (Hours) -> 5 seconds = 5/3600 hours
  const currentTotalWatts = devices.reduce((sum, d) => sum + d.watts, 0);
  const intervalHours = 5 / 3600; 
  totalKWh += (currentTotalWatts / 1000) * intervalHours;
  io.emit('usageUpdate', { totalKWh: totalKWh.toFixed(4), currentWatts: currentTotalWatts });

  // 3. Check for alerts
  checkAlerts();

}, 5000);

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
