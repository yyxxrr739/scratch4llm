import { useState, useEffect, useCallback, useRef } from 'react';

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
  
  // 物理参数配置
  const PHYSICS_CONFIG = {
    MAX_SPEED_KMH: 30,
    WHEEL_RADIUS: 0.3, // 米
    ACCELERATION_RATE: 3, // km/h/s
    DECELERATION_RATE: 3, // km/h/s
    FRICTION: 0.1, // 摩擦系数
    MIN_VELOCITY: 0.01 // 最小速度阈值
  };
  
  // 将角速度转换为km/h
  const angularVelocityToKmh = useCallback((angularVelocity) => {
    const linearVelocity = angularVelocity * PHYSICS_CONFIG.WHEEL_RADIUS; // m/s
    return linearVelocity * 3.6; // 转换为km/h
  }, []);
  
  // 将km/h转换为角速度
  const kmhToAngularVelocity = useCallback((kmh) => {
    const linearVelocity = kmh / 3.6; // m/s
    return linearVelocity / PHYSICS_CONFIG.WHEEL_RADIUS; // rad/s
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

  // 物理引擎主循环
  useEffect(() => {
    let animationId;
    
    const updatePhysics = (currentTime) => {
      if (!physicsState.current.lastTime) {
        physicsState.current.lastTime = currentTime;
      }
      
      const deltaTime = Math.min((currentTime - physicsState.current.lastTime) / 1000, 0.016); // 限制最大时间步长为16ms
      physicsState.current.lastTime = currentTime;
      
      // 计算角加速度
      let angularAcceleration = 0;
      
      if (isAccelerating) {
        // 加速：将km/h/s转换为rad/s²
        const linearAcceleration = PHYSICS_CONFIG.ACCELERATION_RATE / 3.6; // m/s²
        angularAcceleration = linearAcceleration / PHYSICS_CONFIG.WHEEL_RADIUS; // rad/s²
      } else if (isDecelerating) {
        // 减速：将km/h/s转换为rad/s²
        const linearDeceleration = PHYSICS_CONFIG.DECELERATION_RATE / 3.6; // m/s²
        angularAcceleration = -linearDeceleration / PHYSICS_CONFIG.WHEEL_RADIUS; // rad/s²
      } else {
        // 自然减速（摩擦力）
        if (physicsState.current.angularVelocity > 0) {
          angularAcceleration = -PHYSICS_CONFIG.FRICTION;
        }
      }
      
      // 更新角速度
      const newAngularVelocity = physicsState.current.angularVelocity + angularAcceleration * deltaTime;
      
      // 限制最大速度
      const maxAngularVelocity = kmhToAngularVelocity(PHYSICS_CONFIG.MAX_SPEED_KMH);
      const clampedAngularVelocity = Math.max(0, Math.min(newAngularVelocity, maxAngularVelocity));
      
      // 如果速度很小，停止旋转
      if (clampedAngularVelocity < PHYSICS_CONFIG.MIN_VELOCITY) {
        physicsState.current.angularVelocity = 0;
      } else {
        physicsState.current.angularVelocity = clampedAngularVelocity;
        // 更新旋转角度
        physicsState.current.rotation += clampedAngularVelocity * deltaTime;
      }
      
      // 更新UI状态
      const newSpeedKmh = angularVelocityToKmh(physicsState.current.angularVelocity);
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
  }, [isAccelerating, isDecelerating, angularVelocityToKmh, kmhToAngularVelocity]);

  // 更新车轮的视觉旋转
  const updateWheelVisualRotation = useCallback((rotationRad) => {
    const tires = document.querySelectorAll('.tire-image');
    // 使用负值使车轮逆时针旋转（向前滚动）
    const rotationDeg = -(rotationRad * 180) / Math.PI;
    
    tires.forEach(tire => {
      tire.style.transform = `rotate(${rotationDeg}deg)`;
    });
  }, []);

  // 获取当前角速度
  const getCurrentAngularVelocity = useCallback(() => {
    return physicsState.current.angularVelocity;
  }, []);

  // 获取当前旋转角度（度）
  const getCurrentRotation = useCallback(() => {
    return (physicsState.current.rotation * 180) / Math.PI;
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
    getCurrentAngularVelocity,
    getCurrentRotation,
    resetPhysics
  };
};

export default useWheelPhysicsEngine; 