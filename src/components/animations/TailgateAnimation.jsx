import React, { useRef, useEffect, useState } from 'react';
import { useTailgateService } from '../../hooks/useTailgateService.js';
import { useActionOrchestrator } from '../../hooks/useActionOrchestrator.js';
import BasicControls from '../ActionControls/BasicControls.jsx';
import AdvancedControls from '../ActionControls/AdvancedControls.jsx';
import ScenarioControls from '../ActionControls/ScenarioControls.jsx';
import './TailgateAnimation.css';

const TailgateAnimation = ({ onStateChange }) => {
  const [activeControlTab, setActiveControlTab] = useState('basic');
  
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
      onStateChange({
        isOpen,
        isAnimating,
        currentAngle,
        currentSpeed,
        isEmergencyStopped
      });
    }
  }, [isOpen, isAnimating, currentAngle, currentSpeed, isEmergencyStopped, onStateChange]);

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

  // 基础控制事件处理
  const handleOpen = () => {
    actions.startOpen(currentSpeed);
  };

  const handleClose = () => {
    actions.startClose(currentSpeed);
  };

  const handleReset = () => {
    actions.startClose(currentSpeed);
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
    { id: 'basic', name: '基础控制', icon: '🎮' },
    { id: 'advanced', name: '高级控制', icon: '⚙️' },
    { id: 'scenario', name: '场景控制', icon: '🎬' }
  ];

  const renderControlContent = () => {
    switch (activeControlTab) {
      case 'basic':
        return (
          <BasicControls
            isOpen={isOpen}
            isAnimating={isAnimating}
            currentAngle={currentAngle}
            onOpen={handleOpen}
            onClose={handleClose}
            onReset={handleReset}
          />
        );
      
      case 'advanced':
        return (
          <AdvancedControls
            isAnimating={isAnimating}
            currentAngle={currentAngle}
            currentSpeed={currentSpeed}
            isEmergencyStopped={isEmergencyStopped}
            onSpeedChange={handleSpeedChange}
            onMoveToAngle={handleMoveToAngle}
            onMoveByAngle={handleMoveByAngle}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onEmergencyStop={handleEmergencyStop}
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

      {/* 系统状态 */}
      <div className="system-status">
        <div className="status-item">
          <span className="status-label">服务状态:</span>
          <span className={`status-value ${isInitialized ? 'ready' : 'initializing'}`}>
            {isInitialized ? '就绪' : '初始化中...'}
          </span>
        </div>
        
        {isExecuting && (
          <div className="status-item">
            <span className="status-label">编排器:</span>
            <span className="status-value executing">
              {isPaused ? '已暂停' : '执行中'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TailgateAnimation; 