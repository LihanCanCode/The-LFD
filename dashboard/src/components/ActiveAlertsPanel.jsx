import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ActiveAlertsPanel = ({ alerts }) => {
  return (
    <div className="panel" style={{ maxHeight: '200px' }}>
      <div className="panel-title">
        Active Alerts Panel
        <AlertTriangle size={14} color="#ef4444" />
      </div>
      
      <div className="panel-content alerts-container">
        {alerts && alerts.length > 0 ? (
          alerts.map((alert) => (
            <div key={alert.id} className="alert-box">
              <AlertTriangle size={16} color="var(--alert-text)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p>
                <strong>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - </strong>
                {alert.message}
              </p>
            </div>
          ))
        ) : (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem', fontSize: '0.85rem' }}>
            No active alerts
          </div>
        )}
      </div>
    </div>
  );
};
