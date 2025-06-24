import { useState, useEffect } from 'react';
import { getCurrentLanguage, setLanguage } from '../config/i18n';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  
  const changeLanguage = (language) => {
    setLanguage(language);
    setCurrentLanguage(language);
    // 触发页面重新渲染
    window.location.reload();
  };
  
  return {
    currentLanguage,
    changeLanguage
  };
}; 