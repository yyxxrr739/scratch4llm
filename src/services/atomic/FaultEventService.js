import EventService from '../core/EventService.js';

class FaultEventService {
  constructor() {
    this.eventService = new EventService();
    
    // 故障状态
    this.faultState = {
      obstacleDetected: false,
      hardwareFaults: new Map(),
      sensorFaults: new Map(),
      motorFaults: new Map(),
      lastFaultTime: null
    };
    
    // 故障历史
    this.faultHistory = [];
    this.maxHistorySize = 100;
    
    // 故障类型定义
    this.faultTypes = {
      OBSTACLE: 'obstacle',
      HARDWARE: 'hardware',
      SENSOR: 'sensor',
      MOTOR: 'motor',
      SYSTEM: 'system'
    };
    
    // 硬件故障类型
    this.hardwareFaultTypes = {
      POWER_SUPPLY: 'power_supply',
      COMMUNICATION: 'communication',
      CONTROLLER: 'controller',
      MEMORY: 'memory'
    };
    
    // 传感器故障类型
    this.sensorFaultTypes = {
      ANGLE_SENSOR: 'angle_sensor',
      SPEED_SENSOR: 'speed_sensor',
      OBSTACLE_SENSOR: 'obstacle_sensor',
      TEMPERATURE_SENSOR: 'temperature_sensor'
    };
    
    // 电机故障类型
    this.motorFaultTypes = {
      OVERCURRENT: 'overcurrent',
      OVERHEAT: 'overheat',
      STALL: 'stall',
      COMMUNICATION: 'communication'
    };
  }

  // 障碍物检测相关方法

  // 触发障碍物检测
  triggerObstacleDetection(distance = 0) {
    if (this.faultState.obstacleDetected) {
      this.eventService.emit('fault:warning', { 
        message: '障碍物检测已激活' 
      });
      return false;
    }
    
    this.faultState.obstacleDetected = true;
    this.faultState.lastFaultTime = Date.now();
    
    const fault = this.createFaultEvent(
      this.faultTypes.OBSTACLE,
      'obstacle_detected',
      { distance, severity: 'high' }
    );
    
    this.addToHistory(fault);
    this.eventService.emit('fault:obstacleDetected', fault);
    
    return true;
  }

  // 清除障碍物检测
  clearObstacleDetection() {
    if (!this.faultState.obstacleDetected) {
      this.eventService.emit('fault:warning', { 
        message: '无障碍物检测状态' 
      });
      return false;
    }
    
    this.faultState.obstacleDetected = false;
    
    const fault = this.createFaultEvent(
      this.faultTypes.OBSTACLE,
      'obstacle_cleared',
      { severity: 'info' }
    );
    
    this.addToHistory(fault);
    this.eventService.emit('fault:obstacleCleared', fault);
    
    return true;
  }

  // 获取障碍物状态
  isObstacleDetected() {
    return this.faultState.obstacleDetected;
  }

  // 硬件故障相关方法

  // 触发硬件故障
  triggerHardwareFault(faultType, details = {}) {
    if (!this.hardwareFaultTypes[faultType]) {
      this.eventService.emit('fault:error', { 
        message: `未知的硬件故障类型: ${faultType}` 
      });
      return false;
    }
    
    this.faultState.hardwareFaults.set(faultType, {
      ...details,
      timestamp: Date.now(),
      active: true
    });
    
    const fault = this.createFaultEvent(
      this.faultTypes.HARDWARE,
      `hardware_${faultType.toLowerCase()}`,
      { faultType, ...details, severity: 'critical' }
    );
    
    this.addToHistory(fault);
    this.eventService.emit('fault:hardwareFault', fault);
    
    return true;
  }

  // 清除硬件故障
  clearHardwareFault(faultType) {
    if (!this.faultState.hardwareFaults.has(faultType)) {
      this.eventService.emit('fault:warning', { 
        message: `无硬件故障状态: ${faultType}` 
      });
      return false;
    }
    
    this.faultState.hardwareFaults.delete(faultType);
    
    const fault = this.createFaultEvent(
      this.faultTypes.HARDWARE,
      `hardware_${faultType.toLowerCase()}_cleared`,
      { faultType, severity: 'info' }
    );
    
    this.addToHistory(fault);
    this.eventService.emit('fault:hardwareFaultCleared', fault);
    
    return true;
  }

  // 传感器故障相关方法

  // 触发传感器故障
  triggerSensorFault(sensorType, details = {}) {
    if (!this.sensorFaultTypes[sensorType]) {
      this.eventService.emit('fault:error', { 
        message: `未知的传感器故障类型: ${sensorType}` 
      });
      return false;
    }
    
    this.faultState.sensorFaults.set(sensorType, {
      ...details,
      timestamp: Date.now(),
      active: true
    });
    
    const fault = this.createFaultEvent(
      this.faultTypes.SENSOR,
      `sensor_${sensorType.toLowerCase()}`,
      { sensorType, ...details, severity: 'high' }
    );
    
    this.addToHistory(fault);
    this.eventService.emit('fault:sensorFault', fault);
    
    return true;
  }

  // 清除传感器故障
  clearSensorFault(sensorType) {
    if (!this.faultState.sensorFaults.has(sensorType)) {
      this.eventService.emit('fault:warning', { 
        message: `无传感器故障状态: ${sensorType}` 
      });
      return false;
    }
    
    this.faultState.sensorFaults.delete(sensorType);
    
    const fault = this.createFaultEvent(
      this.faultTypes.SENSOR,
      `sensor_${sensorType.toLowerCase()}_cleared`,
      { sensorType, severity: 'info' }
    );
    
    this.addToHistory(fault);
    this.eventService.emit('fault:sensorFaultCleared', fault);
    
    return true;
  }

  // 电机故障相关方法

  // 触发电机故障
  triggerMotorFault(motorType, details = {}) {
    if (!this.motorFaultTypes[motorType]) {
      this.eventService.emit('fault:error', { 
        message: `未知的电机故障类型: ${motorType}` 
      });
      return false;
    }
    
    this.faultState.motorFaults.set(motorType, {
      ...details,
      timestamp: Date.now(),
      active: true
    });
    
    const fault = this.createFaultEvent(
      this.faultTypes.MOTOR,
      `motor_${motorType.toLowerCase()}`,
      { motorType, ...details, severity: 'critical' }
    );
    
    this.addToHistory(fault);
    this.eventService.emit('fault:motorFault', fault);
    
    return true;
  }

  // 清除电机故障
  clearMotorFault(motorType) {
    if (!this.faultState.motorFaults.has(motorType)) {
      this.eventService.emit('fault:warning', { 
        message: `无电机故障状态: ${motorType}` 
      });
      return false;
    }
    
    this.faultState.motorFaults.delete(motorType);
    
    const fault = this.createFaultEvent(
      this.faultTypes.MOTOR,
      `motor_${motorType.toLowerCase()}_cleared`,
      { motorType, severity: 'info' }
    );
    
    this.addToHistory(fault);
    this.eventService.emit('fault:motorFaultCleared', fault);
    
    return true;
  }

  // 通用故障方法

  // 创建故障事件
  createFaultEvent(type, eventType, details = {}) {
    return {
      id: this.generateFaultId(),
      type,
      eventType,
      details,
      timestamp: Date.now(),
      severity: details.severity || 'medium'
    };
  }

  // 获取故障状态
  getFaultState() {
    return {
      ...this.faultState,
      hardwareFaults: Object.fromEntries(this.faultState.hardwareFaults),
      sensorFaults: Object.fromEntries(this.faultState.sensorFaults),
      motorFaults: Object.fromEntries(this.faultState.motorFaults)
    };
  }

  // 检查是否有活跃故障
  hasActiveFaults() {
    return (
      this.faultState.obstacleDetected ||
      this.faultState.hardwareFaults.size > 0 ||
      this.faultState.sensorFaults.size > 0 ||
      this.faultState.motorFaults.size > 0
    );
  }

  // 获取活跃故障列表
  getActiveFaults() {
    const activeFaults = [];
    
    if (this.faultState.obstacleDetected) {
      activeFaults.push({
        type: this.faultTypes.OBSTACLE,
        eventType: 'obstacle_detected',
        severity: 'high'
      });
    }
    
    this.faultState.hardwareFaults.forEach((fault, type) => {
      activeFaults.push({
        type: this.faultTypes.HARDWARE,
        eventType: `hardware_${type.toLowerCase()}`,
        details: fault,
        severity: 'critical'
      });
    });
    
    this.faultState.sensorFaults.forEach((fault, type) => {
      activeFaults.push({
        type: this.faultTypes.SENSOR,
        eventType: `sensor_${type.toLowerCase()}`,
        details: fault,
        severity: 'high'
      });
    });
    
    this.faultState.motorFaults.forEach((fault, type) => {
      activeFaults.push({
        type: this.faultTypes.MOTOR,
        eventType: `motor_${type.toLowerCase()}`,
        details: fault,
        severity: 'critical'
      });
    });
    
    return activeFaults;
  }

  // 清除所有故障
  clearAllFaults() {
    const clearedFaults = [];
    
    // 清除障碍物检测
    if (this.faultState.obstacleDetected) {
      this.clearObstacleDetection();
      clearedFaults.push('obstacle');
    }
    
    // 清除硬件故障
    this.faultState.hardwareFaults.forEach((fault, type) => {
      this.clearHardwareFault(type);
      clearedFaults.push(`hardware_${type}`);
    });
    
    // 清除传感器故障
    this.faultState.sensorFaults.forEach((fault, type) => {
      this.clearSensorFault(type);
      clearedFaults.push(`sensor_${type}`);
    });
    
    // 清除电机故障
    this.faultState.motorFaults.forEach((fault, type) => {
      this.clearMotorFault(type);
      clearedFaults.push(`motor_${type}`);
    });
    
    this.eventService.emit('fault:allFaultsCleared', { clearedFaults });
    return clearedFaults;
  }

  // 获取故障历史
  getFaultHistory(limit = 20) {
    return this.faultHistory.slice(-limit);
  }

  // 添加故障到历史记录
  addToHistory(fault) {
    this.faultHistory.push(fault);
    
    // 限制历史记录大小
    if (this.faultHistory.length > this.maxHistorySize) {
      this.faultHistory.shift();
    }
  }

  // 生成故障ID
  generateFaultId() {
    return `fault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 清除历史记录
  clearHistory() {
    this.faultHistory = [];
  }

  // 事件监听
  on(eventName, callback) {
    return this.eventService.on(eventName, callback);
  }

  // 销毁服务
  destroy() {
    this.eventService.destroy();
  }
}

export default FaultEventService; 