let totalKWh = 0;

function addUsage(watts, seconds) {
  // Convert Watt-seconds to Kilowatt-hours
  const kWh = (watts * seconds) / 3600000;
  totalKWh += kWh;
}

function getTotalKWh() {
  return totalKWh;
}

module.exports = { addUsage, getTotalKWh };
