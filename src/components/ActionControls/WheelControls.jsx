import React from 'react';
import './ActionControls.css';

const WheelControls = ({ 
  currentSpeedKmh = 0,
  currentAngularVelocity = 0,
  currentRotation = 0,
  resetPhysics
}) => {
  return (
    <div className="wheel-controls">
      <div className="control-section">
        <h3 className="section-title">物理引擎控制</h3>
        
        <div className="keyboard-controls">
          <div className="control-header">
            <span className="control-label">键盘控制</span>
            <span className="speed-value">{currentSpeedKmh.toFixed(1)} km/h</span>
          </div>
          
          <div className="key-instructions">
            <div className="key-item">
              <span className="key-icon">⬆️</span>
              <span className="key-text">按住上键：加速，最高30km/h</span>
            </div>
            <div className="key-item">
              <span className="key-icon">⬇️</span>
              <span className="key-text">按住下键：减速</span>
            </div>
            <div className="key-item">
              <span className="key-icon">🔄</span>
              <span className="key-text">松开按键：自然减速</span>
            </div>
          </div>
        </div>

        <div className="reset-control">
          <div className="reset-buttons">
            <button 
              className="reset-btn stop-btn"
              onClick={() => resetPhysics(false)}
              title="停止运动但保持当前位置"
            >
              ⏹️ 停止运动
            </button>
            <button 
              className="reset-btn full-reset-btn"
              onClick={() => resetPhysics(true)}
              title="完全重置到初始位置"
            >
              🔄 完全重置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelControls; 