import { useState, useEffect } from "react";
import TailgateAnimation from "./animations/TailgateAnimation";
import WheelControls from "./ActionControls/WheelControls";
import ModeToggle from "./ActionControls/ModeToggle";
import HelpModal from "./HelpModal";
import LanguageToggle from "./LanguageToggle";
import useWheelPhysicsEngine from "../hooks/useWheelPhysicsEngine";
import { t } from "../config/i18n";
import "./AnimationManager.css";

const AnimationManager = () => {
  const ActiveComponent = TailgateAnimation;
  
  // 帮助模态框状态
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  // 系统模式状态
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // 使用新的物理引擎hook
  const {
    currentSpeedKmh,
    isAccelerating,
    isDecelerating
  } = useWheelPhysicsEngine();

  // 状态信息汇总
  const [tailgateState, setTailgateState] = useState({
    isOpen: false,
    isAnimating: false,
    currentAngle: 0,
    currentSpeed: 1,
    isEmergencyStopped: false,
    isEmergencyStopInProcess: false,
    isInitialized: false,
    isExecuting: false,
    isPaused: false,
    currentAction: null,
    actionProgress: 0,
    loopInfo: { current: 0, max: 0 },
    isObstacleDetected: false
  });

  // 车速安全状态
  const [speedSafetyStatus, setSpeedSafetyStatus] = useState({
    isSafe: true,
    currentSpeed: 0,
    maxSpeed: 5
  });

  // 监听尾门状态变化
  useEffect(() => {
    const updateTailgateState = () => {
      // 这里可以通过事件或其他方式获取尾门状态
      // 暂时使用默认值，实际应用中需要从TailgateAnimation组件获取
    };
    
    updateTailgateState();
  }, []);

  // 监听车速变化，更新车速安全状态
  useEffect(() => {
    const updateSpeedSafetyStatus = () => {
      const currentSpeed = currentSpeedKmh;
      const maxSpeed = 5;
      const isSafe = currentSpeed <= maxSpeed;
      
      setSpeedSafetyStatus({
        isSafe,
        currentSpeed,
        maxSpeed
      });
    };

    updateSpeedSafetyStatus();
  }, [currentSpeedKmh]);

  // 模式切换处理函数
  const handleModeToggle = () => {
    setIsDemoMode(!isDemoMode);
  };

  // 渲染控制面板
  const renderControlPanel = () => {
    return (
      <div className="controls-panel">
        {/* 模式切换组件 */}
        <ModeToggle 
          isDemoMode={isDemoMode}
          onModeToggle={handleModeToggle}
          isAnimating={tailgateState.isAnimating}
          isExecuting={tailgateState.isExecuting}
        />
        
        {/* 渲染基础控制组件 */}
        <ActiveComponent onStateChange={setTailgateState} isDemoMode={isDemoMode} />
      </div>
    );
  };

  return (
    <div className={`animation-manager ${isDemoMode ? 'demo-mode' : 'normal-mode'}`}>
      <div className="header">
        <div className="header-content">
          <h1 className="title">
            <span className="title-icon"></span>
            {t('title')}
          </h1>
          <p className="subtitle">
            {t('subtitle')}
          </p>
        </div>
        <div className="header-buttons">
          <LanguageToggle />
          <button 
            className="help-button"
            onClick={() => setIsHelpOpen(true)}
            title={t('helpButton')}
          >
            <span className="help-button-icon">❓</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* 左侧状态信息栏 */}
        <div className="status-panel">
          <div className="status-section">
            <h3 className="section-title">{t('statusInfo')}</h3>
            
            <div className="status-display">
              {/* 车辆状态 */}
              <div className="status-item">
                <span className="status-label">{t('speed')}:</span>
                <span className="status-value">{currentSpeedKmh.toFixed(1)} km/h</span>
              </div>
              
              {/* 车速安全状态 */}
              <div className="status-item">
                <span className="status-label">{t('speedSafety')}:</span>
                <span className={`status-indicator ${speedSafetyStatus.isSafe ? 'safe' : 'unsafe'}`}>
                  <span className="status-dot"></span>
                  {speedSafetyStatus.isSafe ? t('safe') : t('unsafe')}
                </span>
              </div>
              
              {/* 尾门状态 */}
              <div className="status-item">
                <span className="status-label">{t('currentAngle')}:</span>
                <span className="status-value">{Math.round(tailgateState.currentAngle || 0)}°</span>
              </div>
              <div className="status-item">
                <span className="status-label">{t('tailgateStatus')}:</span>
                {tailgateState.isEmergencyStopped ? (
                  <span className="status-indicator emergency">
                    <span className="status-dot"></span>
                    {t('emergencyStop')}
                  </span>
                ) : tailgateState.isEmergencyStopInProcess ? (
                  <span className="status-indicator emergency-process">
                    <span className="status-dot"></span>
                    紧急停止中...
                  </span>
                ) : tailgateState.isAnimating ? (
                  <span className="status-indicator animating">
                    <span className="status-dot"></span>
                    {tailgateState.currentAction && tailgateState.currentAction.action ? 
                      tailgateState.currentAction.action : 
                      (tailgateState.isOpen ? t('closing') : t('opening'))
                    }
                  </span>
                ) : (
                  <span className={`status-indicator ${tailgateState.isOpen ? 'open' : 'closed'}`}>
                    <span className="status-dot"></span>
                    {tailgateState.isOpen ? t('open') : t('closed')}
                  </span>
                )}
              </div>
              <div className="status-item">
                <span className="status-label">{t('runningStatus')}:</span>
                <span className={`status-indicator ${tailgateState.isAnimating ? 'animating' : 'idle'}`}>
                  <span className="status-dot"></span>
                  {tailgateState.isAnimating ? t('running') : t('idle')}
                </span>
              </div>
              
              {/* 服务状态 */}
              <div className="status-item">
                <span className="status-label">Service Status:</span>
                <span className={`status-indicator ${tailgateState.isInitialized ? 'ready' : 'initializing'}`}>
                  <span className="status-dot"></span>
                  {tailgateState.isInitialized ? 'Ready' : 'Initializing...'}
                </span>
              </div>
              
              {/* 障碍物检测状态显示 */}
              {tailgateState.isObstacleDetected && (
                <div className="status-item">
                  <span className="status-label">检测状态:</span>
                  <span className="status-indicator obstacle">
                    <span className="status-dot"></span>
                    障碍物已检测
                  </span>
                </div>
              )}
              
              {/* 编排器状态 */}
              {tailgateState.isExecuting && (
                <div className="status-item">
                  <span className="status-label">编排器:</span>
                  <span className={`status-indicator ${tailgateState.isPaused ? 'paused' : 'executing'}`}>
                    <span className="status-dot"></span>
                    {tailgateState.isPaused ? '已暂停' : '执行中'}
                  </span>
                </div>
              )}
              
              {/* 当前动作 */}
              {tailgateState.currentAction && (
                <div className="status-item">
                  <span className="status-label">Current Action:</span>
                  <span className="status-value">
                    {tailgateState.currentAction.action ? 
                      `${tailgateState.currentAction.action}${tailgateState.currentAction.params ? ` (${JSON.stringify(tailgateState.currentAction.params)})` : ''}` : 
                      '无'
                    }
                  </span>
                </div>
              )}
              
              {/* 循环进度 */}
              {tailgateState.loopInfo.max > 0 && (
                <div className="status-item">
                  <span className="status-label">循环进度:</span>
                  <span className="status-value">
                    {tailgateState.loopInfo.current} / {tailgateState.loopInfo.max}
                  </span>
                </div>
              )}
              
              {/* 执行状态信息 */}
              {tailgateState.isExecuting && (
                <>
                  {/* 执行进度 */}
                  <div className="status-item">
                    <span className="status-label">执行进度:</span>
                    <span className="status-value">{Math.round(tailgateState.actionProgress || 0)}%</span>
                  </div>
                  
                  {/* 进度条 */}
                  <div className="status-item progress-item">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${tailgateState.actionProgress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* 执行状态指示器 */}
                  <div className="status-item">
                    <span className="status-label">执行状态:</span>
                    <span className={`status-indicator ${tailgateState.isPaused ? 'paused' : 'executing'}`}>
                      <span className="status-dot"></span>
                      {tailgateState.isPaused ? '已暂停' : '执行中'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 中间动画区域 */}
        <div className="animation-area">
          <div className="animation-display">
            <div className="car-body">
              <img 
                src="/static/images/body.png" 
                alt="汽车车身" 
                className="body-image"
              />
            </div>
            
            <div className="tailgate" id="tailgate-element">
              <img 
                src="/static/images/liftgate.png" 
                alt="电动尾门" 
                className="tailgate-image"
              />
            </div>

            <div className="tire tire-1">
              <img 
                src="/static/images/tire.png" 
                alt="轮胎" 
                className="tire-image"
              />
            </div>

            <div className="tire tire-2">
              <img 
                src="/static/images/tire.png" 
                alt="轮胎" 
                className="tire-image"
              />
            </div>
          </div>
        </div>

        {/* 右侧控制面板 */}
        {renderControlPanel()}
      </div>

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />
    </div>
  );
};

export default AnimationManager; 