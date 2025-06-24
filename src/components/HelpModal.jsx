import React from 'react';
import { t } from '../config/i18n';
import './HelpModal.css';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2 className="help-modal-title">
            <span className="help-icon">❓</span>
            {t('helpTitle')}
          </h2>
          <button className="help-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="help-modal-content">
          <div className="help-section">
            <h3 className="help-section-title">{t('author')}</h3>
            <div className="author-info">
              <p className="author-name">{t('authorName')}</p>
              <p className="author-email">{t('authorEmail')}</p>
            </div>
          </div>

          <div className="help-section">
            <h3 className="help-section-title">{t('speedControl')}</h3>
            
            <div className="key-instructions">
              <div className="key-item">
                <span className="key-icon">⬆️</span>
                <span className="key-text">{t('speedControlUp')}</span>
              </div>
              <div className="key-item">
                <span className="key-icon">⬇️</span>
                <span className="key-text">{t('speedControlDown')}</span>
              </div>
              <div className="key-item">
                <span className="key-icon">🔄</span>
                <span className="key-text">{t('speedControlRelease')}</span>
              </div>
            </div>

            <h4 className="help-subsection-title">{t('tailgateControl')}</h4>
            <div className="key-instructions">
              <div className="key-item">
                <span className="key-icon">O</span>
                <span className="key-text">{t('tailgateControlOpen')}</span>
              </div>
              <div className="key-item">
                <span className="key-icon">C</span>
                <span className="key-text">{t('tailgateControlClose')}</span>
              </div>
            </div>

            <h4 className="help-subsection-title">{t('emergencyControl')}</h4>
            <div className="key-instructions">
              <div className="key-item">
                <span className="key-icon">␣</span>
                <span className="key-text">{t('emergencyControlSpace')}</span>
              </div>
            </div>
          </div>

          <div className="help-section">
            <h3 className="help-section-title">{t('systemDescription')}</h3>
            <p className="help-text">
              {t('systemDescriptionText')}
            </p>
          </div>

          <div className="help-section">
            <h3 className="help-section-title">{t('features')}</h3>
            <ul className="help-features">
              <li>{t('realTimePhysics')}</li>
              <li>{t('smoothAnimation')}</li>
              <li>{t('realTimeStatus')}</li>
              <li>{t('emergencyStop')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 