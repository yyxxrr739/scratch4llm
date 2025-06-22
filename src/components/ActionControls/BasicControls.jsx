import React from 'react';
import './ActionControls.css';

const BasicControls = ({
  isAnimating,
  currentAngle,
  isOpen,
  isEmergencyStopped,
  onOpen,
  onClose,
  onStop
}) => {
  const handleOpen = () => {
    if (isOpen) {
      alert('尾门已经处于开启状态');
      return;
    }
    onOpen();
  };

  const handleClose = () => {
    if (!isOpen) {
      alert('尾门已经处于关闭状态');
      return;
    }
    onClose();
  };

  return (
    <div className="basic-controls">
      <div className="control-section">
        <h3 className="section-title">
          <span className="btn-icon">🚗</span>
          基础控制
        </h3>
        
        <div className="control-group">
          <label className="control-label large">尾门操作</label>
          <div className="control-buttons">
            <button 
              onClick={handleOpen}
              disabled={isAnimating || isEmergencyStopped || isOpen}
              className="control-btn primary large"
              title={isOpen ? '尾门已开启' : '开启尾门'}
            >
              <span className="btn-icon">🔓</span>
              开启尾门
            </button>
            
            <button 
              onClick={handleClose}
              disabled={isAnimating || isEmergencyStopped || !isOpen}
              className="control-btn secondary large"
              title={!isOpen ? '尾门已关闭' : '关闭尾门'}
            >
              <span className="btn-icon">🔒</span>
              关闭尾门
            </button>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label large">安全控制</label>
          <div className="control-buttons">
            <button 
              onClick={onStop}
              disabled={!isAnimating || isEmergencyStopped}
              className="control-btn warning"
              title="停止当前动作"
            >
              <span className="btn-icon">⏹️</span>
              停止
            </button>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label large">状态信息</label>
          <div className="status-display">
            <div className="status-item">
              <span className="status-label">当前角度:</span>
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
              <span className="status-label">运行状态:</span>
              <span className={`status-indicator ${isAnimating ? 'animating' : 'idle'}`}>
                <span className="status-dot"></span>
                {isAnimating ? '运行中' : '空闲'}
              </span>
            </div>
            {isEmergencyStopped && (
              <div className="status-item">
                <span className="status-label">安全状态:</span>
                <span className="status-indicator emergency">
                  <span className="status-dot"></span>
                  紧急停止激活
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicControls; 