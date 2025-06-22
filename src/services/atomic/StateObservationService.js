import EventService from '../core/EventService.js';

class StateObservationService {
  constructor() {
    this.eventService = new EventService();
    
    // 系统状态
    this.systemState = {
      tailgate: {
        angle: 0,
        state: 'idle', // idle, opening, closing, emergency_stop
        speed: 1,
        targetAngle: 0,
        isOpen: false,
        isClosed: true,
        isMoving: false,
        isEmergencyStopped: false,
        lastUpdateTime: Date.now()
      },
      vehicle: {
        speed: 0, // km/h
        isMoving: false,
        lastUpdateTime: Date.now()
      },
      environment: {
        obstacleDetected: false,
        distanceToObstacle: null,
        temperature: 25, // °C
        humidity: 50, // %
        lastUpdateTime: Date.now()
      },
      system: {
        status: 'ready', // ready, busy, error, emergency
        uptime: 0,
        lastUpdateTime: Date.now()
      }
    };
    
    // 状态历史
    this.stateHistory = [];
    this.maxHistorySize = 100;
    
    // 状态更新间隔
    this.updateInterval = null;
    this.updateFrequency = 100; // ms
    
    // 开始状态监控
    this.startMonitoring();
  }

  // 开始状态监控
  startMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = setInterval(() => {
      this.updateSystemUptime();
      this.emitStateUpdate();
    }, this.updateFrequency);
  }

  // 停止状态监控
  stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // 更新系统运行时间
  updateSystemUptime() {
    this.systemState.system.uptime = Date.now() - this.systemState.system.lastUpdateTime;
  }

  // 尾门状态更新方法

  // 更新尾门角度
  updateTailgateAngle(angle) {
    const oldAngle = this.systemState.tailgate.angle;
    this.systemState.tailgate.angle = angle;
    this.systemState.tailgate.lastUpdateTime = Date.now();
    
    // 更新开启/关闭状态
    this.systemState.tailgate.isOpen = angle >= 94;
    this.systemState.tailgate.isClosed = angle <= 1;
    
    this.emitStateChange('tailgate:angleChanged', {
      oldAngle,
      newAngle: angle,
      isOpen: this.systemState.tailgate.isOpen,
      isClosed: this.systemState.tailgate.isClosed
    });
  }

  // 更新尾门状态
  updateTailgateState(state) {
    const oldState = this.systemState.tailgate.state;
    this.systemState.tailgate.state = state;
    this.systemState.tailgate.lastUpdateTime = Date.now();
    
    // 更新相关状态
    this.systemState.tailgate.isMoving = state === 'opening' || state === 'closing';
    
    this.emitStateChange('tailgate:stateChanged', {
      oldState,
      newState: state,
      isMoving: this.systemState.tailgate.isMoving
    });
  }

  // 更新尾门速度
  updateTailgateSpeed(speed) {
    const oldSpeed = this.systemState.tailgate.speed;
    this.systemState.tailgate.speed = speed;
    this.systemState.tailgate.lastUpdateTime = Date.now();
    
    this.emitStateChange('tailgate:speedChanged', {
      oldSpeed,
      newSpeed: speed
    });
  }

  // 更新尾门目标角度
  updateTailgateTargetAngle(targetAngle) {
    const oldTargetAngle = this.systemState.tailgate.targetAngle;
    this.systemState.tailgate.targetAngle = targetAngle;
    this.systemState.tailgate.lastUpdateTime = Date.now();
    
    this.emitStateChange('tailgate:targetAngleChanged', {
      oldTargetAngle,
      newTargetAngle: targetAngle
    });
  }

  // 更新尾门紧急停止状态
  updateTailgateEmergencyStop(isEmergencyStopped) {
    const oldEmergencyStop = this.systemState.tailgate.isEmergencyStopped;
    this.systemState.tailgate.isEmergencyStopped = isEmergencyStopped;
    this.systemState.tailgate.lastUpdateTime = Date.now();
    
    if (isEmergencyStop) {
      this.systemState.tailgate.state = 'emergency_stop';
      this.systemState.tailgate.isMoving = false;
    }
    
    this.emitStateChange('tailgate:emergencyStopChanged', {
      oldEmergencyStop,
      newEmergencyStop: isEmergencyStopped
    });
  }

  // 车辆状态更新方法

  // 更新车速
  updateVehicleSpeed(speed) {
    const oldSpeed = this.systemState.vehicle.speed;
    this.systemState.vehicle.speed = Math.max(0, Math.min(30, speed)); // 限制在0-30km/h
    this.systemState.vehicle.isMoving = speed > 0;
    this.systemState.vehicle.lastUpdateTime = Date.now();
    
    this.emitStateChange('vehicle:speedChanged', {
      oldSpeed,
      newSpeed: this.systemState.vehicle.speed,
      isMoving: this.systemState.vehicle.isMoving
    });
  }

  // 环境状态更新方法

  // 更新障碍物检测状态
  updateObstacleDetection(detected, distance = null) {
    const oldDetected = this.systemState.environment.obstacleDetected;
    this.systemState.environment.obstacleDetected = detected;
    this.systemState.environment.distanceToObstacle = distance;
    this.systemState.environment.lastUpdateTime = Date.now();
    
    this.emitStateChange('environment:obstacleDetectionChanged', {
      oldDetected,
      newDetected: detected,
      distance
    });
  }

  // 更新环境温度
  updateTemperature(temperature) {
    const oldTemperature = this.systemState.environment.temperature;
    this.systemState.environment.temperature = temperature;
    this.systemState.environment.lastUpdateTime = Date.now();
    
    this.emitStateChange('environment:temperatureChanged', {
      oldTemperature,
      newTemperature: temperature
    });
  }

  // 更新环境湿度
  updateHumidity(humidity) {
    const oldHumidity = this.systemState.environment.humidity;
    this.systemState.environment.humidity = humidity;
    this.systemState.environment.lastUpdateTime = Date.now();
    
    this.emitStateChange('environment:humidityChanged', {
      oldHumidity,
      newHumidity: humidity
    });
  }

  // 系统状态更新方法

  // 更新系统状态
  updateSystemStatus(status) {
    const oldStatus = this.systemState.system.status;
    this.systemState.system.status = status;
    this.systemState.system.lastUpdateTime = Date.now();
    
    this.emitStateChange('system:statusChanged', {
      oldStatus,
      newStatus: status
    });
  }

  // 获取状态方法

  // 获取完整系统状态
  getSystemState() {
    return {
      ...this.systemState,
      timestamp: Date.now()
    };
  }

  // 获取尾门状态
  getTailgateState() {
    return {
      ...this.systemState.tailgate,
      progress: this.calculateTailgateProgress()
    };
  }

  // 获取车辆状态
  getVehicleState() {
    return { ...this.systemState.vehicle };
  }

  // 获取环境状态
  getEnvironmentState() {
    return { ...this.systemState.environment };
  }

  // 获取系统状态
  getSystemStatus() {
    return { ...this.systemState.system };
  }

  // 计算尾门运动进度
  calculateTailgateProgress() {
    const tailgate = this.systemState.tailgate;
    
    if (!tailgate.isMoving) {
      return 0;
    }
    
    const startAngle = tailgate.angle;
    const targetAngle = tailgate.targetAngle;
    const totalDistance = Math.abs(targetAngle - startAngle);
    
    if (totalDistance === 0) {
      return 100;
    }
    
    const currentDistance = Math.abs(tailgate.angle - startAngle);
    return Math.min(100, (currentDistance / totalDistance) * 100);
  }

  // 获取状态摘要
  getStateSummary() {
    const tailgate = this.systemState.tailgate;
    const vehicle = this.systemState.vehicle;
    const environment = this.systemState.environment;
    const system = this.systemState.system;
    
    return {
      tailgate: {
        position: tailgate.isOpen ? 'open' : tailgate.isClosed ? 'closed' : 'partial',
        angle: tailgate.angle,
        state: tailgate.state,
        isMoving: tailgate.isMoving,
        isEmergencyStopped: tailgate.isEmergencyStopped
      },
      vehicle: {
        speed: vehicle.speed,
        isMoving: vehicle.isMoving
      },
      environment: {
        obstacleDetected: environment.obstacleDetected,
        temperature: environment.temperature,
        humidity: environment.humidity
      },
      system: {
        status: system.status,
        uptime: system.uptime
      },
      timestamp: Date.now()
    };
  }

  // 检查状态条件
  checkCondition(condition) {
    switch (condition.type) {
      case 'tailgate_open':
        return this.systemState.tailgate.isOpen;
      case 'tailgate_closed':
        return this.systemState.tailgate.isClosed;
      case 'tailgate_moving':
        return this.systemState.tailgate.isMoving;
      case 'emergency_stop':
        return this.systemState.tailgate.isEmergencyStopped;
      case 'vehicle_stopped':
        return this.systemState.vehicle.speed === 0;
      case 'vehicle_moving':
        return this.systemState.vehicle.speed > 0;
      case 'vehicle_safe_speed':
        return this.systemState.vehicle.speed < 5;
      case 'obstacle_detected':
        return this.systemState.environment.obstacleDetected;
      case 'no_obstacle':
        return !this.systemState.environment.obstacleDetected;
      case 'system_ready':
        return this.systemState.system.status === 'ready';
      case 'custom':
        return condition.check ? condition.check(this.getSystemState()) : false;
      default:
        return false;
    }
  }

  // 状态变化事件
  emitStateChange(eventType, data) {
    const stateChange = {
      id: this.generateStateChangeId(),
      eventType,
      data,
      timestamp: Date.now(),
      systemState: this.getSystemState()
    };
    
    this.addToHistory(stateChange);
    this.eventService.emit(eventType, stateChange);
  }

  // 状态更新事件
  emitStateUpdate() {
    const stateUpdate = {
      id: this.generateStateChangeId(),
      eventType: 'state_update',
      timestamp: Date.now(),
      systemState: this.getSystemState()
    };
    
    this.eventService.emit('state:updated', stateUpdate);
  }

  // 获取状态历史
  getStateHistory(limit = 20) {
    return this.stateHistory.slice(-limit);
  }

  // 添加状态变化到历史记录
  addToHistory(stateChange) {
    this.stateHistory.push(stateChange);
    
    // 限制历史记录大小
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }

  // 生成状态变化ID
  generateStateChangeId() {
    return `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 清除历史记录
  clearHistory() {
    this.stateHistory = [];
  }

  // 重置系统状态
  resetSystemState() {
    this.systemState = {
      tailgate: {
        angle: 0,
        state: 'idle',
        speed: 1,
        targetAngle: 0,
        isOpen: false,
        isClosed: true,
        isMoving: false,
        isEmergencyStopped: false,
        lastUpdateTime: Date.now()
      },
      vehicle: {
        speed: 0,
        isMoving: false,
        lastUpdateTime: Date.now()
      },
      environment: {
        obstacleDetected: false,
        distanceToObstacle: null,
        temperature: 25,
        humidity: 50,
        lastUpdateTime: Date.now()
      },
      system: {
        status: 'ready',
        uptime: 0,
        lastUpdateTime: Date.now()
      }
    };
    
    this.eventService.emit('state:reset', {
      timestamp: Date.now()
    });
  }

  // 事件监听
  on(eventName, callback) {
    return this.eventService.on(eventName, callback);
  }

  // 销毁服务
  destroy() {
    this.stopMonitoring();
    this.eventService.destroy();
  }
}

export default StateObservationService; 