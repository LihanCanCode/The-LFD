import React from 'react';

const CeilingFanSVG = ({ className, size }) => (
  <svg 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className={className}
    style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
  >
    <g transform="translate(50, 50)">
      {/* Blade 1 */}
      <g transform="rotate(30)">
        <rect x="12" y="-3" width="8" height="6" fill="#2d1c11" />
        <rect x="20" y="-7" width="28" height="14" rx="4" fill="#4a3018" stroke="#2d1c11" strokeWidth="1" />
        <rect x="22" y="-4" width="24" height="8" rx="2" fill="#573a1d" />
      </g>
      {/* Blade 2 */}
      <g transform="rotate(150)">
        <rect x="12" y="-3" width="8" height="6" fill="#2d1c11" />
        <rect x="20" y="-7" width="28" height="14" rx="4" fill="#4a3018" stroke="#2d1c11" strokeWidth="1" />
        <rect x="22" y="-4" width="24" height="8" rx="2" fill="#573a1d" />
      </g>
      {/* Blade 3 */}
      <g transform="rotate(270)">
        <rect x="12" y="-3" width="8" height="6" fill="#2d1c11" />
        <rect x="20" y="-7" width="28" height="14" rx="4" fill="#4a3018" stroke="#2d1c11" strokeWidth="1" />
        <rect x="22" y="-4" width="24" height="8" rx="2" fill="#573a1d" />
      </g>
      {/* Center Hub */}
      <circle cx="0" cy="0" r="14" fill="#3a2512" stroke="#1f1409" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="8" fill="#573a1d" />
    </g>
  </svg>
);

export const DeviceIcon = ({ type, status, size = 24 }) => {
  const isOn = status === 'on';

  if (type === 'light') {
    return (
      <div 
        className={`device-icon-container light-circle ${isOn ? 'on' : 'off'}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          transition: 'all 0.3s ease',
          backgroundColor: isOn ? '#fbbf24' : 'rgba(0,0,0,0.1)',
          boxShadow: isOn ? '0 0 20px 10px rgba(251, 191, 36, 0.6), inset 0 0 10px #fff' : 'none',
          border: isOn ? '2px solid #fff' : '2px solid rgba(0,0,0,0.2)',
        }}
      ></div>
    );
  }

  // Use the custom ceiling fan SVG instead of the lucide icon
  return (
    <div className={`device-icon-container ${isOn ? 'on' : 'off'} ${type}`} style={{ background: 'transparent', boxShadow: 'none' }}>
      <CeilingFanSVG 
        size={size} 
        className={`icon-svg fan ${isOn ? 'on animate-spin' : ''}`} 
      />
    </div>
  );
};
