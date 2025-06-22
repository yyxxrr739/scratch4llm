import React, { useState, useEffect } from 'react';
import './ActionControls.css';

const AdvancedControls = ({
  isAnimating,
  isPaused,
  currentAngle,
  currentSpeed,
  isEmergencyStopped,
  onSpeedChange,
  onMoveToAngle,
  onResetEmergencyStop
}) => {
  const [speed, setSpeed] = useState(currentSpeed);
  const [emergencyStopCountdown, setEmergencyStopCountdown] = useState(0);

  // 紧急停止倒计时
  useEffect(() => {
    let countdown = null;
    if (isEmergencyStopped) {
      setEmergencyStopCountdown(3);
      countdown = setInterval(() => {
        setEmergencyStopCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setEmergencyStopCountdown(0);
    }

    return () => {
      if (countdown) {
        clearInterval(countdown);
      }
    };
  }, [isEmergencyStopped]);

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

        {/* 紧急停止控制 */}
        {isEmergencyStopped && (
          <div className="control-group emergency-stop-group">
            <label className="control-label large emergency">紧急停止</label>
            <div className="emergency-stop-controls">
              <div className="emergency-stop-status">
                <span className="emergency-stop-icon">⚠️</span>
                <span className="emergency-stop-text">系统已紧急停止</span>
              </div>
              {emergencyStopCountdown > 0 && (
                <div className="emergency-stop-countdown">
                  <span className="countdown-text">自动重置倒计时:</span>
                  <span className="countdown-value">{emergencyStopCountdown}秒</span>
                </div>
              )}
              <button 
                onClick={onResetEmergencyStop}
                className="control-btn emergency-reset"
              >
                立即重置
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedControls; 