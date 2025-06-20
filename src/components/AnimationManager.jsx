import { useState, useEffect } from "react";
import TailgateAnimation from "./animations/TailgateAnimation";
import WheelControls from "./ActionControls/WheelControls";
import "./AnimationManager.css";

const AnimationManager = () => {
  const ActiveComponent = TailgateAnimation;
  const [wheelSpeed, setWheelSpeed] = useState(1);

  // 处理车轮速度变化
  const handleWheelSpeedChange = (newSpeed) => {
    setWheelSpeed(newSpeed);
    updateWheelAnimation(newSpeed);
  };

  // 更新车轮动画速度
  const updateWheelAnimation = (speed) => {
    const tires = document.querySelectorAll('.tire-image');
    tires.forEach(tire => {
      if (speed <= 0) {
        // 当速度为0时，停止动画
        tire.style.animationPlayState = 'paused';
      } else {
        // 当速度大于0时，恢复动画并设置速度
        tire.style.animationPlayState = 'running';
        const duration = 2 / speed;
        tire.style.animationDuration = `${duration}s`;
      }
    });
  };

  // 初始化车轮动画
  useEffect(() => {
    updateWheelAnimation(wheelSpeed);
  }, []);

  return (
    <div className="animation-manager">
      <div className="header">
        <h1 className="title">
          <span className="title-icon">🚗</span>
          汽车尾门动画演示系统
        </h1>
        <p className="subtitle">
          基于原子服务的2D可视化动画系统，展示汽车尾门的复杂动作编排
        </p>
      </div>

      <div className="main-content">
        <div className="controls-panel">
          <WheelControls 
            wheelSpeed={wheelSpeed}
            onWheelSpeedChange={handleWheelSpeedChange}
          />
          <ActiveComponent />
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
    </div>
  );
};

export default AnimationManager; 