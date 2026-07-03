const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { devices } = require('../data/seed');
const devicesRouter = require('./routes/devices');
const usageRouter = require('./routes/usage');
const { startSimulator } = require('../services/simulator');
const { checkAlerts, getActiveAlerts } = require('../services/alerts');
const { addUsage, getTotalKWh } = require('./services/usageStore');

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

app.set('io', io);
app.use('/', devicesRouter);
app.use('/', usageRouter);

const PORT = process.env.PORT || 4000;

app.get('/alerts', (req, res) => res.json(getActiveAlerts(devices)));

// --- WEBSOCKETS ---
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.emit('initialData', devices);
  socket.emit('alertsUpdate', getActiveAlerts(devices));
  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

startSimulator(io, devices);

// --- SIMULATOR LOOP SUPPORT (Runs every 5 seconds) ---
setInterval(() => {
  const currentTotalWatts = devices.reduce((sum, device) => sum + device.watts, 0);
  addUsage(currentTotalWatts, 5); // Accumulate 5 seconds of usage
  
  io.emit('usageUpdate', { totalWatts: currentTotalWatts, totalKWh: getTotalKWh() });
  io.emit('alertsUpdate', checkAlerts(devices));

}, 5000);

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

module.exports = io;
