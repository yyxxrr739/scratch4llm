import React from 'react';
import './ActionControls.css';

const ModeToggle = ({ 
  isDemoMode, 
  onModeToggle,
  isAnimating,
  isExecuting 
}) => {
  const handleModeToggle = (targetMode) => {
    // 如果正在执行动画或场景，不允许切换模式
    if (isAnimating || isExecuting) {
      alert('当前正在执行操作，请等待完成后再切换模式');
      return;
    }
    
    // 如果点击的是当前模式，不做任何操作
    if (targetMode === isDemoMode) {
      return;
    }
    
    onModeToggle();
  };

  return (
    <div className="mode-toggle-section">
      <div className="control-section">
        <div className="mode-toggle-container">
          <div className="mode-buttons">
            <button
              onClick={() => handleModeToggle(false)}
              disabled={isAnimating || isExecuting}
              className={`control-btn mode-btn ${!isDemoMode ? 'active' : 'inactive'}`}
              title={isAnimating || isExecuting ? '正在执行操作，无法切换模式' : '切换到正常模式'}
            >
              <span className="btn-icon">🚗</span>
              正常模式
            </button>
            
            <button
              onClick={() => handleModeToggle(true)}
              disabled={isAnimating || isExecuting}
              className={`control-btn mode-btn ${isDemoMode ? 'active' : 'inactive'}`}
              title={isAnimating || isExecuting ? '正在执行操作，无法切换模式' : '切换到演示模式'}
            >
              <span className="btn-icon">🎬</span>
              演示模式
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeToggle; 