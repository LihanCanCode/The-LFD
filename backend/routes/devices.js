const express = require('express');
const { devices, findDevice } = require('../../data/seed');
const { checkAlerts } = require('../../services/alerts');

const router = express.Router();

function normalizeRoomParam(roomParam) {
  return roomParam.replace(/-/g, ' ').trim().toLowerCase();
}

function getDeviceWatts(device, status) {
  if (status !== 'on') {
    return 0;
  }

  return device.type === 'fan' ? 60 : 15;
}

router.get('/devices', (req, res) => {
  res.json(devices);
});

router.get('/devices/:room', (req, res) => {
  const requestedRoom = normalizeRoomParam(req.params.room);

  const filteredDevices = devices.filter((device) => {
    return device.room.toLowerCase() === requestedRoom;
  });

  res.json(filteredDevices);
});

// Supports normal overrides and forced overtime testing via { id, status, hoursOn }.
router.post('/devices/override', (req, res) => {
  const { id, status, hoursOn } = req.body;
  const device = findDevice(id);

  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  device.status = status;
  device.watts = getDeviceWatts(device, status);
  if (status === 'on' && Number.isFinite(hoursOn) && hoursOn > 0) {
    device.lastChanged = new Date(Date.now() - hoursOn * 60 * 60 * 1000).toISOString();
  } else {
    device.lastChanged = new Date().toISOString();
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('device-update', device);
    io.emit('alertsUpdate', checkAlerts(devices));
  }

  res.json(device);
});

module.exports = router;
