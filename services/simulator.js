function startSimulator(io, devices) {
  return setInterval(() => {
    if (!Array.isArray(devices) || devices.length === 0) {
      return;
    }

    // Exclude Work Room 1 from automatic random simulation as it is hardware-driven
    const simulatableDevices = devices.filter((d) => d.room !== 'Work Room 1');
    if (simulatableDevices.length === 0) {
      return;
    }

    const changeCount = 1 + Math.floor(Math.random() * 2);
    const selectedIndices = new Set();

    while (selectedIndices.size < changeCount && selectedIndices.size < simulatableDevices.length) {
      selectedIndices.add(Math.floor(Math.random() * simulatableDevices.length));
    }

    const changedDevices = [];

    selectedIndices.forEach((index) => {
      const device = simulatableDevices[index];

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