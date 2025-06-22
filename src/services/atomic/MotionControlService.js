import EventService from '../core/EventService.js';

class MotionControlService {
  constructor() {
    this.eventService = new EventService();
    
    // 运动状态
    this.motionState = {
      isMoving: false,
      currentAction: null,
      currentSpeed: 1,
      currentAngle: 0,
      targetAngle: 0,
      isEmergencyStopped: false,
      lastUpdateTime: Date.now()
    };
    
    // 运动配置
    this.config = {
      maxAngle: 95,
      minAngle: 0,
      maxSpeed: 3,
      minSpeed: 0.1,
      defaultSpeed: 1,
      accelerationTime: 500, // ms
      decelerationTime: 300  // ms
    };
    
    // 运动历史
    this.motionHistory = [];
    this.maxHistorySize = 50;
  }

  // 基础运动控制方法

  // 移动到指定位置
  moveToPosition(targetAngle, speed = 1) {
    if (this.motionState.isEmergencyStopped) {
      this.eventService.emit('motion:error', { 
        message: '系统处于紧急停止状态，无法执行运动' 
      });
      return false;
    }

    if (targetAngle < this.config.minAngle || targetAngle > this.config.maxAngle) {
      this.eventService.emit('motion:error', { 
        message: `目标角度必须在 ${this.config.minAngle}° 到 ${this.config.maxAngle}° 之间` 
      });
      return false;
    }

    if (speed < this.config.minSpeed || speed > this.config.maxSpeed) {
      this.eventService.emit('motion:error', { 
        message: `速度必须在 ${this.config.minSpeed} 到 ${this.config.maxSpeed} 之间` 
      });
      return false;
    }

    // 更新运动状态
    this.motionState.isMoving = true;
    this.motionState.currentAction = 'moving';
    this.motionState.currentSpeed = speed;
    this.motionState.targetAngle = targetAngle;
    this.motionState.lastUpdateTime = Date.now();

    const motion = this.createMotionEvent('move_to_position', {
      targetAngle,
      speed,
      currentAngle: this.motionState.currentAngle
    });

    this.addToHistory(motion);
    this.eventService.emit('motion:moveToPosition', motion);

    return true;
  }

  // 相对位置移动
  moveByDistance(deltaAngle, speed = 1) {
    const targetAngle = this.motionState.currentAngle + deltaAngle;
    return this.moveToPosition(targetAngle, speed);
  }

  // 开启尾门
  openTailgate(speed = 1) {
    return this.moveToPosition(this.config.maxAngle, speed);
  }

  // 关闭尾门
  closeTailgate(speed = 1) {
    return this.moveToPosition(this.config.minAngle, speed);
  }

  // 停止运动
  stopMotion() {
    if (!this.motionState.isMoving) {
      this.eventService.emit('motion:warning', { 
        message: '当前无运动状态' 
      });
      return false;
    }

    this.motionState.isMoving = false;
    this.motionState.currentAction = null;

    const motion = this.createMotionEvent('stop_motion', {
      stoppedAngle: this.motionState.currentAngle
    });

    this.addToHistory(motion);
    this.eventService.emit('motion:stopped', motion);

    return true;
  }

  // 暂停运动
  pauseMotion() {
    if (!this.motionState.isMoving) {
      this.eventService.emit('motion:warning', { 
        message: '当前无运动状态' 
      });
      return false;
    }

    this.motionState.currentAction = 'paused';

    const motion = this.createMotionEvent('pause_motion', {
      pausedAngle: this.motionState.currentAngle
    });

    this.addToHistory(motion);
    this.eventService.emit('motion:paused', motion);

    return true;
  }

  // 恢复运动
  resumeMotion() {
    if (this.motionState.currentAction !== 'paused') {
      this.eventService.emit('motion:warning', { 
        message: '当前无暂停状态' 
      });
      return false;
    }

    this.motionState.isMoving = true;
    this.motionState.currentAction = 'moving';

    const motion = this.createMotionEvent('resume_motion', {
      currentAngle: this.motionState.currentAngle,
      targetAngle: this.motionState.targetAngle
    });

    this.addToHistory(motion);
    this.eventService.emit('motion:resumed', motion);

    return true;
  }

  // 紧急停止
  emergencyStop() {
    if (this.motionState.isEmergencyStopped) {
      this.eventService.emit('motion:warning', { 
        message: '系统已处于紧急停止状态' 
      });
      return true;
    }

    this.motionState.isEmergencyStopped = true;
    this.motionState.isMoving = false;
    this.motionState.currentAction = null;

    const motion = this.createMotionEvent('emergency_stop', {
      stoppedAngle: this.motionState.currentAngle,
      reason: 'emergency_stop'
    });

    this.addToHistory(motion);
    this.eventService.emit('motion:emergencyStop', motion);

    return true;
  }

  // 重置紧急停止
  resetEmergencyStop() {
    if (!this.motionState.isEmergencyStopped) {
      this.eventService.emit('motion:warning', { 
        message: '系统未处于紧急停止状态' 
      });
      return false;
    }

    this.motionState.isEmergencyStopped = false;

    const motion = this.createMotionEvent('reset_emergency_stop', {
      currentAngle: this.motionState.currentAngle
    });

    this.addToHistory(motion);
    this.eventService.emit('motion:emergencyStopReset', motion);

    return true;
  }

  // 设置速度
  setSpeed(speed) {
    if (speed < this.config.minSpeed || speed > this.config.maxSpeed) {
      this.eventService.emit('motion:error', { 
        message: `速度必须在 ${this.config.minSpeed} 到 ${this.config.maxSpeed} 之间` 
      });
      return false;
    }

    const oldSpeed = this.motionState.currentSpeed;
    this.motionState.currentSpeed = speed;

    const motion = this.createMotionEvent('set_speed', {
      oldSpeed,
      newSpeed: speed
    });

    this.addToHistory(motion);
    this.eventService.emit('motion:speedChanged', motion);

    return true;
  }

  // 更新当前位置
  updateCurrentPosition(angle) {
    const oldAngle = this.motionState.currentAngle;
    this.motionState.currentAngle = angle;
    this.motionState.lastUpdateTime = Date.now();

    // 检查是否到达目标位置
    if (this.motionState.isMoving && 
        Math.abs(angle - this.motionState.targetAngle) < 1) {
      this.motionState.isMoving = false;
      this.motionState.currentAction = null;

      const motion = this.createMotionEvent('position_reached', {
        targetAngle: this.motionState.targetAngle,
        actualAngle: angle
      });

      this.addToHistory(motion);
      this.eventService.emit('motion:positionReached', motion);
    }

    // 发出位置更新事件
    this.eventService.emit('motion:positionUpdated', {
      oldAngle,
      newAngle: angle,
      timestamp: Date.now()
    });
  }

  // 获取运动状态
  getMotionState() {
    return {
      ...this.motionState,
      isOpen: this.motionState.currentAngle >= this.config.maxAngle - 1,
      isClosed: this.motionState.currentAngle <= this.config.minAngle + 1,
      progress: this.calculateProgress()
    };
  }

  // 计算运动进度
  calculateProgress() {
    if (!this.motionState.isMoving) {
      return 0;
    }

    const startAngle = this.motionState.currentAngle;
    const targetAngle = this.motionState.targetAngle;
    const totalDistance = Math.abs(targetAngle - startAngle);

    if (totalDistance === 0) {
      return 100;
    }

    const currentDistance = Math.abs(this.motionState.currentAngle - startAngle);
    return Math.min(100, (currentDistance / totalDistance) * 100);
  }

  // 检查运动状态
  isMoving() {
    return this.motionState.isMoving;
  }

  isEmergencyStopped() {
    return this.motionState.isEmergencyStopped;
  }

  isOpen() {
    return this.motionState.currentAngle >= this.config.maxAngle - 1;
  }

  isClosed() {
    return this.motionState.currentAngle <= this.config.minAngle + 1;
  }

  // 创建运动事件
  createMotionEvent(eventType, details = {}) {
    return {
      id: this.generateMotionId(),
      eventType,
      details,
      timestamp: Date.now(),
      motionState: { ...this.motionState }
    };
  }

  // 获取运动历史
  getMotionHistory(limit = 20) {
    return this.motionHistory.slice(-limit);
  }

  // 添加运动到历史记录
  addToHistory(motion) {
    this.motionHistory.push(motion);
    
    // 限制历史记录大小
    if (this.motionHistory.length > this.maxHistorySize) {
      this.motionHistory.shift();
    }
  }

  // 生成运动ID
  generateMotionId() {
    return `motion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 清除历史记录
  clearHistory() {
    this.motionHistory = [];
  }

  // 重置运动状态
  resetMotionState() {
    this.motionState = {
      isMoving: false,
      currentAction: null,
      currentSpeed: this.config.defaultSpeed,
      currentAngle: 0,
      targetAngle: 0,
      isEmergencyStopped: false,
      lastUpdateTime: Date.now()
    };

    this.eventService.emit('motion:stateReset', {
      timestamp: Date.now()
    });
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

export default MotionControlService; 