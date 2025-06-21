import React from 'react';
import './ActionControls.css';

const BasicControls = ({ 
  isOpen, 
  isAnimating, 
  currentAngle,
  isEmergencyStopped,
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
            disabled={isAnimating || isOpen || isEmergencyStopped}
            className={`control-btn primary ${isOpen ? 'disabled' : ''}`}
          >
            <span className="btn-icon">🚪</span>
            开启尾门
          </button>
          
          <button 
            onClick={onClose}
            disabled={isAnimating || !isOpen || isEmergencyStopped}
            className={`control-btn secondary ${!isOpen ? 'disabled' : ''}`}
          >
            <span className="btn-icon">🔒</span>
            关闭尾门
          </button>
          
          {isOpen && (
            <button 
              onClick={onReset}
              disabled={isAnimating || isEmergencyStopped}
              className="control-btn reset"
            >
              <span className="btn-icon">🔄</span>
              重置
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicControls; 