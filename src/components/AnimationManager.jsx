import { useState } from "react";
import TailgateAnimation from "./TailgateAnimation";
import "./AnimationManager.css";

const AnimationManager = () => {
  const [activeComponent, setActiveComponent] = useState("tailgate");
  const [showInfo, setShowInfo] = useState(false);

  const components = [
    {
      id: "tailgate",
      name: "电动尾门",
      description: "展示电动尾门的开启和关闭动画",
      icon: "🚗",
      component: TailgateAnimation
    }
    // 未来可以在这里添加更多组件
    // {
    //   id: "hood",
    //   name: "引擎盖",
    //   description: "展示引擎盖的开启和关闭动画",
    //   icon: "🔧",
    //   component: HoodAnimation
    // },
    // {
    //   id: "doors",
    //   name: "车门",
    //   description: "展示车门的开启和关闭动画",
    //   icon: "🚪",
    //   component: DoorAnimation
    // }
  ];

  const ActiveComponent = components.find(c => c.id === activeComponent)?.component;

  return (
    <div className="animation-manager">
      <div className="header">
        <h1 className="title">
          <span className="title-icon">🚗</span>
          汽车部件动画演示系统
        </h1>
        <p className="subtitle">
          逼真的2D可视化动画，展示汽车各部件的运动过程
        </p>
      </div>

      <div className="main-content">
        <div className="sidebar">
          <div className="component-list">
            <h3 className="sidebar-title">可用组件</h3>
            {components.map((component) => (
              <button
                key={component.id}
                onClick={() => setActiveComponent(component.id)}
                className={`component-item ${activeComponent === component.id ? 'active' : ''}`}
              >
                <span className="component-icon">{component.icon}</span>
                <div className="component-info">
                  <span className="component-name">{component.name}</span>
                  <span className="component-desc">{component.description}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="info-panel">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="info-toggle"
            >
              {showInfo ? "隐藏" : "显示"} 系统信息
            </button>
            
            {showInfo && (
              <div className="info-content">
                <h4>系统特性</h4>
                <ul>
                  <li>🎨 逼真的2D可视化动画</li>
                  <li>🎮 交互式控制界面</li>
                  <li>📱 响应式设计</li>
                  <li>⚡ 高性能GSAP动画</li>
                  <li>🔧 可扩展组件架构</li>
                </ul>
                
                <h4>技术栈</h4>
                <ul>
                  <li>React 18</li>
                  <li>GSAP 3</li>
                  <li>Vite</li>
                  <li>CSS3 动画</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="animation-area">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

export default AnimationManager; 