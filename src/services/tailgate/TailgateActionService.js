import AnimationService from '../core/AnimationService.js';
import EventService from '../core/EventService.js';

class TailgateActionService {
  constructor() {
    this.animationService = new AnimationService();
    this.eventService = new EventService();
    
    this.currentAction = null;
    this.isAnimating = false;
    this.isPaused = false;
    this.currentSpeed = 1;
    this.targetAngle = 0;
    this.isEmergencyStopped = false;
    
    // 尾门配置
    this.config = {
      maxAngle: 95,
      minAngle: 0,
      defaultSpeed: 1,
      transformOrigin: "left top"
    };
  }

  // 初始化尾门动画
  init(element) {
    if (!element) {
      throw new Error('Tailgate element is required');
    }

    // 创建主时间线
    this.timeline = this.animationService.createTimeline('tailgate', {
      onUpdate: () => this.handleAnimationUpdate(),
      onComplete: () => this.handleAnimationComplete(),
      onReverseComplete: () => this.handleAnimationComplete()
    });

    // 设置初始状态
    this.element = element;
    this.currentAngle = 0;
    
    this.eventService.emit('tailgate:initialized', { element });
  }

  // 基础动作服务接口实现

  // 启动动作
  start(params = {}) {
    
    const { action, speed = this.currentSpeed, angle } = params;
    
    // 如果是紧急停止动作，直接执行
    if (action === 'emergencyStop') {
      return this.emergencyStop();
    }
    
    // 对于其他动作，如果处于紧急停止状态，先重置状态
    if (this.isEmergencyStopped) {
      this.resetEmergencyStop();
    }
    
    switch (action) {
      case 'open':
        return this.startOpen(speed);
      case 'close':
        return this.startClose(speed);
      case 'moveToAngle':
        return this.moveToAngle(angle, speed);
      case 'moveByAngle':
        return this.moveByAngle(angle, speed);
      case 'emergencyStop':
        return this.emergencyStop();
      default:
        console.error('TailgateActionService: Unknown action', action);
        this.eventService.emit('tailgate:error', { message: 'Unknown action' });
        return false;
    }
  }

  // 重置紧急停止状态
  resetEmergencyStop() {
    if (!this.isEmergencyStopped) {
      this.eventService.emit('tailgate:warning', { message: '系统未处于紧急停止状态' });
      return false;
    }

    this.isEmergencyStopped = false;
    this.eventService.emit('tailgate:emergencyStopReset', {
      message: '紧急停止状态已重置',
      timestamp: Date.now()
    });
    return true;
  }

  // 紧急停止
  emergencyStop() {
    if (this.isEmergencyStopped) {
      this.eventService.emit('tailgate:warning', { message: '系统已处于紧急停止状态' });
      return true;
    }

    // 记录停止前的状态
    const previousAction = this.currentAction;
    const stoppedAngle = this.currentAngle;

    // 设置紧急停止状态
    this.isEmergencyStopped = true;
    this.isAnimating = false;
    this.isPaused = false;
    this.currentAction = null;

    // 立即停止所有动画
    if (this.timeline) {
      // 立即停止主动画时间线
      this.timeline.kill();
    }

    // 停止所有其他可能的时间线
    if (this.animationService) {
      // 停止所有活跃的时间线
      this.animationService.stopAllTimelines();
    }

    // 重新创建时间线以确保状态正确
    if (this.element) {
      this.timeline = this.animationService.createTimeline('tailgate', {
        onUpdate: () => this.handleAnimationUpdate(),
        onComplete: () => this.handleAnimationComplete(),
        onReverseComplete: () => this.handleAnimationComplete()
      });
    }

    // 确保动画状态被正确重置
    this.isAnimating = false;
    this.isPaused = false;
    this.currentAction = null;

    // 创建紧急停止视觉效果
    this.createEmergencyStopEffect();

    // 发出紧急停止事件
    this.eventService.emit('tailgate:emergencyStop', {
      stoppedAngle: stoppedAngle,
      reason: 'emergency_stop_triggered',
      previousAction: previousAction
    });

    // 延迟重置紧急停止状态（模拟车速降为0的过程）
    setTimeout(() => {
      this.resetEmergencyStop();
      // 发出状态重置事件，通知UI更新
      this.eventService.emit('tailgate:emergencyStopAutoReset', {
        message: '紧急停止状态已自动重置'
      });
    }, 3000); // 3秒后自动重置

    return true;
  }

  // 设置速度
  setSpeed(speed) {
    if (speed < 0.1 || speed > 3) {
      this.eventService.emit('tailgate:error', { message: 'Speed must be between 0.1 and 3' });
      return false;
    }
    
    this.currentSpeed = speed;
    this.eventService.emit('tailgate:speedChanged', { speed });
    return true;
  }

  // 获取状态
  getStatus() {
    return {
      isAnimating: this.isAnimating,
      currentAction: this.currentAction,
      currentAngle: this.currentAngle,
      targetAngle: this.targetAngle,
      currentSpeed: this.currentSpeed,
      isEmergencyStopped: this.isEmergencyStopped,
      isOpen: this.isOpen(),
      isClosed: this.isClosed(),
      isPaused: this.isPaused
    };
  }

  // 尾门专用动作服务

  // 启动尾门开启
  startOpen(speed = 1) {
    
    if (this.isEmergencyStopped) {
      this.eventService.emit('tailgate:warning', { message: 'Tailgate is in emergency stop state. Please reset emergency stop first.' });
      return false;
    }

    if (this.isOpen()) {
      this.eventService.emit('tailgate:warning', { message: 'Tailgate is already open' });
      return false;
    }

    // 简单的车速安全检查
    const currentVehicleSpeed = window.currentVehicleSpeed || 0;
    const maxSpeedForOpening = 5; // km/h
    
    if (currentVehicleSpeed > maxSpeedForOpening) {
      this.eventService.emit('tailgate:warning', { 
        message: `车速过高 (${currentVehicleSpeed.toFixed(1)} km/h)，无法开启尾门。安全车速限制：${maxSpeedForOpening} km/h` 
      });
      return false;
    }

    this.setSpeed(speed);
    this.targetAngle = this.config.maxAngle;
    this.currentAction = 'opening';
    
    this.createOpenAnimation();
    this.timeline.play();
    this.isAnimating = true;
    
    this.eventService.emit('tailgate:opening', { speed, targetAngle: this.targetAngle });
    return true;
  }

  // 启动尾门关闭
  startClose(speed = 1) {
    
    if (this.isEmergencyStopped) {
      this.eventService.emit('tailgate:warning', { message: 'Tailgate is in emergency stop state. Please reset emergency stop first.' });
      return false;
    }

    if (this.isClosed()) {
      this.eventService.emit('tailgate:warning', { message: 'Tailgate is already closed' });
      return false;
    }

    this.setSpeed(speed);
    this.targetAngle = this.config.minAngle;
    this.currentAction = 'closing';
    
    this.createCloseAnimation();
    this.timeline.play();
    this.isAnimating = true;
    
    this.eventService.emit('tailgate:closing', { speed, targetAngle: this.targetAngle });
    return true;
  }

  // 匀速开启
  openAtConstantSpeed(speed) {
    return this.startOpen(speed);
  }

  // 匀速关闭
  closeAtConstantSpeed(speed) {
    return this.startClose(speed);
  }

  // 设置开启角度
  setOpenAngle(angle) {
    if (angle < this.config.minAngle || angle > this.config.maxAngle) {
      this.eventService.emit('tailgate:error', { 
        message: `Angle must be between ${this.config.minAngle} and ${this.config.maxAngle}` 
      });
      return false;
    }
    
    this.targetAngle = angle;
    this.eventService.emit('tailgate:angleSet', { angle });
    return true;
  }

  // 获取当前角度
  getCurrentAngle() {
    return this.currentAngle;
  }

  // 移动到指定角度
  moveToAngle(angle, speed = 1) {
    if (this.isEmergencyStopped) {
      this.eventService.emit('tailgate:warning', { message: 'Tailgate is in emergency stop state. Please reset emergency stop first.' });
      return false;
    }

    if (angle < this.config.minAngle || angle > this.config.maxAngle) {
      this.eventService.emit('tailgate:error', { 
        message: `Angle must be between ${this.config.minAngle} and ${this.config.maxAngle}` 
      });
      return false;
    }

    this.setSpeed(speed);
    this.targetAngle = angle;
    this.currentAction = 'moving';
    
    this.createMoveToAnimation(angle);
    this.timeline.play();
    this.isAnimating = true;
    
    this.eventService.emit('tailgate:moving', { angle, speed });
    return true;
  }

  // 相对角度移动
  moveByAngle(deltaAngle, speed = 1) {
    if (this.isEmergencyStopped) {
      this.eventService.emit('tailgate:warning', { message: 'Tailgate is in emergency stop state. Please reset emergency stop first.' });
      return false;
    }

    const newAngle = this.currentAngle + deltaAngle;
    return this.moveToAngle(newAngle, speed);
  }

  // 软停止（减速停止）
  softStop() {
    if (this.timeline && this.isAnimating) {
      this.timeline.timeScale(0.5); // 软停止减速
      setTimeout(() => {
        if (this.timeline) {
          this.timeline.kill();
          this.isAnimating = false;
          this.isPaused = false;
          this.currentAction = null;
          this.eventService.emit('tailgate:softStopped', { angle: this.currentAngle });
        }
      }, 500); // 500ms后完全停止
    }
  }

  // 状态查询方法

  // 是否完全开启
  isOpen() {
    return Math.abs(this.currentAngle - this.config.maxAngle) < 1;
  }

  // 是否完全关闭
  isClosed() {
    return Math.abs(this.currentAngle - this.config.minAngle) < 1;
  }

  // 是否正在动画中
  isAnimating() {
    return this.isAnimating;
  }

  // 获取动画进度
  getAnimationProgress() {
    if (!this.timeline) return 0;
    return this.timeline.progress();
  }

  // 私有方法

  // 创建开启动画
  createOpenAnimation() {
    this.timeline.clear();
    this.timeline.to(this.element, {
      rotation: -this.config.maxAngle,
      transformOrigin: this.config.transformOrigin,
      duration: 2 / this.currentSpeed,
      ease: "power2.inOut"
    });
  }

  // 创建关闭动画
  createCloseAnimation() {
    this.timeline.clear();
    this.timeline.to(this.element, {
      rotation: -this.config.minAngle,
      transformOrigin: this.config.transformOrigin,
      duration: 2 / this.currentSpeed,
      ease: "power2.inOut"
    });
  }

  // 创建移动到指定角度的动画
  createMoveToAnimation(targetAngle) {
    this.timeline.clear();
    this.timeline.to(this.element, {
      rotation: -targetAngle,
      transformOrigin: this.config.transformOrigin,
      duration: Math.abs(targetAngle - this.currentAngle) / (50 * this.currentSpeed),
      ease: "power2.inOut"
    });
  }

  // 处理动画更新
  handleAnimationUpdate() {
    if (this.element) {
      const transform = window.getComputedStyle(this.element).transform;
      const matrix = new DOMMatrix(transform);
      const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
      this.currentAngle = Math.abs(angle);
      
      this.eventService.emit('tailgate:angleChanged', { 
        angle: this.currentAngle,
        progress: this.getAnimationProgress()
      });
    }
  }

  // 处理动画完成
  handleAnimationComplete() {
    this.isAnimating = false;
    this.isPaused = false;
    this.currentAction = null;
    
    // 只有在非紧急停止状态下才重置紧急停止状态
    if (!this.isEmergencyStopped) {
      this.isEmergencyStopped = false;
    }
    
    this.eventService.emit('tailgate:animationComplete', { 
      angle: this.currentAngle,
      isOpen: this.isOpen(),
      isClosed: this.isClosed()
    });
  }

  // 事件订阅方法
  on(eventName, callback) {
    return this.eventService.on(eventName, callback);
  }

  // 清理资源
  destroy() {
    if (this.timeline) {
      this.timeline.kill();
    }
    this.animationService.cleanup();
    this.eventService.clear();
  }

  // 创建紧急停止视觉效果
  createEmergencyStopEffect() {
    if (!this.element) return;
    
    // 创建新的时间线用于紧急停止效果
    const emergencyTimeline = this.animationService.createTimeline('emergency-stop', {
      onComplete: () => {
        // 清理紧急停止效果
        this.animationService.destroyTimeline('emergency-stop');
      }
    });
    
    // 添加红色闪烁效果 - 更明显的闪烁
    emergencyTimeline.to(this.element, {
      backgroundColor: 'rgba(255, 0, 0, 0.4)',
      boxShadow: '0 0 20px rgba(255, 0, 0, 0.6)',
      duration: 0.2,
      ease: "power2.inOut"
    })
    .to(this.element, {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      duration: 0.2,
      ease: "power2.inOut"
    })
    .to(this.element, {
      backgroundColor: 'rgba(255, 0, 0, 0.4)',
      boxShadow: '0 0 20px rgba(255, 0, 0, 0.6)',
      duration: 0.2,
      ease: "power2.inOut"
    })
    .to(this.element, {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      duration: 0.2,
      ease: "power2.inOut"
    })
    .to(this.element, {
      backgroundColor: 'rgba(255, 0, 0, 0.4)',
      boxShadow: '0 0 20px rgba(255, 0, 0, 0.6)',
      duration: 0.2,
      ease: "power2.inOut"
    })
    .to(this.element, {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      duration: 0.2,
      ease: "power2.inOut"
    })
    .to(this.element, {
      backgroundColor: 'rgba(255, 0, 0, 0.4)',
      boxShadow: '0 0 20px rgba(255, 0, 0, 0.6)',
      duration: 0.2,
      ease: "power2.inOut"
    })
    .to(this.element, {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      duration: 0.2,
      ease: "power2.inOut"
    });
    
    // 播放紧急停止效果
    emergencyTimeline.play();
  }
}

export default TailgateActionService; 