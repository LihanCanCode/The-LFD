import React, { useState, useEffect } from 'react';
import './App.css';

import { LiveDevicePanel } from './components/LiveDevicePanel';
import { PowerConsumptionMeter } from './components/PowerConsumptionMeter';
import { ActiveAlertsPanel } from './components/ActiveAlertsPanel';
import { OfficeFloorPlan } from './components/OfficeFloorPlan';
import { DiscordBotPanel } from './components/DiscordBotPanel';
import { Zap } from 'lucide-react';

const FAN_WATTS = 60;
const LIGHT_WATTS = 15;

const initialDevices = [
  { id: 'fan-1', type: 'fan', room: 'Drawing Room', status: 'off', watts: 0 },
  { id: 'fan-2', type: 'fan', room: 'Drawing Room', status: 'off', watts: 0 },
  { id: 'light-1', type: 'light', room: 'Drawing Room', status: 'off', watts: 0 },
  { id: 'light-2', type: 'light', room: 'Drawing Room', status: 'off', watts: 0 },
  { id: 'light-3', type: 'light', room: 'Drawing Room', status: 'off', watts: 0 },
  { id: 'fan-3', type: 'fan', room: 'Work Room 1', status: 'off', watts: 0 },
  { id: 'fan-4', type: 'fan', room: 'Work Room 1', status: 'off', watts: 0 },
  { id: 'light-4', type: 'light', room: 'Work Room 1', status: 'off', watts: 0 },
  { id: 'light-5', type: 'light', room: 'Work Room 1', status: 'off', watts: 0 },
  { id: 'light-6', type: 'light', room: 'Work Room 1', status: 'off', watts: 0 },
  { id: 'fan-5', type: 'fan', room: 'Work Room 2', status: 'off', watts: 0 },
  { id: 'fan-6', type: 'fan', room: 'Work Room 2', status: 'off', watts: 0 },
  { id: 'light-7', type: 'light', room: 'Work Room 2', status: 'off', watts: 0 },
  { id: 'light-8', type: 'light', room: 'Work Room 2', status: 'off', watts: 0 },
  { id: 'light-9', type: 'light', room: 'Work Room 2', status: 'off', watts: 0 },
];

function App() {
  const [devices, setDevices] = useState(initialDevices);
  const [alerts, setAlerts] = useState([]);
  const [usage, setUsage] = useState({ totalKWh: 0, currentWatts: 0 });

  const toggleDevice = (id) => {
    setDevices(prev => prev.map(device => {
      if (device.id === id) {
        const newStatus = device.status === 'on' ? 'off' : 'on';
        return {
          ...device,
          status: newStatus,
          watts: newStatus === 'on' ? (device.type === 'fan' ? FAN_WATTS : LIGHT_WATTS) : 0
        };
      }
      return device;
    }));
  };

  useEffect(() => {
    // Calculate total usage locally for the simulation
    const currentTotalWatts = devices.reduce((sum, d) => sum + d.watts, 0);
    setUsage(prev => ({
      ...prev,
      currentWatts: currentTotalWatts,
    }));
  }, [devices]);

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
            Simulation Active
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
