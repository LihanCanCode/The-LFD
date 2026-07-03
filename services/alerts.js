const OVERTIME_MS = 2 * 60 * 60 * 1000;
const alertStore = new Map();

function buildAlert(device, type, timestamp) {
  return {
    id: `alert-${device.id}-${type}`,
    deviceId: device.id,
    type,
    message:
      type === 'OVERTIME'
        ? `${device.room} ${device.type} (${device.id}) has been left on for over 2 hours!`
        : `Energy Waste: ${device.room} ${device.type} (${device.id}) is ON after office hours!`,
    timestamp
  };
}

function getActiveAlerts(devices) {
  const now = new Date();
  const timestamp = now.toISOString();
  const activeIds = new Set();
  const computedAlerts = [];
  const isAfterHours = now.getHours() < 9 || now.getHours() >= 17;

  devices.forEach((device) => {
    if (device.status !== 'on') {
      return;
    }

    const lastChangedTime = new Date(device.lastChanged).getTime();

    if (Number.isFinite(lastChangedTime) && now.getTime() - lastChangedTime > OVERTIME_MS) {
      const overtimeAlert = buildAlert(device, 'OVERTIME', timestamp);
      activeIds.add(overtimeAlert.id);
      computedAlerts.push(overtimeAlert);
      alertStore.set(overtimeAlert.id, overtimeAlert);
    }

    if (isAfterHours) {
      const afterHoursAlert = buildAlert(device, 'AFTER_HOURS', timestamp);
      activeIds.add(afterHoursAlert.id);
      computedAlerts.push(afterHoursAlert);
      alertStore.set(afterHoursAlert.id, afterHoursAlert);
    }
  });

  Array.from(alertStore.keys()).forEach((alertId) => {
    if (!activeIds.has(alertId)) {
      alertStore.delete(alertId);
    }
  });

  return computedAlerts.map((alert) => alertStore.get(alert.id)).filter(Boolean);
}

function checkAlerts(devices) {
  return getActiveAlerts(devices);
}

module.exports = { checkAlerts, getActiveAlerts };