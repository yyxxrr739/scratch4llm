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
  onMoveByAngle,
  onPause,
  onResume,
  onStop,
  onEmergencyStop,
  onResetEmergencyStop
}) => {
  const [targetAngle, setTargetAngle] = useState(0);
  const [deltaAngle, setDeltaAngle] = useState(10);
  const [speed, setSpeed] = useState(currentSpeed);

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    onSpeedChange(newSpeed);
  };

  const handleMoveToAngle = () => {
    if (targetAngle >= 0 && targetAngle <= 95) {
      onMoveToAngle(targetAngle, speed);
    }
  };

  const handleMoveByAngle = (direction) => {
    const newAngle = currentAngle + (direction === 'positive' ? deltaAngle : -deltaAngle);
    if (newAngle >= 0 && newAngle <= 95) {
      onMoveByAngle(direction === 'positive' ? deltaAngle : -deltaAngle, speed);
    }
  };

  return (
    <div className="advanced-controls">
      <div className="control-section">
        <h3 className="section-title">高级控制</h3>
        
        {/* 速度控制 */}
        <div className="control-group">
          <label className="control-label">速度控制</label>
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
          <label className="control-label">角度控制</label>
          <div className="angle-control">
            <div className="angle-input-group">
              <input
                type="number"
                min="0"
                max="95"
                value={targetAngle}
                onChange={(e) => setTargetAngle(parseFloat(e.target.value) || 0)}
                className="angle-input"
                placeholder="目标角度"
                disabled={isEmergencyStopped}
              />
              <button 
                onClick={handleMoveToAngle}
                disabled={isAnimating || isEmergencyStopped}
                className="control-btn small"
              >
                移动到
              </button>
            </div>
            
            <div className="angle-presets">
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

        {/* 相对角度移动 */}
        <div className="control-group">
          <label className="control-label">相对移动</label>
          <div className="relative-move-control">
            <div className="delta-angle-input">
              <input
                type="number"
                min="1"
                max="45"
                value={deltaAngle}
                onChange={(e) => setDeltaAngle(parseFloat(e.target.value) || 10)}
                className="angle-input small"
                placeholder="角度"
                disabled={isEmergencyStopped}
              />
              <span className="unit">°</span>
            </div>
            
            <div className="move-buttons">
              <button 
                onClick={() => handleMoveByAngle('negative')}
                disabled={isAnimating || isEmergencyStopped}
                className="control-btn small"
              >
                ← 减少
              </button>
              <button 
                onClick={() => handleMoveByAngle('positive')}
                disabled={isAnimating || isEmergencyStopped}
                className="control-btn small"
              >
                增加 →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 运动控制 */}
      <div className="control-section">
        <h3 className="section-title">运动控制</h3>
        
        <div className="motion-controls">
          <button 
            onClick={onPause}
            disabled={!isAnimating || isEmergencyStopped}
            className="control-btn warning"
          >
            <span className="btn-icon">⏸️</span>
            暂停
          </button>
          
          <button 
            onClick={onResume}
            disabled={isAnimating || isEmergencyStopped}
            className="control-btn success"
          >
            <span className="btn-icon">▶️</span>
            恢复
          </button>
          
          <button 
            onClick={onStop}
            disabled={!isAnimating || isEmergencyStopped}
            className="control-btn secondary"
          >
            <span className="btn-icon">⏹️</span>
            停止
          </button>
          
          <button 
            onClick={onEmergencyStop}
            disabled={isEmergencyStopped}
            className="control-btn danger"
          >
            <span className="btn-icon">🛑</span>
            紧急停止
          </button>
          
          {isEmergencyStopped && (
            <button 
              onClick={onResetEmergencyStop}
              className="control-btn reset"
            >
              <span className="btn-icon">🔄</span>
              重置紧急停止
            </button>
          )}
        </div>
      </div>

      {/* 状态显示 */}
      <div className="status-section">
        <h3 className="section-title">状态信息</h3>
        
        <div className="status-display">
          <div className="status-item">
            <span className="status-label">当前角度:</span>
            <span className="status-value">{Math.round(currentAngle)}°</span>
          </div>
          
          <div className="status-item">
            <span className="status-label">当前速度:</span>
            <span className="status-value">{currentSpeed.toFixed(1)}x</span>
          </div>
          
          <div className="status-item">
            <span className="status-label">动画状态:</span>
            <span className={`status-indicator ${isAnimating ? 'animating' : 'idle'}`}>
              <span className="status-dot"></span>
              {isAnimating ? '进行中' : '空闲'}
            </span>
          </div>
          
          {/* 紧急停止状态显示 */}
          {isEmergencyStopped && (
            <div className="status-item">
              <span className="status-label">尾门状态:</span>
              <span className="status-indicator emergency">
                <span className="status-dot"></span>
                紧急停止
              </span>
            </div>
          )}
          
          {/* 紧急停止过程中状态显示 */}
          {isEmergencyStopInProcess && (
            <div className="status-item">
              <span className="status-label">尾门状态:</span>
              <span className="status-indicator emergency-process">
                <span className="status-dot"></span>
                紧急停止中...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedControls; 