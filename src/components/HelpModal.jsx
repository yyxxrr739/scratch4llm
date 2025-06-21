import React from 'react';
import './HelpModal.css';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2 className="help-modal-title">
            <span className="help-icon">❓</span>
            帮助说明
          </h2>
          <button className="help-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="help-modal-content">
          <div className="help-section">
            <h3 className="help-section-title">控制说明</h3>
            
            <div className="key-instructions">
              <div className="key-item">
                <span className="key-icon">⬆️</span>
                <span className="key-text">按住上键：加速，最高30km/h</span>
              </div>
              <div className="key-item">
                <span className="key-icon">⬇️</span>
                <span className="key-text">按住下键：减速</span>
              </div>
              <div className="key-item">
                <span className="key-icon">🔄</span>
                <span className="key-text">松开按键：自然减速</span>
              </div>
            </div>
          </div>

          <div className="help-section">
            <h3 className="help-section-title">系统说明</h3>
            <p className="help-text">
              这是一个基于原子服务的2D可视化动画系统，展示汽车尾门的复杂动作编排。
              系统使用物理引擎模拟真实的车辆运动，包括加速、减速和自然减速等效果。
            </p>
          </div>

          <div className="help-section">
            <h3 className="help-section-title">功能特性</h3>
            <ul className="help-features">
              <li>实时物理模拟</li>
              <li>平滑的动画效果</li>
              <li>状态实时显示</li>
              <li>紧急停止功能</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 