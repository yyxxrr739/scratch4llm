import { useState } from "react";
import TailgateAnimation from "./animations/TailgateAnimation";
import "./AnimationManager.css";

const AnimationManager = () => {
  const ActiveComponent = TailgateAnimation;

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationManager; 