import React, { useState, useEffect, useRef } from 'react';
import ServiceManager from '../services/ServiceManager.js';
import { t } from '../config/i18n';
import './RequirementsPanel.css';

const RequirementsPanel = ({ isDemoMode = false }) => {
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [visibleRequirements, setVisibleRequirements] = useState([]);
  const serviceManagerRef = useRef(null);

  // 需求数据
  const requirements = [
    {
      id: 'Req_1',
      title: 'Open Door Requirement',
      description: 'When the open door button is pressed, if the current tailgate status is closed AND vehicle speed is less than 5km/h AND tailgate angle is between 0 and 94 degrees, then execute the open door action.',
      details: [
        'Prerequisites:',
        '• Tailgate Status: Closed',
        '• Vehicle Speed: < 5 km/h',
        '• Tailgate Angle: 0° - 94°',
        '• System Status: Ready',
        '• No Obstacle Detection',
        '',
        'Execution Actions:',
        '• State machine transitions to opening state',
        '• Call motion control service to open tailgate',
        '• Monitor motion completion events',
        '• Transition to opened state upon completion'
      ]
    },
    {
      id: 'Req_2',
      title: 'Close Door Requirement',
      description: 'When the close door button is pressed, if the current tailgate status is open AND no obstacle is detected, then execute the close door action.',
      details: [
        'Prerequisites:',
        '• Tailgate Status: Open',
        '• No Obstacle Detection',
        '• System Status: Ready',
        '• Not in Emergency Stop State',
        '',
        'Execution Actions:',
        '• State machine transitions to closing state',
        '• Call motion control service to close tailgate',
        '• Monitor motion completion events',
        '• Transition to closed state upon completion',
        '',
        'Safety Monitoring:',
        '• Real-time obstacle detection',
        '• Emergency stop immediately when obstacle is detected'
      ]
    },
    {
      id: 'Req_3',
      title: 'Emergency Stop Requirement',
      description: 'When safety risks are detected (such as high vehicle speed, obstacles, hardware failures), immediately execute emergency stop action.',
      details: [
        'Trigger Conditions:',
        '• Vehicle Speed > 5 km/h AND tailgate is opening',
        '• Obstacle Detected',
        '• Hardware Failure (motor failure, sensor failure, etc.)',
        '• Manual Emergency Stop Request',
        '',
        'Execution Actions:',
        '• Immediately stop all motion',
        '• State machine transitions to emergency_stop state',
        '• Record emergency stop reason',
        '• Disable all control inputs',
        '',
        'Recovery Conditions:',
        '• Manual emergency stop reset',
        '• Confirm safe status',
        '• System re-initialization'
      ]
    }
  ];

  // 动作类型到需求ID的映射
  const actionToRequirementMap = {
    'open': 'Req_1',
    'close': 'Req_2',
    'emergency_stop': 'Req_3'
  };

  // 初始化ServiceManager并监听事件
  useEffect(() => {
    if (isDemoMode) return;

    // 初始化ServiceManager
    if (!serviceManagerRef.current) {
      serviceManagerRef.current = new ServiceManager();
    }

    // 获取正常模式控制器
    const normalController = serviceManagerRef.current.getService('normalController');
    
    if (normalController) {
      // 监听动作执行事件
      const unsubscribe = normalController.on('controller:actionExecuted', (eventData) => {
        const { action } = eventData;
        const requirementId = actionToRequirementMap[action];
        
        if (requirementId) {
          // 查找对应的需求
          const requirement = requirements.find(req => req.id === requirementId);
          if (requirement) {
            // 添加时间戳用于排序
            const requirementWithTimestamp = {
              ...requirement,
              timestamp: Date.now(),
              eventData
            };
            
            setVisibleRequirements(prev => {
              // 检查是否已经存在相同的需求ID
              const existingIndex = prev.findIndex(req => req.id === requirementId);
              if (existingIndex !== -1) {
                // 如果已存在，更新为最新的事件
                const updated = [...prev];
                updated[existingIndex] = requirementWithTimestamp;
                return updated;
              } else {
                // 如果不存在，添加到列表末尾
                return [...prev, requirementWithTimestamp];
              }
            });
          }
        }
      });

      // 清理函数
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [isDemoMode]);

  const handleRequirementClick = (requirement) => {
    setSelectedRequirement(requirement);
  };

  const handleCloseModal = () => {
    setSelectedRequirement(null);
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // 只在正常模式下显示
  if (isDemoMode) {
    return null;
  }

  return (
    <div className="requirements-panel">
      <h3 className="requirements-title">{t('requirements')}</h3>
      <div className="requirements-buttons">
        {visibleRequirements.length === 0 ? (
          <div className="no-requirements-message">
            {t('waitingForAction')}
          </div>
        ) : (
          visibleRequirements.map((req) => (
            <button
              key={`${req.id}-${req.timestamp}`}
              className="requirement-button"
              onClick={() => handleRequirementClick(req)}
              title={`${t('clickToViewDetails')} ${req.title}`}
            >
              {req.id}
            </button>
          ))
        )}
      </div>

      {/* 需求详情弹窗 */}
      {selectedRequirement && (
        <div className="requirement-modal-overlay" onClick={handleModalClick}>
          <div className="requirement-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {selectedRequirement.id}: {selectedRequirement.title}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="requirement-description">
                {selectedRequirement.description}
              </div>
              <div className="requirement-details">
                {selectedRequirement.details.map((detail, index) => (
                  <div key={index} className="detail-line">
                    {detail}
                  </div>
                ))}
              </div>
              {/* 显示触发事件信息 */}
              {selectedRequirement.eventData && (
                <div className="event-info">
                  <h4>触发事件</h4>
                  <div className="event-details">
                    <div className="detail-line">
                      动作类型: {selectedRequirement.eventData.action}
                    </div>
                    <div className="detail-line">
                      执行时间: {new Date(selectedRequirement.eventData.timestamp).toLocaleString()}
                    </div>
                    {selectedRequirement.eventData.request && (
                      <div className="detail-line">
                        请求类型: {selectedRequirement.eventData.request.type}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementsPanel; 