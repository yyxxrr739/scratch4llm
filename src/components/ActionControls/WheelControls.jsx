import React from 'react';
import './ActionControls.css';

const WheelControls = ({ 
  wheelSpeed = 0,
  currentSpeedKmh = 0
}) => {
  return (
    <div className="wheel-controls">
      <div className="control-section">
        <h3 className="section-title">车轮控制</h3>
        
        <div className="keyboard-controls">
          <div className="control-header">
            <span className="control-label">键盘控制</span>
            <span className="speed-value">{currentSpeedKmh.toFixed(1)} km/h</span>
          </div>
          
          <div className="key-instructions">
            <div className="key-item">
              <span className="key-icon">⬆️</span>
              <span className="key-text">按住上键：5rad/s²加速至30km/h</span>
            </div>
            <div className="key-item">
              <span className="key-icon">⬇️</span>
              <span className="key-text">按住下键：10rad/s²减速至0</span>
            </div>
            <div className="key-item">
              <span className="key-icon">🔄</span>
              <span className="key-text">松开按键：2rad/s²自然减速至0</span>
            </div>
          </div>
        </div>

        <div className="wheel-info">
          <div className="info-item">
            <span className="info-icon">🔄</span>
            <span className="info-text">
              {currentSpeedKmh > 0 ? '车轮正在旋转' : '车轮已停止'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-icon">⚡</span>
            <span className="info-text">当前速度: {currentSpeedKmh.toFixed(1)} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelControls; 