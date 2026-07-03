import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Zap, AlertTriangle, Wind, Lightbulb, Clock } from 'lucide-react';
import './App.css';

const SOCKET_SERVER_URL = 'http://localhost:3001';

function App() {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [totalUsage, setTotalUsage] = useState({ totalKWh: '0.0000', currentWatts: 0 });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('initialData', (data) => setDevices(data));
    socket.on('alertsUpdate', (data) => setAlerts(data));
    socket.on('usageUpdate', (data) => setTotalUsage(data));
    
    socket.on('deviceUpdate', (updatedDevice) => {
      setDevices(prev => prev.map(d => d.id === updatedDevice.id ? updatedDevice : d));
    });

    return () => socket.disconnect();
  }, []);

  // Group devices by room
  const rooms = [...new Set(devices.map(d => d.room))];

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="glass-header">
        <div className="header-content">
          <div>
            <h1>LFD <span className="highlight">Command Center</span></h1>
            <p className="status-indicator">
              <span className={`dot ${isConnected ? 'online' : 'offline'}`}></span>
              {isConnected ? 'System Online' : 'Connecting...'}
            </p>
          </div>
          <div className="power-meter glass-panel">
            <Zap className="power-icon" />
            <div className="power-stats">
              <span className="power-value">{totalUsage.currentWatts || 0} W</span>
              <span className="power-label">Current Draw</span>
            </div>
            <div className="divider"></div>
            <div className="power-stats">
              <span className="power-value">{totalUsage.totalKWh} kWh</span>
              <span className="power-label">Total Usage Today</span>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-grid">
        {/* ROOMS GRID */}
        <section className="rooms-section">
          <h2>Facility Control</h2>
          <div className="rooms-grid">
            {rooms.map(room => (
              <div key={room} className="room-card glass-panel">
                <h3>{room}</h3>
                <div className="devices-grid">
                  {devices.filter(d => d.room === room).map(device => (
                    <DeviceCard key={device.id} device={device} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ALERTS SECTION */}
        <aside className="alerts-section glass-panel">
          <div className="alerts-header">
            <AlertTriangle className="alerts-icon" />
            <h2>Active Alerts</h2>
            <span className="alert-badge">{alerts.length}</span>
          </div>
          <div className="alerts-list">
            {alerts.length === 0 ? (
              <p className="no-alerts">All systems optimal.</p>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className={`alert-card ${alert.type.toLowerCase()}`}>
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-time"><Clock size={12}/> {new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

function DeviceCard({ device }) {
  const isOn = device.status === 'on';
  const Icon = device.type === 'fan' ? Wind : Lightbulb;
  
  return (
    <div className={`device-card ${isOn ? 'on' : 'off'}`}>
      <div className={`icon-container ${isOn ? 'glow' : ''}`}>
        <Icon className={isOn && device.type === 'fan' ? 'spin' : ''} />
      </div>
      <div className="device-info">
        <span className="device-name">{device.type} {device.id.split('-')[1]}</span>
        <span className="device-watts">{isOn ? `${device.watts}W` : '0W'}</span>
      </div>
      <div className={`status-pill ${isOn ? 'active' : ''}`}>
        {isOn ? 'ON' : 'OFF'}
      </div>
    </div>
  );
}

export default App;
