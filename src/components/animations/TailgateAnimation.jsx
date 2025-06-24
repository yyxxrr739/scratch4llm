import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTailgateService } from '../../hooks/useTailgateService.js';
import { useActionOrchestrator } from '../../hooks/useActionOrchestrator.js';
import { t } from '../../config/i18n';
import AdvancedControls from '../ActionControls/AdvancedControls.jsx';
import ScenarioControls from '../ActionControls/ScenarioControls.jsx';
import ServiceManager from '../../services/ServiceManager.js';
import RequirementsPanel from '../RequirementsPanel.jsx';
import './TailgateAnimation.css';

const TailgateAnimation = ({ onStateChange, isDemoMode = false }) => {
  const [activeControlTab, setActiveControlTab] = useState('advanced');
  const [isObstacleDetected, setIsObstacleDetected] = useState(false);
  const serviceManagerRef = useRef(null);
  
  // 使用尾门服务Hook
  const {
    isInitialized,
    status,
    error,
    initialize,
    cleanup,
    actions,
    isOpen,
    isClosed,
    isAnimating,
    currentAngle,
    currentSpeed,
    currentAction,
    animationProgress,
    isEmergencyStopped
  } = useTailgateService();

  // 从status中获取isPaused状态
  const isPaused = status.isPaused || false;

  // 使用编排器Hook
  const {
    isExecuting,
    isPaused: orchestratorPaused,
    currentAction: orchestratorAction,
    actionProgress,
    loopInfo,
    error: orchestratorError,
    executeScenario,
    controls: orchestratorControls
  } = useActionOrchestrator();

  // 监听紧急停止自动重置事件
  useEffect(() => {
    const handleEmergencyStopAutoReset = () => {
      setIsObstacleDetected(false);
    };

    // 获取actionService并监听事件
    const actionService = actions.getActionService ? actions.getActionService() : null;
    if (actionService) {
      const unsubscribe = actionService.on('tailgate:emergencyStopAutoReset', handleEmergencyStopAutoReset);
      
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [actions]);

  // 初始化ServiceManager
  useEffect(() => {
    if (!serviceManagerRef.current) {
      serviceManagerRef.current = new ServiceManager();
    }
  }, []);

  // 初始化服务
  useEffect(() => {
    const tailgateElement = document.getElementById('tailgate-element');
    if (tailgateElement && !isInitialized) {
      initialize(tailgateElement);
      
      // 建立MotionControlService和TailgateActionService的连接
      if (serviceManagerRef.current && serviceManagerRef.current.setupMotionControlIntegration) {
        const tailgateActionService = actions.getActionService ? actions.getActionService() : null;
        if (tailgateActionService) {
          serviceManagerRef.current.setupMotionControlIntegration(tailgateActionService);
        }
      }
    }
  }, [isInitialized, initialize, actions]);

  // 向父组件传递状态信息
  useEffect(() => {
    if (onStateChange) {
      // 确定当前动作类型
      let currentActionType = null;
      if (isAnimating) {
        if (status.currentAction === 'opening') {
          currentActionType = t('opening');
        } else if (status.currentAction === 'closing') {
          currentActionType = t('closing');
        } else if (status.currentAction === 'moving') {
          currentActionType = t('moving');
        } else if (status.currentAction === 'paused') {
          currentActionType = t('paused');
        } else if (status.currentAction === 'resumed') {
          currentActionType = t('resuming');
        }
      }

      onStateChange({
        isOpen,
        isAnimating,
        currentAngle,
        currentSpeed,
        isEmergencyStopped,
        isEmergencyStopInProcess: status.isEmergencyStopInProcess,
        isInitialized,
        isExecuting,
        isPaused,
        currentAction: currentActionType ? { action: currentActionType } : null,
        actionProgress,
        loopInfo,
        isObstacleDetected
      });
    }
  }, [isOpen, isAnimating, currentAngle, currentSpeed, isEmergencyStopped, status.isEmergencyStopInProcess, status.currentAction, isInitialized, isExecuting, isPaused, actionProgress, loopInfo, isObstacleDetected, onStateChange]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // 键盘控制处理 - 简化为直接调用actions
  useEffect(() => {
    const handleKeyDown = (event) => {
      // 如果正在执行场景，忽略键盘输入
      if (isExecuting) {
        return;
      }

      switch (event.code) {
        case 'KeyO':
          event.preventDefault();
          if (!isOpen && !isAnimating && !isEmergencyStopped) {
            actions.startOpen(currentSpeed);
          }
          break;
        case 'KeyC':
          event.preventDefault();
          if (isOpen && !isAnimating && !isEmergencyStopped) {
            actions.startClose(currentSpeed);
          }
          break;
        case 'Space':
          event.preventDefault();
          // 空格键触发紧急停止（仅在未处于紧急停止状态时）
          if (!isEmergencyStopped) {
            // 触发紧急停止
            actions.emergencyStop();
            setIsObstacleDetected(true);
            // 停止编排器的运动序列
            orchestratorControls.stop();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isAnimating, isExecuting, isEmergencyStopped, actions, currentSpeed]);

  // 高级控制事件处理
  const handleSpeedChange = (speed) => {
    actions.setSpeed(speed);
  };

  const handleMoveToAngle = (angle, speed) => {
    actions.moveToAngle(angle, speed);
  };

  const handleMoveByAngle = (deltaAngle, speed) => {
    actions.moveByAngle(deltaAngle, speed);
  };

  // 重置紧急停止
  const handleResetEmergencyStop = () => {
    actions.resetEmergencyStop();
    setIsObstacleDetected(false);
  };

  // 编排器事件处理
  const handleExecuteScenario = async (scenarioId) => {
    await executeScenario(scenarioId, actions);
  };

  const handleOrchestratorPause = () => {
    orchestratorControls.pause();
  };

  const handleOrchestratorResume = () => {
    orchestratorControls.resume();
  };

  const handleOrchestratorStop = () => {
    orchestratorControls.stop();
  };

  const handleOrchestratorClear = () => {
    orchestratorControls.clear();
  };

  // 控制标签页
  const controlTabs = [
    { id: 'advanced', name: '位置控制', icon: '⚙️' },
    { id: 'scenario', name: '场景控制', icon: '🎬' }
  ];

  const renderControlContent = () => {
    switch (activeControlTab) {
      case 'advanced':
        return (
          <AdvancedControls
            isAnimating={isAnimating}
            isPaused={isPaused}
            currentAngle={currentAngle}
            currentSpeed={currentSpeed}
            isEmergencyStopped={isEmergencyStopped}
            onSpeedChange={handleSpeedChange}
            onMoveToAngle={handleMoveToAngle}
            onResetEmergencyStop={handleResetEmergencyStop}
          />
        );
      
      case 'scenario':
        return (
          <ScenarioControls
            isExecuting={isExecuting}
            isPaused={orchestratorPaused}
            currentAction={orchestratorAction}
            actionProgress={actionProgress}
            loopInfo={loopInfo}
            onExecuteScenario={handleExecuteScenario}
            onPause={handleOrchestratorPause}
            onResume={handleOrchestratorResume}
            onStop={handleOrchestratorStop}
            onClear={handleOrchestratorClear}
          />
        );
      
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <h3>初始化错误</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>重新加载</button>
      </div>
    );
  }

  return (
    <div className="tailgate-controls">
      {/* 仅在演示模式下显示控制标签页 */}
      {isDemoMode && (
        <>
          {/* 控制标签页 */}
          <div className="control-tabs">
            {controlTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveControlTab(tab.id)}
                className={`control-tab ${activeControlTab === tab.id ? 'active' : ''}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-name">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* 控制内容 */}
          <div className="control-content">
            {renderControlContent()}
          </div>
        </>
      )}

      {/* 在正常模式下显示需求面板 */}
      {!isDemoMode && (
        <div className="control-content">
          <RequirementsPanel isDemoMode={isDemoMode} />
        </div>
      )}

      {/* 错误显示 */}
      {(error || orchestratorError) && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error || orchestratorError}</span>
        </div>
      )}
    </div>
  );
};

export default TailgateAnimation; 