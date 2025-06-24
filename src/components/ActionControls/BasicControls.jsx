import React from 'react';
import { t } from '../../config/i18n';
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
      alert(t('tailgateAlreadyOpen'));
      return;
    }
    onOpen();
  };

  const handleClose = () => {
    if (!isOpen) {
      alert(t('tailgateAlreadyClosed'));
      return;
    }
    onClose();
  };

  return (
    <div className="basic-controls">
      <div className="control-section">
        <h3 className="section-title">
          <span className="btn-icon">🚗</span>
          {t('basicControls')}
        </h3>
        
        <div className="control-group">
          <label className="control-label large">{t('tailgateOperation')}</label>
          <div className="control-buttons">
            <button 
              onClick={handleOpen}
              disabled={isAnimating || isEmergencyStopped || isOpen}
              className="control-btn primary large"
              title={isOpen ? t('tailgateAlreadyOpen') : t('openTailgate')}
            >
              <span className="btn-icon">🔓</span>
              {t('openTailgate')}
            </button>
            
            <button 
              onClick={handleClose}
              disabled={isAnimating || isEmergencyStopped || !isOpen}
              className="control-btn secondary large"
              title={!isOpen ? t('tailgateAlreadyClosed') : t('closeTailgate')}
            >
              <span className="btn-icon">🔒</span>
              {t('closeTailgate')}
            </button>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label large">{t('safetyControl')}</label>
          <div className="control-buttons">
            <button 
              onClick={onStop}
              disabled={!isAnimating || isEmergencyStopped}
              className="control-btn warning"
              title={t('stopCurrentAction')}
            >
              <span className="btn-icon">⏹️</span>
              {t('stop')}
            </button>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label large">{t('statusInfo')}</label>
          <div className="status-display">
            <div className="status-item">
              <span className="status-label">{t('currentAngle')}:</span>
              <span className="status-value">{Math.round(currentAngle || 0)}°</span>
            </div>
            <div className="status-item">
              <span className="status-label">{t('tailgateStatus')}:</span>
              <span className={`status-indicator ${isOpen ? 'open' : 'closed'}`}>
                <span className="status-dot"></span>
                {isOpen ? t('open') : t('closed')}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">{t('runningStatus')}:</span>
              <span className={`status-indicator ${isAnimating ? 'animating' : 'idle'}`}>
                <span className="status-dot"></span>
                {isAnimating ? t('running') : t('idle')}
              </span>
            </div>
            {isEmergencyStopped && (
              <div className="status-item">
                <span className="status-label">{t('safetyStatus')}:</span>
                <span className="status-indicator emergency">
                  <span className="status-dot"></span>
                  {t('emergencyStop')}
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