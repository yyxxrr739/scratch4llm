import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import "./TailgateAnimation.css";

const TailgateAnimation = () => {
  const tailgateRef = useRef(null);
  const bodyRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const tl = useRef(null);

  useEffect(() => {
    if (!tailgateRef.current) return;
    
    // 创建GSAP时间线
    tl.current = gsap.timeline({ 
      paused: true,
      onUpdate: () => {
        if (tl.current) {
          setAnimationProgress(tl.current.progress() * 100);
        }
      },
      onComplete: () => {
        setIsAnimating(false);
      },
      onReverseComplete: () => {
        setIsAnimating(false);
      }
    });

    // 设置尾门动画
    tl.current.to(tailgateRef.current, {
      rotation: -70,
      transformOrigin: "left top",
      duration: 2,
      ease: "power2.inOut"
    });

    // 移除车体缩放动画，保持车体大小和位置不变

    return () => {
      if (tl.current) {
        tl.current.kill();
      }
    };
  }, []);

  const toggleTailgate = () => {
    if (!tl.current || isAnimating) return;
    
    setIsAnimating(true);
    
    if (isOpen) {
      tl.current.reverse();
      setIsOpen(false);
    } else {
      tl.current.play();
      setIsOpen(true);
    }
  };

  const resetAnimation = () => {
    if (!tl.current || isAnimating) return;
    
    setIsAnimating(true);
    tl.current.reverse();
    setIsOpen(false);
  };

  return (
    <div className="tailgate-animation">
      <div className="animation-container">
        <div className="car-body" ref={bodyRef}>
          <img 
            src="/static/images/body.png" 
            alt="汽车车身" 
            className="body-image"
          />
        </div>
        
        <div className="tailgate" ref={tailgateRef}>
          <img 
            src="/static/images/liftgate.png" 
            alt="电动尾门" 
            className="tailgate-image"
          />
        </div>
      </div>

      <div className="controls">
        <div className="control-buttons">
          <button 
            onClick={toggleTailgate}
            disabled={isAnimating}
            className={`control-btn ${isOpen ? 'close' : 'open'}`}
          >
            {isOpen ? "关闭尾门" : "打开尾门"}
          </button>
          
          {isOpen && (
            <button 
              onClick={resetAnimation}
              disabled={isAnimating}
              className="control-btn reset"
            >
              重置
            </button>
          )}
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${animationProgress}%` }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(animationProgress)}%</span>
        </div>

        <div className="status">
          <div className={`status-indicator ${isOpen ? 'open' : 'closed'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {isOpen ? "尾门已开启" : "尾门已关闭"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailgateAnimation; 