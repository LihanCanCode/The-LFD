import React from 'react';
import GaugeComponent from 'react-gauge-component';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const PowerConsumptionMeter = ({ usage, devices }) => {
  // Calculate power usage per room
  const roomPower = devices.reduce((acc, device) => {
    if (!acc[device.room]) acc[device.room] = 0;
    acc[device.room] += device.watts || 0;
    return acc;
  }, {});

  const currentTotalWatts = Object.values(roomPower).reduce((sum, w) => sum + w, 0);

  const chartData = [
    { name: 'Drawing Room', watts: roomPower['Drawing Room'] || 0, fill: '#3b82f6' },
    { name: 'Work Room 1', watts: roomPower['Work Room 1'] || 0, fill: '#8b5cf6' },
    { name: 'Work Room 2', watts: roomPower['Work Room 2'] || 0, fill: '#10b981' },
  ];

  return (
    <div className="panel" style={{ flex: '1' }}>
      <div className="panel-title">Live Power Consumption Meter</div>
      
      <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
        <div className="gauge-container" style={{ marginTop: '1rem' }}>
          <GaugeComponent
            type="semicircle"
            arc={{
              width: 0.15,
              padding: 0.02,
              cornerRadius: 1,
              subArcs: [
                { limit: 2000, color: '#3b82f6' },
                { limit: 5000, color: '#10b981' },
                { limit: 7000, color: '#ef4444' }
              ]
            }}
            pointer={{ type: 'needle', elastic: true, animationDelay: 0 }}
            value={currentTotalWatts}
            minValue={0}
            maxValue={7000}
            labels={{
              valueLabel: { display: false },
              tickLabels: {
                type: 'outer',
                valueConfig: { formatTextValue: value => value, fontSize: 10, fill: '#9ba1b2' },
                ticks: [
                  { value: 0 },
                  { value: 400 },
                  { value: 600 },
                  { value: 800 },
                  { value: 7000 }
                ]
              }
            }}
            style={{ width: '80%', margin: '0 auto' }}
          />
          <div className="total-power-text">
            TOTAL POWER: <span className="total-power-val">{currentTotalWatts}W</span>
          </div>
        </div>

        <div style={{ flex: 1, width: '100%', padding: '1rem', marginTop: 'auto' }}>
          <ResponsiveContainer width="100%" height="100%" minHeight={150}>
            <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9ba1b2', fontSize: 10 }} 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(val) => val.replace('Room', 'Room\n')}
              />
              <YAxis 
                tick={{ fill: '#9ba1b2', fontSize: 10 }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#272a37', border: 'none', borderRadius: '4px', color: '#fff' }} 
              />
              <Bar dataKey="watts" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
