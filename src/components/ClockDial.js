import React, { useState, useEffect, useRef, useCallback } from 'react';

const ClockDial = ({ initialHour = 10, initialMinute = 0, onChange }) => {
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  const [isMinuteMode, setIsMinuteMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef(null);

  const updateTime = useCallback((clientX, clientY) => {
    if (!dialRef.current) return;

    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = clientX - centerX;
    const y = clientY - centerY;

    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = (angle + 360 + 90) % 360;

    if (!isMinuteMode) {
      let selectedHour = Math.round(angle / 30) % 12;
      if (selectedHour === 0) selectedHour = 12;
      setHour(selectedHour);
    } else {
      let selectedMinute = Math.round(angle / 6);
      // Snap to 5 mins unless dragging closely? 
      // For now, let's keep the 5-min snap for a cleaner UI
      selectedMinute = Math.round(selectedMinute / 5) * 5;
      if (selectedMinute === 60) selectedMinute = 0;
      setMinute(selectedMinute);
    }
  }, [isMinuteMode]);

  useEffect(() => {
    onChange?.({ hour, minute });
  }, [hour, minute, onChange]);

  // Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateTime(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    updateTime(e.clientX, e.clientY);
  }, [isDragging, updateTime]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const toggleMode = () => setIsMinuteMode(!isMinuteMode);

  const displayTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  return (
    <div style={{ textAlign: 'center', userSelect: 'none', fontFamily: 'sans-serif' }}>
      <div style={{ 
        marginBottom: '1rem', 
        fontSize: '1.5rem', 
        fontWeight: '700',
        color: '#334155'
      }}>
        <span style={{ color: !isMinuteMode ? '#3498db' : '#94a3b8' }}>{hour.toString().padStart(2, '0')}</span>
        :
        <span style={{ color: isMinuteMode ? '#e74c3c' : '#94a3b8' }}>{minute.toString().padStart(2, '0')}</span>
      </div>

      <div
        ref={dialRef}
        onMouseDown={handleMouseDown}
        style={{
          width: 260,
          height: 260,
          borderRadius: '50%',
          backgroundColor: '#f8fafc',
          border: '2px solid #e2e8f0',
          position: 'relative',
          margin: '0 auto',
          cursor: 'crosshair',
          touchAction: 'none'
        }}
      >
        {/* Numbers */}
        {[...Array(12)].map((_, i) => {
          const val = isMinuteMode ? i * 5 : (i === 0 ? 12 : i);
          const angleDeg = i * 30;
          const rad = (angleDeg * Math.PI) / 180;
          const x = 95 * Math.sin(rad);
          const y = -95 * Math.cos(rad);
          
          const isSelected = isMinuteMode ? (minute === val) : (hour === val);

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `calc(50% + ${x}px - 15px)`,
                top: `calc(50% + ${y}px - 15px)`,
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: isSelected ? (isMinuteMode ? '#e74c3c' : '#3498db') : 'transparent',
                color: isSelected ? 'white' : '#64748b',
                fontWeight: isSelected ? 'bold' : '500',
                transition: 'all 0.2s ease',
              }}
            >
              {val}
            </div>
          );
        })}

        {/* Hand */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '50%',
            width: '2px',
            height: isMinuteMode ? '90px' : '70px',
            background: isMinuteMode ? '#e74c3c' : '#3498db',
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${isMinuteMode ? minute * 6 : hour * 30}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1,
          }}
        >
          <div style={{
            position: 'absolute',
            top: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'inherit'
          }} />
        </div>

        {/* Center Pivot */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '6px',
          height: '6px',
          background: '#334155',
          borderRadius: '50%',
          zIndex: 2,
        }} />
      </div>

      <button
        onClick={toggleMode}
        style={{
          marginTop: '2rem',
          padding: '10px 24px',
          borderRadius: '20px',
          border: 'none',
          backgroundColor: '#334155',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        {isMinuteMode ? 'Set Hour' : 'Set Minutes'}
      </button>
    </div>
  );
};

export default ClockDial;