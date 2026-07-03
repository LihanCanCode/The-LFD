import React from 'react';
import { DeviceIcon } from './DeviceIcon';

export const OfficeFloorPlan = ({ devices, onToggle }) => {
  const getRoomDevices = (roomName) => {
    return devices.filter((d) => d.room.toLowerCase() === roomName.toLowerCase());
  };

  const renderIconWithLabel = (device) => {
    let top = '50%';
    let left = '50%';
    // Standardized positions for all rooms based on the background image fixtures
    if (['fan-1', 'fan-3', 'fan-5'].includes(device.id)) {
      // Top Fans
      top = '15%'; left = '50%';
    } else if (['fan-2', 'fan-4', 'fan-6'].includes(device.id)) {
      // Bottom Fans
      top = '52%'; left = '50%';
    } else if (['light-1', 'light-4', 'light-7'].includes(device.id)) {
      // Top-Left Lights
      top = '13%'; left = '23%';
    } else if (['light-2', 'light-5', 'light-8'].includes(device.id)) {
      // Top-Right Lights
      top = '13%'; left = '77%';
    } else if (['light-3', 'light-6', 'light-9'].includes(device.id)) {
      // Bottom-Middle Lights
      top = '69%'; left = '50%';
    }

    // Size adjustments: fans larger, lights match the fixture bulb size
    const iconSize = device.type === 'fan' ? 72 : 20;

    return (
      <div 
        key={device.id} 
        className="device-marker" 
        style={{ top, left }}
        onClick={() => onToggle(device.id)}
      >
        <DeviceIcon type={device.type} status={device.status} size={iconSize} />
      </div>
    );
  };

  const isRoomBright = (roomName) => {
    return getRoomDevices(roomName).some(d => d.type === 'light' && d.status === 'on');
  };

  return (
    <div className="panel" style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-title">TOP DOWN OFFICE LAYOUT</div>
      <div className="panel-content" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--panel-bg)' }}>
        <div className="floor-plan-wrapper" style={{ flexShrink: 0 }}>
          <img src="/Gemini_Generated_Image_de6ha9de6ha9de6h.png" className="floor-plan-bg" alt="Office Layout" />
          
          {/* Room overlays for brightness animation */}
          <div className={`room-overlay overlay-drawing ${isRoomBright('Drawing Room') ? 'bright' : 'dark'}`}></div>
          <div className={`room-overlay overlay-work1 ${isRoomBright('Work Room 1') ? 'bright' : 'dark'}`}></div>
          <div className={`room-overlay overlay-work2 ${isRoomBright('Work Room 2') ? 'bright' : 'dark'}`}></div>

          {/* Drawing Room */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '35.5%', height: '100%' }}>
            {getRoomDevices("Drawing Room").map(renderIconWithLabel)}
          </div>
          
          {/* Work Room 1 */}
          <div style={{ position: 'absolute', top: 0, left: '35.5%', width: '31.5%', height: '100%' }}>
            {getRoomDevices("Work Room 1").map(renderIconWithLabel)}
          </div>
          
          {/* Work Room 2 */}
          <div style={{ position: 'absolute', top: 0, left: '67%', width: '33%', height: '100%' }}>
            {getRoomDevices("Work Room 2").map(renderIconWithLabel)}
          </div>
        </div>

        {/* Info Cards to fill the bottom space */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: 'auto' }}>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legend</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <DeviceIcon type="fan" status="off" size={24} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Ceiling Fan (60W)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <DeviceIcon type="light" status="off" size={24} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>LED Light (15W)</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Room Usage</h3>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <li><strong>Drawing Room:</strong> Waiting area</li>
              <li><strong>Work Room 1:</strong> Employees</li>
              <li><strong>Work Room 2:</strong> Employees</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
