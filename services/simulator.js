function startSimulator(io, devices) {
  return setInterval(() => {
    if (!Array.isArray(devices) || devices.length === 0) {
      return;
    }

    const changeCount = 1 + Math.floor(Math.random() * 2);
    const selectedIndices = new Set();

    while (selectedIndices.size < changeCount && selectedIndices.size < devices.length) {
      selectedIndices.add(Math.floor(Math.random() * devices.length));
    }

    const changedDevices = [];

    selectedIndices.forEach((index) => {
      const device = devices[index];

      if (!device) {
        return;
      }

      device.status = device.status === 'on' ? 'off' : 'on';
      device.lastChanged = new Date().toISOString();
      device.watts = device.status === 'on' ? (device.type === 'fan' ? 60 : 15) : 0;
      changedDevices.push(device);
    });

    changedDevices.forEach((device) => {
      io.emit('device-update', device);
    });
  }, 5000);
}

module.exports = { startSimulator };