import React, { useState, useEffect } from 'react';
import './App.css';

import { LiveDevicePanel } from './components/LiveDevicePanel';
import { PowerConsumptionMeter } from './components/PowerConsumptionMeter';
import { ActiveAlertsPanel } from './components/ActiveAlertsPanel';
import { OfficeFloorPlan } from './components/OfficeFloorPlan';
import { DiscordBotPanel } from './components/DiscordBotPanel';
import { Zap } from 'lucide-react';
import { io } from 'socket.io-client';

const FAN_WATTS = 60;
const LIGHT_WATTS = 15;

function App() {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [usage, setUsage] = useState({ totalKWh: 0, currentWatts: 0 });

  useEffect(() => {
    const socket = io('http://localhost:4000');

    socket.on('initialData', (data) => {
      setDevices(data);
    });

    socket.on('device-update', (updatedDevice) => {
      setDevices((prev) =>
        prev.map((d) => (d.id === updatedDevice.id ? updatedDevice : d))
      );
    });

    socket.on('alertsUpdate', (data) => {
      setAlerts(data);
    });

    socket.on('usageUpdate', (data) => {
      setUsage((prev) => ({
        ...prev,
        currentWatts: data.totalWatts
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleDevice = (id) => {
    const device = devices.find((d) => d.id === id);
    if (!device) return;

    const nextStatus = device.status === 'on' ? 'off' : 'on';

    // Optimistic UI update
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          return {
            ...d,
            status: nextStatus,
            watts: nextStatus === 'on' ? (d.type === 'fan' ? FAN_WATTS : LIGHT_WATTS) : 0
          };
        }
        return d;
      })
    );

    // Call override API
    fetch('http://localhost:4000/devices/override', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, status: nextStatus })
    }).catch((err) => {
      console.error('Error overriding device:', err);
      // Revert if failed
      setDevices((prev) => prev.map((d) => (d.id === id ? device : d)));
    });
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
            backgroundColor: '#34d399',
            boxShadow: '0 0 10px rgba(52, 211, 153, 0.5)'
          }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>
            Live Backend Connected
          </span>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="col-1">
          <PowerConsumptionMeter usage={usage} devices={devices} />
          <DiscordBotPanel />
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
