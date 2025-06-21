import { useState, useEffect, useCallback, useRef } from 'react';
import { WHEEL_CONFIG, unitConverters, keyboardHandlers } from '../utils/wheelConfig';

const useWheelPhysicsEngine = () => {
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isDecelerating, setIsDecelerating] = useState(false);
  
  // 物理引擎状态
  const physicsState = useRef({
    angularVelocity: 0, // rad/s
    angularAcceleration: 0, // rad/s²
    rotation: 0, // rad
    lastTime: 0,
    isRunning: false
  });
  
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

  // 物理引擎主循环
  useEffect(() => {
    let animationId;
    
    const updatePhysics = (currentTime) => {
      if (!physicsState.current.lastTime) {
        physicsState.current.lastTime = currentTime;
      }
      
      const deltaTime = Math.min((currentTime - physicsState.current.lastTime) / 1000, WHEEL_CONFIG.PHYSICS_DELTA_TIME);
      physicsState.current.lastTime = currentTime;
      
      // 计算角加速度
      let angularAcceleration = 0;
      
      if (isAccelerating) {
        // 加速：将km/h/s转换为rad/s²
        angularAcceleration = unitConverters.kmhPerSecondToRadPerSecondSquared(WHEEL_CONFIG.ACCELERATION_RATE);
      } else if (isDecelerating) {
        // 减速：将km/h/s转换为rad/s²
        angularAcceleration = -unitConverters.kmhPerSecondToRadPerSecondSquared(WHEEL_CONFIG.DECELERATION_RATE);
      } else {
        // 自然减速（摩擦力）
        if (physicsState.current.angularVelocity > 0) {
          angularAcceleration = -WHEEL_CONFIG.FRICTION;
        }
      }
      
      // 更新角速度
      const newAngularVelocity = physicsState.current.angularVelocity + angularAcceleration * deltaTime;
      
      // 限制最大速度
      const maxAngularVelocity = unitConverters.kmhToAngularVelocity(WHEEL_CONFIG.MAX_SPEED_KMH);
      const clampedAngularVelocity = Math.max(0, Math.min(newAngularVelocity, maxAngularVelocity));
      
      // 如果速度很小，停止旋转
      if (clampedAngularVelocity < WHEEL_CONFIG.MIN_VELOCITY) {
        physicsState.current.angularVelocity = 0;
      } else {
        physicsState.current.angularVelocity = clampedAngularVelocity;
        // 更新旋转角度
        physicsState.current.rotation += clampedAngularVelocity * deltaTime;
      }
      
      // 更新UI状态
      const newSpeedKmh = unitConverters.angularVelocityToKmh(physicsState.current.angularVelocity);
      setCurrentSpeedKmh(newSpeedKmh);
      
      // 更新车轮的视觉旋转
      updateWheelVisualRotation(physicsState.current.rotation);
      
      animationId = requestAnimationFrame(updatePhysics);
    };
    
    physicsState.current.isRunning = true;
    animationId = requestAnimationFrame(updatePhysics);
    
    return () => {
      physicsState.current.isRunning = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isAccelerating, isDecelerating]);

  // 更新车轮的视觉旋转
  const updateWheelVisualRotation = useCallback((rotationRad) => {
    const tires = document.querySelectorAll('.tire-image');
    // 使用负值使车轮逆时针旋转（向前滚动）
    const rotationDeg = -(rotationRad * 180) / Math.PI;
    
    tires.forEach(tire => {
      tire.style.transform = `rotate(${rotationDeg}deg)`;
    });
  }, []);

  // 重置物理引擎
  const resetPhysics = useCallback((resetRotation = false) => {
    physicsState.current = {
      angularVelocity: 0,
      angularAcceleration: 0,
      // 只有在明确要求时才重置旋转角度
      rotation: resetRotation ? 0 : physicsState.current.rotation,
      lastTime: 0,
      isRunning: physicsState.current.isRunning
    };
    setCurrentSpeedKmh(0);
    // 只有在明确要求时才重置视觉旋转
    if (resetRotation) {
      updateWheelVisualRotation(0);
    }
  }, [updateWheelVisualRotation]);

  return {
    currentSpeedKmh,
    isAccelerating,
    isDecelerating,
    resetPhysics
  };
};

export default useWheelPhysicsEngine; 