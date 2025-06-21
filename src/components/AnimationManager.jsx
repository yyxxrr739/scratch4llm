import { useState, useEffect } from "react";
import TailgateAnimation from "./animations/TailgateAnimation";
import WheelControls from "./ActionControls/WheelControls";
import BasicControls from "./ActionControls/BasicControls";
import AdvancedControls from "./ActionControls/AdvancedControls";
import ScenarioControls from "./ActionControls/ScenarioControls";
import HelpModal from "./HelpModal";
import useWheelPhysicsEngine from "../hooks/useWheelPhysicsEngine";
import "./AnimationManager.css";

const AnimationManager = () => {
  const ActiveComponent = TailgateAnimation;
  
  // 帮助模态框状态
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
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

  // 监听尾门状态变化
  useEffect(() => {
    const updateTailgateState = () => {
      // 这里可以通过事件或其他方式获取尾门状态
      // 暂时使用默认值，实际应用中需要从TailgateAnimation组件获取
    };
    
    updateTailgateState();
  }, []);

  return (
    <div className="animation-manager">
      <div className="header">
        <div className="header-content">
          <h1 className="title">
            <span className="title-icon">🚗</span>
            汽车尾门动画演示系统
          </h1>
          <p className="subtitle">
            基于原子服务的2D可视化动画系统，展示汽车尾门的复杂动作编排
          </p>
        </div>
        <button 
          className="help-button"
          onClick={() => setIsHelpOpen(true)}
          title="查看帮助说明"
        >
          <span className="help-button-icon">❓</span>
          帮助
        </button>
      </div>

      <div className="main-content">
        {/* 左侧状态信息栏 */}
        <div className="status-panel">
          <div className="status-section">
            <h3 className="section-title">状态信息</h3>
            
            <div className="status-display">
              {/* 车辆状态 */}
              <div className="status-item">
                <span className="status-label">车速:</span>
                <span className="status-value">{currentSpeedKmh.toFixed(1)} km/h</span>
              </div>
              
              {/* 尾门状态 */}
              <div className="status-item">
                <span className="status-label">尾门角度:</span>
                <span className="status-value">{Math.round(tailgateState.currentAngle || 0)}°</span>
              </div>
              <div className="status-item">
                <span className="status-label">尾门状态:</span>
                <span className={`status-indicator ${tailgateState.isOpen ? 'open' : 'closed'}`}>
                  <span className="status-dot"></span>
                  {tailgateState.isOpen ? '已开启' : '已关闭'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">动画:</span>
                <span className={`status-indicator ${tailgateState.isAnimating ? 'animating' : 'idle'}`}>
                  <span className="status-dot"></span>
                  {tailgateState.isAnimating ? '进行中' : '空闲'}
                </span>
              </div>
              
              {/* 服务状态 */}
              <div className="status-item">
                <span className="status-label">服务状态:</span>
                <span className={`status-indicator ${tailgateState.isInitialized ? 'ready' : 'initializing'}`}>
                  <span className="status-dot"></span>
                  {tailgateState.isInitialized ? '就绪' : '初始化中...'}
                </span>
              </div>
              
              {/* 紧急停止状态显示 */}
              {tailgateState.isEmergencyStopped && (
                <div className="status-item">
                  <span className="status-label">尾门状态:</span>
                  <span className="status-indicator emergency">
                    <span className="status-dot"></span>
                    紧急停止
                  </span>
                </div>
              )}
              
              {/* 紧急停止过程中状态显示 */}
              {tailgateState.isEmergencyStopInProcess && (
                <div className="status-item">
                  <span className="status-label">尾门状态:</span>
                  <span className="status-indicator emergency-process">
                    <span className="status-dot"></span>
                    紧急停止中...
                  </span>
                </div>
              )}
              
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
                  <span className="status-label">当前动作:</span>
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
        <div className="controls-panel">
          <ActiveComponent onStateChange={setTailgateState} />
        </div>
      </div>

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />
    </div>
  );
};

export default AnimationManager; 