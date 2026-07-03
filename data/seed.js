const now = new Date().toISOString();

const devices = [
  { id: 'drawing-fan-1', type: 'fan', room: 'Drawing Room', status: 'off', watts: 60, lastChanged: now },
  { id: 'drawing-fan-2', type: 'fan', room: 'Drawing Room', status: 'off', watts: 60, lastChanged: now },
  { id: 'drawing-light-1', type: 'light', room: 'Drawing Room', status: 'off', watts: 15, lastChanged: now },
  { id: 'drawing-light-2', type: 'light', room: 'Drawing Room', status: 'off', watts: 15, lastChanged: now },
  { id: 'drawing-light-3', type: 'light', room: 'Drawing Room', status: 'off', watts: 15, lastChanged: now },

  { id: 'work1-fan-1', type: 'fan', room: 'Work Room 1', status: 'off', watts: 60, lastChanged: now },
  { id: 'work1-fan-2', type: 'fan', room: 'Work Room 1', status: 'off', watts: 60, lastChanged: now },
  { id: 'work1-light-1', type: 'light', room: 'Work Room 1', status: 'off', watts: 15, lastChanged: now },
  { id: 'work1-light-2', type: 'light', room: 'Work Room 1', status: 'off', watts: 15, lastChanged: now },
  { id: 'work1-light-3', type: 'light', room: 'Work Room 1', status: 'off', watts: 15, lastChanged: now },

  { id: 'work2-fan-1', type: 'fan', room: 'Work Room 2', status: 'off', watts: 60, lastChanged: now },
  { id: 'work2-fan-2', type: 'fan', room: 'Work Room 2', status: 'off', watts: 60, lastChanged: now },
  { id: 'work2-light-1', type: 'light', room: 'Work Room 2', status: 'off', watts: 15, lastChanged: now },
  { id: 'work2-light-2', type: 'light', room: 'Work Room 2', status: 'off', watts: 15, lastChanged: now },
  { id: 'work2-light-3', type: 'light', room: 'Work Room 2', status: 'off', watts: 15, lastChanged: now }
];

function findDevice(id) {
  return devices.find((device) => device.id === id);
}

module.exports = { devices, findDevice };
