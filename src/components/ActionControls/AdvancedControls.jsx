import React, { useState } from 'react';
import './ActionControls.css';

const AdvancedControls = ({
  isAnimating,
  isPaused,
  currentAngle,
  currentSpeed,
  isEmergencyStopped,
  onSpeedChange,
  onMoveToAngle
}) => {
  const [speed, setSpeed] = useState(currentSpeed);

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    onSpeedChange(newSpeed);
  };

  return (
    <div className="advanced-controls">
      <div className="control-section">
        {/* 速度控制 */}
        <div className="control-group">
          <label className="control-label large">速度控制</label>
          <div className="speed-control">
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="speed-slider"
              disabled={isEmergencyStopped}
            />
            <span className="speed-value">{speed.toFixed(1)}x</span>
          </div>
          <div className="speed-presets">
            <button 
              onClick={() => handleSpeedChange(0.5)}
              className="speed-preset-btn"
              disabled={isEmergencyStopped}
            >
              慢速
            </button>
            <button 
              onClick={() => handleSpeedChange(1.0)}
              className="speed-preset-btn"
              disabled={isEmergencyStopped}
            >
              正常
            </button>
            <button 
              onClick={() => handleSpeedChange(2.0)}
              className="speed-preset-btn"
              disabled={isEmergencyStopped}
            >
              快速
            </button>
          </div>
        </div>

        {/* 角度控制 */}
        <div className="control-group">
          <label className="control-label large">角度控制</label>
          <div className="angle-controls">
            <div className="angle-input-group">
              <label className="control-label">目标角度:</label>
              <input
                type="number"
                min="0"
                max="90"
                step="1"
                defaultValue={currentAngle}
                className="angle-input"
                disabled={isEmergencyStopped}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const angle = parseFloat(e.target.value);
                    if (!isNaN(angle) && angle >= 0 && angle <= 90) {
                      onMoveToAngle(angle, speed);
                    }
                  }
                }}
              />
              <button 
                onClick={() => {
                  const input = document.querySelector('.angle-input');
                  const angle = parseFloat(input.value);
                  if (!isNaN(angle) && angle >= 0 && angle <= 90) {
                    onMoveToAngle(angle, speed);
                  }
                }}
                className="control-btn primary small"
                disabled={isEmergencyStopped}
              >
                移动到
              </button>
            </div>
            
            <div className="angle-presets">
              <div className="angle-presets-row">
                <button 
                  onClick={() => onMoveToAngle(0, speed)}
                  className="angle-preset-btn"
                  disabled={isEmergencyStopped}
                >
                  0°
                </button>
                <button 
                  onClick={() => onMoveToAngle(45, speed)}
                  className="angle-preset-btn"
                  disabled={isEmergencyStopped}
                >
                  45°
                </button>
                <button 
                  onClick={() => onMoveToAngle(90, speed)}
                  className="angle-preset-btn"
                  disabled={isEmergencyStopped}
                >
                  90°
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedControls; 