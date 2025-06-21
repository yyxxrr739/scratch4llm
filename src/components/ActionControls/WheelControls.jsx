import React from 'react';
import './ActionControls.css';

const WheelControls = ({ 
  currentSpeedKmh = 0,
  currentAngularVelocity = 0,
  currentRotation = 0,
  resetPhysics,
  tailgateState = {}
}) => {
  const { isOpen, isAnimating, currentAngle, currentSpeed, isEmergencyStopped } = tailgateState;

  return (
    <div className="wheel-controls">
      <div className="controls-layout">
        {/* 状态信息 */}
        <div className="control-section">
          <h3 className="section-title compact">状态信息</h3>
          
          <div className="status-display">
            {/* 车辆状态 */}
            <div className="status-item">
              <span className="status-label">车速:</span>
              <span className="status-value">{currentSpeedKmh.toFixed(1)} km/h</span>
            </div>
            
            {/* 尾门状态 */}
            <div className="status-item">
              <span className="status-label">尾门角度:</span>
              <span className="status-value">{Math.round(currentAngle || 0)}°</span>
            </div>
            <div className="status-item">
              <span className="status-label">尾门状态:</span>
              <span className={`status-indicator ${isOpen ? 'open' : 'closed'}`}>
                <span className="status-dot"></span>
                {isOpen ? '已开启' : '已关闭'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">动画:</span>
              <span className={`status-indicator ${isAnimating ? 'animating' : 'idle'}`}>
                <span className="status-dot"></span>
                {isAnimating ? '进行中' : '空闲'}
              </span>
            </div>
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
  );
};

export default WheelControls; 