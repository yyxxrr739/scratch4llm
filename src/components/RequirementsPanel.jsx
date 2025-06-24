import React, { useState, useEffect, useRef } from 'react';
import ServiceManager from '../services/ServiceManager.js';
import './RequirementsPanel.css';

const RequirementsPanel = ({ isDemoMode = false }) => {
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [visibleRequirements, setVisibleRequirements] = useState([]);
  const serviceManagerRef = useRef(null);

  // 需求数据
  const requirements = [
    {
      id: 'Req_1',
      title: '开门需求',
      description: '当开门按键按下时，如果当前尾门状态为关闭 且 车速小于5km/h 且 尾门角度处于0度到94度之间，则执行开门动作。',
      details: [
        '前提条件：',
        '• 尾门状态：关闭',
        '• 车速：< 5 km/h',
        '• 尾门角度：0° - 94°',
        '• 系统状态：就绪',
        '• 无障碍物检测',
        '',
        '执行动作：',
        '• 状态机转换到opening状态',
        '• 调用运动控制服务开启尾门',
        '• 监控运动完成事件',
        '• 完成后转换到opened状态'
      ]
    },
    {
      id: 'Req_2',
      title: '关门需求',
      description: '当关门按键按下时，如果当前尾门状态为开启 且 无障碍物检测，则执行关门动作。',
      details: [
        '前提条件：',
        '• 尾门状态：开启',
        '• 无障碍物检测',
        '• 系统状态：就绪',
        '• 非紧急停止状态',
        '',
        '执行动作：',
        '• 状态机转换到closing状态',
        '• 调用运动控制服务关闭尾门',
        '• 监控运动完成事件',
        '• 完成后转换到closed状态',
        '',
        '安全监控：',
        '• 实时检测障碍物',
        '• 发现障碍物时立即紧急停止'
      ]
    },
    {
      id: 'Req_3',
      title: '紧急停止需求',
      description: '当检测到安全风险时（如车速过高、障碍物、硬件故障），立即执行紧急停止动作。',
      details: [
        '触发条件：',
        '• 车速 > 5 km/h 且尾门正在开启',
        '• 检测到障碍物',
        '• 硬件故障（电机故障、传感器故障等）',
        '• 手动紧急停止请求',
        '',
        '执行动作：',
        '• 立即停止所有运动',
        '• 状态机转换到emergency_stop状态',
        '• 记录紧急停止原因',
        '• 禁用所有控制输入',
        '',
        '恢复条件：',
        '• 手动重置紧急停止',
        '• 确认安全状态',
        '• 系统重新初始化'
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
      <h3 className="requirements-title">需求规范</h3>
      <div className="requirements-buttons">
        {visibleRequirements.length === 0 ? (
          <div className="no-requirements-message">
            等待动作执行...
          </div>
        ) : (
          visibleRequirements.map((req) => (
            <button
              key={`${req.id}-${req.timestamp}`}
              className="requirement-button"
              onClick={() => handleRequirementClick(req)}
              title={`点击查看${req.title}详细描述`}
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