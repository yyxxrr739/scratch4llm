import { useState, useEffect, useCallback, useRef } from 'react';
import { WHEEL_CONFIG, unitConverters, keyboardHandlers } from '../utils/wheelConfig';

const useWheelKeyboardControl = () => {
  const [currentAngularVelocity, setCurrentAngularVelocity] = useState(0); // rad/s
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0); // 用于显示
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isDecelerating, setIsDecelerating] = useState(false);
  
  const lastUpdateTime = useRef(Date.now());

  // 处理键盘按下事件
  const handleKeyDown = useCallback((event) => {
    keyboardHandlers.handleKeyDown(event, setIsAccelerating, setIsDecelerating);
  }, []);

  // 处理键盘释放事件
  const handleKeyUp = useCallback((event) => {
    keyboardHandlers.handleKeyUp(event, setIsAccelerating, setIsDecelerating);
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
      const deltaTime = Math.min((now - lastUpdateTime.current) / 1000, WHEEL_CONFIG.MAX_DELTA_TIME);
      lastUpdateTime.current = now;
      
      let newAngularVelocity = currentAngularVelocity;
      const currentSpeedKmh = unitConverters.angularVelocityToKmh(currentAngularVelocity);
      
      if (isAccelerating) {
        // 按住上键：每秒加速
        const speedIncrease = WHEEL_CONFIG.ACCELERATION_RATE * deltaTime; // km/h
        const newSpeedKmh = Math.min(currentSpeedKmh + speedIncrease, WHEEL_CONFIG.MAX_SPEED_KMH);
        newAngularVelocity = unitConverters.kmhToAngularVelocity(newSpeedKmh);
      } else if (isDecelerating) {
        // 按住下键：每秒减速
        const speedDecrease = WHEEL_CONFIG.DECELERATION_RATE * deltaTime; // km/h
        const newSpeedKmh = Math.max(currentSpeedKmh - speedDecrease, 0);
        newAngularVelocity = unitConverters.kmhToAngularVelocity(newSpeedKmh);
      }
      // 松开按键时：维持当前旋转速度，不做任何变化
      
      // 确保角速度不会变为负数（防止反转）
      newAngularVelocity = Math.max(newAngularVelocity, 0);
      
      setCurrentAngularVelocity(newAngularVelocity);
      
      // 更新显示的km/h速度
      const newSpeedKmh = unitConverters.angularVelocityToKmh(newAngularVelocity);
      setCurrentSpeedKmh(newSpeedKmh);
      
      animationId = requestAnimationFrame(updateAngularVelocity);
    };
    
    animationId = requestAnimationFrame(updateAngularVelocity);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [currentAngularVelocity, isAccelerating, isDecelerating]);

  // 计算动画速度倍数（用于CSS动画）
  const getAnimationSpeed = useCallback(() => {
    return unitConverters.getAnimationSpeed(currentAngularVelocity);
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