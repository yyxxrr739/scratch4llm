import { useState, useEffect, useCallback, useRef } from 'react';

const useWheelKeyboardControl = () => {
  const [currentAngularVelocity, setCurrentAngularVelocity] = useState(0); // rad/s
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0); // 用于显示
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isDecelerating, setIsDecelerating] = useState(false);
  
  const lastUpdateTime = useRef(Date.now());
  
  // 角加速度配置 (rad/s²)
  const ACCELERATION_RATE = 5; // 按住上键时的加速度
  const DECELERATION_RATE = 10; // 按住下键时的减速度
  const NATURAL_DECELERATION_RATE = 2; // 松开按键时的自然减速度
  
  // 最大角速度限制 (对应30km/h)
  // 假设车轮半径为0.3米，30km/h = 8.33m/s
  // 角速度 = 线速度 / 半径 = 8.33 / 0.3 ≈ 27.8 rad/s
  const MAX_ANGULAR_VELOCITY = 27.8; // rad/s
  
  // 将角速度转换为km/h用于显示
  const angularVelocityToKmh = useCallback((angularVelocity) => {
    const wheelRadius = 0.3; // 米
    const linearVelocity = angularVelocity * wheelRadius; // m/s
    return linearVelocity * 3.6; // 转换为km/h
  }, []);
  
  // 将km/h转换为角速度
  const kmhToAngularVelocity = useCallback((kmh) => {
    const wheelRadius = 0.3; // 米
    const linearVelocity = kmh / 3.6; // m/s
    return linearVelocity / wheelRadius; // rad/s
  }, []);

  // 处理键盘按下事件
  const handleKeyDown = useCallback((event) => {
    switch (event.code) {
      case 'ArrowUp':
        event.preventDefault();
        setIsAccelerating(true);
        setIsDecelerating(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        setIsDecelerating(true);
        setIsAccelerating(false);
        break;
      default:
        break;
    }
  }, []);

  // 处理键盘释放事件
  const handleKeyUp = useCallback((event) => {
    switch (event.code) {
      case 'ArrowUp':
        event.preventDefault();
        setIsAccelerating(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        setIsDecelerating(false);
        break;
      default:
        break;
    }
  }, []);

  // 设置键盘事件监听器
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // 动画循环，处理角速度变化
  useEffect(() => {
    let animationId;
    
    const updateAngularVelocity = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime.current) / 1000; // 转换为秒
      lastUpdateTime.current = now;
      
      let newAngularVelocity = currentAngularVelocity;
      
      if (isAccelerating) {
        // 加速：按照5rad/s²的加速度加速
        newAngularVelocity = Math.min(
          currentAngularVelocity + ACCELERATION_RATE * deltaTime, 
          MAX_ANGULAR_VELOCITY
        );
      } else if (isDecelerating) {
        // 减速：按照10rad/s²的加速度减速
        newAngularVelocity = Math.max(
          currentAngularVelocity - DECELERATION_RATE * deltaTime, 
          0
        );
      } else {
        // 自然减速：按照2rad/s²的加速度减速
        if (currentAngularVelocity > 0) {
          newAngularVelocity = Math.max(
            currentAngularVelocity - NATURAL_DECELERATION_RATE * deltaTime, 
            0
          );
        }
      }
      
      // 确保角速度不会变为负数（防止反转）
      newAngularVelocity = Math.max(newAngularVelocity, 0);
      
      setCurrentAngularVelocity(newAngularVelocity);
      
      // 更新显示的km/h速度
      const newSpeedKmh = angularVelocityToKmh(newAngularVelocity);
      setCurrentSpeedKmh(newSpeedKmh);
      
      animationId = requestAnimationFrame(updateAngularVelocity);
    };
    
    animationId = requestAnimationFrame(updateAngularVelocity);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [currentAngularVelocity, isAccelerating, isDecelerating, angularVelocityToKmh]);

  // 计算动画速度倍数（用于CSS动画）
  const getAnimationSpeed = useCallback(() => {
    if (currentAngularVelocity <= 0) return 0;
    
    // 将角速度转换为动画速度倍数
    // 假设最大角速度27.8 rad/s对应2秒一圈的动画
    // 基础动画：2秒一圈 = 0.5圈/秒 = π rad/s
    // 所以动画速度倍数 = 当前角速度 / π
    return currentAngularVelocity / Math.PI;
  }, [currentAngularVelocity]);

  return {
    currentSpeedKmh,
    currentAngularVelocity,
    isAccelerating,
    isDecelerating,
    getAnimationSpeed
  };
};

export default useWheelKeyboardControl; 