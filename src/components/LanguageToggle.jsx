import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { t } from '../config/i18n';
import './LanguageToggle.css';

const LanguageToggle = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleLanguageToggle = () => {
    const newLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    changeLanguage(newLanguage);
  };

  return (
    <button 
      className="language-toggle-button"
      onClick={handleLanguageToggle}
      title={t('switchLanguage')}
    >
      <span className="language-icon">
        {currentLanguage === 'zh' ? '🇺🇸' : '🇨🇳'}
      </span>
      <span className="language-text">
        {currentLanguage === 'zh' ? 'EN' : '中'}
      </span>
    </button>
  );
};

export default LanguageToggle; 