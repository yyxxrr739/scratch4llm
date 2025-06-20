import { useState, useEffect, useCallback, useRef } from 'react';

const useWheelKeyboardControl = () => {
  const [currentAngularVelocity, setCurrentAngularVelocity] = useState(0); // rad/s
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0); // 用于显示
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isDecelerating, setIsDecelerating] = useState(false);
  
  const lastUpdateTime = useRef(Date.now());
  
  // 车辆物理参数配置
  const MAX_SPEED_KMH = 30; // 最高速度30km/h
  const WHEEL_RADIUS = 0.3; // 米
  
  // 新的加速减速配置
  const ACCELERATION_RATE = 3; // km/h/s - 每秒加速3km/h
  const DECELERATION_RATE = 3; // km/h/s - 每秒减速3km/h
  
  // 将角速度转换为km/h用于显示
  const angularVelocityToKmh = useCallback((angularVelocity) => {
    const linearVelocity = angularVelocity * WHEEL_RADIUS; // m/s
    return linearVelocity * 3.6; // 转换为km/h
  }, []);
  
  // 将km/h转换为角速度
  const kmhToAngularVelocity = useCallback((kmh) => {
    const linearVelocity = kmh / 3.6; // m/s
    return linearVelocity / WHEEL_RADIUS; // rad/s
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
      const deltaTime = Math.min((now - lastUpdateTime.current) / 1000, 0.1); // 转换为秒，限制最大时间步长
      lastUpdateTime.current = now;
      
      let newAngularVelocity = currentAngularVelocity;
      const currentSpeedKmh = angularVelocityToKmh(currentAngularVelocity);
      
      if (isAccelerating) {
        // 按住上键：每秒加速3km/h
        const speedIncrease = ACCELERATION_RATE * deltaTime; // km/h
        const newSpeedKmh = Math.min(currentSpeedKmh + speedIncrease, MAX_SPEED_KMH);
        newAngularVelocity = kmhToAngularVelocity(newSpeedKmh);
      } else if (isDecelerating) {
        // 按住下键：每秒减速3km/h
        const speedDecrease = DECELERATION_RATE * deltaTime; // km/h
        const newSpeedKmh = Math.max(currentSpeedKmh - speedDecrease, 0);
        newAngularVelocity = kmhToAngularVelocity(newSpeedKmh);
      }
      // 松开按键时：维持当前旋转速度，不做任何变化
      
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
  }, [currentAngularVelocity, isAccelerating, isDecelerating, angularVelocityToKmh, kmhToAngularVelocity]);

  // 计算动画速度倍数（用于CSS动画）
  const getAnimationSpeed = useCallback(() => {
    if (currentAngularVelocity <= 0) return 0;
    
    // 将角速度转换为动画速度倍数
    // 假设最大角速度27.8 rad/s对应2秒一圈的动画
    // 基础动画：2秒一圈 = 0.5圈/秒 = π rad/s
    // 所以动画速度倍数 = 当前角速度 / π
    const speedMultiplier = currentAngularVelocity / Math.PI;
    
    // 确保速度倍数不为负数，防止方向问题
    return Math.max(0, speedMultiplier);
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