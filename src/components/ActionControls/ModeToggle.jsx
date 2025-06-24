import React from 'react';
import { t } from '../../config/i18n';
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
      alert(t('executingOperation'));
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
              title={isAnimating || isExecuting ? t('executingOperationCannotSwitch') : t('switchToNormalMode')}
            >
              <span className="btn-icon"></span>
              {t('normalMode')}
            </button>
            
            <button
              onClick={() => handleModeToggle(true)}
              disabled={isAnimating || isExecuting}
              className={`control-btn mode-btn ${isDemoMode ? 'active' : 'inactive'}`}
              title={isAnimating || isExecuting ? t('executingOperationCannotSwitch') : t('switchToDemoMode')}
            >
              <span className="btn-icon"></span>
              {t('demoMode')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeToggle; 