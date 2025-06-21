import React, { useState } from 'react';
import './ActionControls.css';

const AdvancedControls = ({
  isAnimating,
  currentAngle,
  currentSpeed,
  isEmergencyStopped,
  isEmergencyStopInProcess,
  onSpeedChange,
  onMoveToAngle,
  onPause,
  onResume,
  onStop,
  onEmergencyStop,
  onResetEmergencyStop
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
          <div className="angle-presets-row">
            <button 
              onClick={() => onMoveToAngle(0, speed)}
              disabled={isAnimating || isEmergencyStopped}
              className="angle-preset-btn"
            >
              0°
            </button>
            <button 
              onClick={() => onMoveToAngle(30, speed)}
              disabled={isAnimating || isEmergencyStopped}
              className="angle-preset-btn"
            >
              30°
            </button>
            <button 
              onClick={() => onMoveToAngle(60, speed)}
              disabled={isAnimating || isEmergencyStopped}
              className="angle-preset-btn"
            >
              60°
            </button>
            <button 
              onClick={() => onMoveToAngle(90, speed)}
              disabled={isAnimating || isEmergencyStopped}
              className="angle-preset-btn"
            >
              90°
            </button>
          </div>
        </div>
      </div>

      {/* 运动控制 */}
      <div className="control-section">
        <div className="execution-controls">
          <div className="control-buttons">
            <button 
              onClick={onPause}
              disabled={!isAnimating || isEmergencyStopped}
              className="control-btn warning small"
            >
              暂停
            </button>
            
            <button 
              onClick={onResume}
              disabled={isAnimating || isEmergencyStopped}
              className="control-btn success small"
            >
              恢复
            </button>
            
            <button 
              onClick={onStop}
              disabled={!isAnimating || isEmergencyStopped}
              className="control-btn secondary small"
            >
              停止
            </button>
            
            <button 
              onClick={onEmergencyStop}
              disabled={isEmergencyStopped}
              className="control-btn danger small"
            >
              紧急停止
            </button>
            
            {isEmergencyStopped && (
              <button 
                onClick={onResetEmergencyStop}
                className="control-btn reset small"
              >
                <span className="btn-icon">🔄</span>
                重置紧急停止
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedControls; 