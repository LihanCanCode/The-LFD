const express = require('express');
const { devices } = require('../../data/seed');
const { getTotalKWh } = require('../services/usageStore');

const router = express.Router();

const rooms = ['Drawing Room', 'Work Room 1', 'Work Room 2'];

router.get('/usage', (req, res) => {
  const roomBreakdown = rooms.map((room) => {
    const roomDevices = devices.filter((device) => device.room === room);
    const totalWatts = roomDevices.reduce((sum, device) => {
      return device.status === 'on' ? sum + device.watts : sum;
    }, 0);

    return {
      room,
      totalWatts,
      deviceCount: roomDevices.length
    };
  });

  const totalWatts = roomBreakdown.reduce((sum, room) => sum + room.totalWatts, 0);

  res.json({
    totalWatts,
    totalKWh: getTotalKWh(),
    roomBreakdown
  });
});

module.exports = router;