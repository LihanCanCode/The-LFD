const test = require('node:test');
const assert = require('node:assert');
const { getActiveAlerts } = require('./alerts');

test('Alerts Engine Tests', async (t) => {
  await t.test('Should not generate alerts for devices that are OFF', () => {
    const devices = [
      { id: 'test-1', status: 'off', lastChanged: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), room: 'Test Room', type: 'fan' }
    ];
    const alerts = getActiveAlerts(devices);
    assert.strictEqual(alerts.length, 0);
  });

  await t.test('Should generate OVERTIME alert if device left on for > 2 hours', () => {
    const devices = [
      { id: 'test-2', status: 'on', lastChanged: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(), room: 'Test Room', type: 'light' }
    ];
    const alerts = getActiveAlerts(devices);
    
    // It might also generate an AFTER_HOURS alert depending on what time this test is run,
    // so we check if AT LEAST the OVERTIME alert is present
    const hasOvertime = alerts.some(a => a.type === 'OVERTIME' && a.deviceId === 'test-2');
    assert.strictEqual(hasOvertime, true);
  });
});
