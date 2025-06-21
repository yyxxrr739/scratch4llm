// 轮子物理参数统一配置
export const WHEEL_CONFIG = {
  // 速度限制
  MAX_SPEED_KMH: 30,
  
  // 物理参数
  WHEEL_RADIUS: 0.3, // 米
  
  // 加速减速参数
  ACCELERATION_RATE: 3, // km/h/s - 每秒加速3km/h
  DECELERATION_RATE: 5, // km/h/s - 每秒减速5km/h
  
  // 物理引擎专用参数
  FRICTION: 0.5, // 摩擦系数
  MIN_VELOCITY: 0.01, // 最小速度阈值
  
  // 动画参数
  MAX_DELTA_TIME: 0.1, // 最大时间步长（秒）
  PHYSICS_DELTA_TIME: 0.016, // 物理引擎时间步长（秒）
};

// 单位转换函数
export const unitConverters = {
  // 将角速度转换为km/h
  angularVelocityToKmh: (angularVelocity) => {
    const linearVelocity = angularVelocity * WHEEL_CONFIG.WHEEL_RADIUS; // m/s
    return linearVelocity * 3.6; // 转换为km/h
  },
  
  // 将km/h转换为角速度
  kmhToAngularVelocity: (kmh) => {
    const linearVelocity = kmh / 3.6; // m/s
    return linearVelocity / WHEEL_CONFIG.WHEEL_RADIUS; // rad/s
  },
  
  // 将km/h/s转换为rad/s²
  kmhPerSecondToRadPerSecondSquared: (kmhPerSecond) => {
    const linearAcceleration = kmhPerSecond / 3.6; // m/s²
    return linearAcceleration / WHEEL_CONFIG.WHEEL_RADIUS; // rad/s²
  },
  
  // 计算动画速度倍数（用于CSS动画）
  getAnimationSpeed: (angularVelocity) => {
    if (angularVelocity <= 0) return 0;
    
    // 将角速度转换为动画速度倍数
    // 假设最大角速度27.8 rad/s对应2秒一圈的动画
    // 基础动画：2秒一圈 = 0.5圈/秒 = π rad/s
    // 所以动画速度倍数 = 当前角速度 / π
    const speedMultiplier = angularVelocity / Math.PI;
    
    // 确保速度倍数不为负数，防止方向问题
    return Math.max(0, speedMultiplier);
  }
};

// 键盘事件处理函数
export const keyboardHandlers = {
  // 处理键盘按下事件
  handleKeyDown: (event, setIsAccelerating, setIsDecelerating) => {
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
  },

  // 处理键盘释放事件
  handleKeyUp: (event, setIsAccelerating, setIsDecelerating) => {
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
  }
}; 