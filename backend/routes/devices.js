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

const chipToBackendMap = {
  'fan1': 'work1-fan-1',
  'fan2': 'work1-fan-2',
  'light1': 'work1-light-1',
  'light2': 'work1-light-2',
  'light3': 'work1-light-3'
};

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
  device.isOverridden = true; // Mark as backend override to sync with ESP32
  
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

// Receive real-time telemetry and device states from ESP32
router.post('/api/devices/report', (req, res) => {
  const { room, devices: chipDevices } = req.body;
  const io = req.app.get('io');
  const commands = [];
  let dbUpdated = false;

  if (room === 'work_room_1' && Array.isArray(chipDevices)) {
    chipDevices.forEach((chipDev) => {
      const backendId = chipToBackendMap[chipDev.id];
      if (backendId) {
        const device = findDevice(backendId);
        if (device) {
          if (device.isOverridden) {
            if (chipDev.status === device.status) {
              device.isOverridden = false; // Successfully synced
            } else {
              // Send control command to align ESP32 with dashboard
              commands.push({
                id: chipDev.id,
                status: device.status
              });
            }
          } else {
            // No dashboard override active, so chip's local button changes take precedence
            if (chipDev.status !== device.status) {
              device.status = chipDev.status;
              device.watts = getDeviceWatts(device, chipDev.status);
              device.lastChanged = new Date().toISOString();
              dbUpdated = true;

              if (io) {
                io.emit('device-update', device);
              }
            }
          }
        }
      }
    });

    if (dbUpdated && io) {
      io.emit('alertsUpdate', checkAlerts(devices));
      const currentTotalWatts = devices.reduce((sum, d) => sum + (d.status === 'on' ? d.watts : 0), 0);
      io.emit('usageUpdate', { totalWatts: currentTotalWatts });
    }
  }

  res.json({
    status: 'success',
    commands
  });
});

module.exports = router;
