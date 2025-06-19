import React from 'react';
import './ActionControls.css';

const BasicControls = ({ 
  isOpen, 
  isAnimating, 
  currentAngle, 
  onOpen, 
  onClose, 
  onReset 
}) => {
  return (
    <div className="basic-controls">
      <div className="control-section">
        <h3 className="section-title">基础控制</h3>
        
        <div className="control-buttons">
          <button 
            onClick={onOpen}
            disabled={isAnimating || isOpen}
            className={`control-btn primary ${isOpen ? 'disabled' : ''}`}
          >
            <span className="btn-icon">🚪</span>
            开启尾门
          </button>
          
          <button 
            onClick={onClose}
            disabled={isAnimating || !isOpen}
            className={`control-btn secondary ${!isOpen ? 'disabled' : ''}`}
          >
            <span className="btn-icon">🔒</span>
            关闭尾门
          </button>
          
          {isOpen && (
            <button 
              onClick={onReset}
              disabled={isAnimating}
              className="control-btn reset"
            >
              <span className="btn-icon">🔄</span>
              重置
            </button>
          )}
        </div>
      </div>

      <div className="status-section">
        <h3 className="section-title">状态信息</h3>
        
        <div className="status-display">
          <div className="status-item">
            <span className="status-label">当前角度:</span>
            <span className="status-value">{Math.round(currentAngle)}°</span>
          </div>
          
          <div className="status-item">
            <span className="status-label">状态:</span>
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
  );
};

export default BasicControls; 