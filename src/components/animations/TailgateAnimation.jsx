import React, { useRef, useEffect, useState } from 'react';
import { useTailgateService } from '../../hooks/useTailgateService.js';
import { useActionOrchestrator } from '../../hooks/useActionOrchestrator.js';
import AdvancedControls from '../ActionControls/AdvancedControls.jsx';
import ScenarioControls from '../ActionControls/ScenarioControls.jsx';
import './TailgateAnimation.css';

const TailgateAnimation = ({ onStateChange }) => {
  const [activeControlTab, setActiveControlTab] = useState('advanced');
  const [isObstacleDetected, setIsObstacleDetected] = useState(false);
  
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

  // 使用编排器Hook
  const {
    isExecuting,
    isPaused,
    currentAction: orchestratorAction,
    actionProgress,
    loopInfo,
    error: orchestratorError,
    executeScenario,
    controls: orchestratorControls
  } = useActionOrchestrator();

  // 向父组件传递状态信息
  useEffect(() => {
    if (onStateChange) {
      // 确定当前动作类型
      let currentActionType = null;
      if (isAnimating) {
        if (status.currentAction === 'opening') {
          currentActionType = '开门中';
        } else if (status.currentAction === 'closing') {
          currentActionType = '关门中';
        } else if (status.currentAction === 'moving') {
          currentActionType = '移动中';
        } else if (status.currentAction === 'paused') {
          currentActionType = '已暂停';
        } else if (status.currentAction === 'resumed') {
          currentActionType = '恢复中';
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

  // 初始化服务
  useEffect(() => {
    const tailgateElement = document.getElementById('tailgate-element');
    if (tailgateElement && !isInitialized) {
      initialize(tailgateElement);
    }
  }, [isInitialized, initialize]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // 键盘控制处理
  useEffect(() => {
    const handleKeyDown = (event) => {
      // 如果正在执行场景或紧急停止，忽略键盘输入
      if (isExecuting || isEmergencyStopped) {
        return;
      }

      switch (event.code) {
        case 'KeyO':
          event.preventDefault();
          if (!isOpen && !isAnimating) {
            actions.startOpen(currentSpeed);
          }
          break;
        case 'KeyC':
          event.preventDefault();
          if (isOpen && !isAnimating) {
            actions.startClose(currentSpeed);
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

  // 障碍物检测事件处理
  const handleObstacleDetected = () => {
    setIsObstacleDetected(true);
    // 触发紧急停止
    actions.emergencyStop();
    // 停止编排器的运动序列
    orchestratorControls.stop();
  };

  const handleObstacleCleared = () => {
    setIsObstacleDetected(false);
    // 重置紧急停止状态
    actions.resetEmergencyStop();
  };

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

  const handlePause = () => {
    actions.pause();
  };

  const handleResume = () => {
    actions.resume();
  };

  const handleStop = () => {
    actions.stop();
  };

  const handleEmergencyStop = () => {
    actions.emergencyStop();
  };

  const handleResetEmergencyStop = () => {
    actions.resetEmergencyStop();
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
    { id: 'advanced', name: '高级控制', icon: '⚙️' },
    { id: 'scenario', name: '场景控制', icon: '🎬' }
  ];

  const renderControlContent = () => {
    switch (activeControlTab) {
      case 'advanced':
        return (
          <AdvancedControls
            isAnimating={isAnimating}
            currentAngle={currentAngle}
            currentSpeed={currentSpeed}
            isEmergencyStopped={isEmergencyStopped}
            isEmergencyStopInProcess={status.isEmergencyStopInProcess}
            onSpeedChange={handleSpeedChange}
            onMoveToAngle={handleMoveToAngle}
            onMoveByAngle={handleMoveByAngle}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onEmergencyStop={handleEmergencyStop}
            onResetEmergencyStop={handleResetEmergencyStop}
          />
        );
      
      case 'scenario':
        return (
          <ScenarioControls
            isExecuting={isExecuting}
            isPaused={isPaused}
            currentAction={orchestratorAction}
            actionProgress={actionProgress}
            loopInfo={loopInfo}
            onExecuteScenario={handleExecuteScenario}
            onPause={handleOrchestratorPause}
            onResume={handleOrchestratorResume}
            onStop={handleOrchestratorStop}
            onClear={handleOrchestratorClear}
            onObstacleDetected={handleObstacleDetected}
            onObstacleCleared={handleObstacleCleared}
            isObstacleDetected={isObstacleDetected}
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