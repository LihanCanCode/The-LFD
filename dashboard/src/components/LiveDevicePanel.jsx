import React from 'react';
import { DeviceIcon } from './DeviceIcon';

export const LiveDevicePanel = ({ devices, onToggle }) => {
  // Group devices by room
  const rooms = devices.reduce((acc, device) => {
    if (!acc[device.room]) acc[device.room] = [];
    acc[device.room].push(device);
    return acc;
  }, {});

  const renderToggle = (device) => (
    <div 
      className={`toggle-switch ${device.status === 'on' ? 'on' : ''}`}
      onClick={() => onToggle(device.id)}
    >
      <div className="toggle-switch-circle"></div>
    </div>
  );

  return (
    <div className="panel" style={{ flex: '1' }}>
      <div className="panel-title">Live Device Status Panel</div>
      
      <div className="panel-content" style={{ padding: '1rem' }}>
        {Object.entries(rooms).map(([roomName, roomDevices]) => (
          <div key={roomName} className="room-group">
            <div className="room-group-header">
              <span style={{ fontSize: '0.6rem', color: 'var(--accent-blue)' }}>▼</span>
              {roomName.toUpperCase()} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '0.75rem' }}>({roomDevices.length} Devices)</span>
            </div>
            
            <div className="room-group-content">
              {roomDevices.map((device) => (
                <div key={device.id} className="device-row">
                  <div className="device-row-info">
                    <DeviceIcon type={device.type} status={device.status} size={18} />
                    {device.type.toUpperCase()} {device.id.split('-').pop()}
                  </div>
                  {renderToggle(device)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
