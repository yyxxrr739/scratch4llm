import { useState, useEffect } from "react";
import TailgateAnimation from "./animations/TailgateAnimation";
import WheelControls from "./ActionControls/WheelControls";
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
    isDecelerating,
    getCurrentAngularVelocity,
    getCurrentRotation,
    resetPhysics
  } = useWheelPhysicsEngine();

  // 状态信息汇总
  const [tailgateState, setTailgateState] = useState({
    isOpen: false,
    isAnimating: false,
    currentAngle: 0,
    currentSpeed: 1,
    isEmergencyStopped: false
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
        <div className="controls-panel">
          <WheelControls 
            currentSpeedKmh={currentSpeedKmh}
            currentAngularVelocity={getCurrentAngularVelocity()}
            currentRotation={getCurrentRotation()}
            resetPhysics={resetPhysics}
            tailgateState={tailgateState}
          />
          <ActiveComponent onStateChange={setTailgateState} />
        </div>
        
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
      </div>

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />
    </div>
  );
};

export default AnimationManager; 