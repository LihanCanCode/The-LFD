import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

import { LiveDevicePanel } from './components/LiveDevicePanel';
import { PowerConsumptionMeter } from './components/PowerConsumptionMeter';
import { ActiveAlertsPanel } from './components/ActiveAlertsPanel';
import { OfficeFloorPlan } from './components/OfficeFloorPlan';
import { Zap } from 'lucide-react';

function App() {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [usage, setUsage] = useState({ totalWatts: 0 });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to the backend WebSocket
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    const socket = io(backendUrl);

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to backend');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from backend');
    });

    socket.on('initialData', (data) => {
      setDevices(data);
    });

    socket.on('device-update', (updatedDevice) => {
      setDevices((prevDevices) =>
        prevDevices.map((device) =>
          device.id === updatedDevice.id ? updatedDevice : device
        )
      );
    });

    socket.on('alertsUpdate', (data) => {
      setAlerts(data);
    });

    socket.on('usageUpdate', (data) => {
      setUsage(data); // data is { totalWatts: ... }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleDevice = async (id) => {
    // Find the current device status to flip it
    const device = devices.find(d => d.id === id);
    if (!device) return;
    
    const newStatus = device.status === 'on' ? 'off' : 'on';
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      await fetch(`${backendUrl}/devices/override`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status: newStatus })
      });
    } catch (error) {
      console.error('Failed to toggle device:', error);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-logos">
          <Zap size={28} color="var(--accent-blue)" />
          <span className="header-logo-text">TECHATHON ROVER SUMMIT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            boxShadow: isConnected ? '0 0 10px rgba(16, 185, 129, 0.5)' : '0 0 10px rgba(239, 68, 68, 0.5)'
          }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>
            {isConnected ? 'System Online (Backend Connected)' : 'Connecting to Backend...'}
          </span>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="col-1">
          <PowerConsumptionMeter usage={{ currentWatts: usage.totalWatts || 0, totalKWh: usage.totalKWh || 0 }} devices={devices} />
        </div>
        
        <div className="col-2">
          <LiveDevicePanel devices={devices} onToggle={toggleDevice} />
          <ActiveAlertsPanel alerts={alerts} />
        </div>

        <div className="col-3">
          <OfficeFloorPlan devices={devices} onToggle={toggleDevice} />
        </div>
      </div>
    </div>
  );
}

export default App;
