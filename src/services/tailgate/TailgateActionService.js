import AnimationService from '../core/AnimationService.js';
import EventService from '../core/EventService.js';

class TailgateActionService {
  constructor() {
    this.animationService = new AnimationService();
    this.eventService = new EventService();
    
    this.currentAction = null;
    this.isAnimating = false;
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
    console.log('TailgateActionService: start called', params);
    
    const { action, speed = this.currentSpeed, angle } = params;
    
    // 如果是紧急停止动作，直接执行
    if (action === 'emergencyStop') {
      console.log('TailgateActionService: Executing emergencyStop action');
      return this.emergencyStop();
    }
    
    // 对于其他动作，如果处于紧急停止状态，先重置状态
    if (this.isEmergencyStopped) {
      console.log('TailgateActionService: Resetting emergency stop state');
      this.resetEmergencyStop();
    }
    
    console.log('TailgateActionService: Processing action', { action, speed, angle });
    
    switch (action) {
      case 'open':
        console.log('TailgateActionService: Executing open action');
        return this.startOpen(speed);
      case 'close':
        console.log('TailgateActionService: Executing close action');
        return this.startClose(speed);
      case 'moveToAngle':
        console.log('TailgateActionService: Executing moveToAngle action', { angle, speed });
        return this.moveToAngle(angle, speed);
      case 'moveByAngle':
        console.log('TailgateActionService: Executing moveByAngle action', { angle, speed });
        return this.moveByAngle(angle, speed);
      case 'emergencyStop':
        console.log('TailgateActionService: Executing emergencyStop action');
        return this.emergencyStop();
      default:
        console.error('TailgateActionService: Unknown action', action);
        this.eventService.emit('tailgate:error', { message: 'Unknown action' });
        return false;
    }
  }

  // 停止动作
  stop() {
    if (this.timeline && this.isAnimating) {
      this.timeline.pause();
      this.isAnimating = false;
      this.currentAction = null;
      this.eventService.emit('tailgate:stopped', { angle: this.currentAngle });
      return true;
    }
    return false;
  }

  // 暂停动作
  pause() {
    if (this.timeline && this.isAnimating) {
      this.timeline.pause();
      this.eventService.emit('tailgate:paused', { angle: this.currentAngle });
      return true;
    }
    return false;
  }

  // 恢复动作
  resume() {
    if (this.timeline && !this.isAnimating) {
      this.timeline.resume();
      this.isAnimating = true;
      this.eventService.emit('tailgate:resumed', { angle: this.currentAngle });
      return true;
    }
    return false;
  }

  // 紧急停止
  emergencyStop() {
    if (!this.timeline || !this.isAnimating) {
      // 如果尾门已经静止，不执行紧急停止，但返回true避免编排器报错
      this.eventService.emit('tailgate:warning', { 
        message: '尾门已经静止，无需紧急停止' 
      });
      return true; // 改为返回true，避免编排器报错
    }
    
    // 设置紧急停止状态
    this.isEmergencyStopped = true;
    this.currentAction = 'emergencyStopping';
    
    // 发出紧急停止开始事件
    this.eventService.emit('tailgate:emergencyStopStarted', { angle: this.currentAngle });
    
    // 实现快速减速停止逻辑（比软停止更快）
    this.timeline.timeScale(0.2); // 减速到20%的速度
    
    // 在较短时间内完全停止
    setTimeout(() => {
      this.timeline.kill();
      this.isAnimating = false;
      this.currentAction = null;
      
      // 保持紧急停止状态，不重置
      this.eventService.emit('tailgate:emergencyStop', { angle: this.currentAngle });
    }, 300); // 300ms后完全停止，比软停止的500ms更快
    
    // 添加紧急停止的视觉反馈
    this.createEmergencyStopEffect();
    
    return true;
  }

  // 重置紧急停止状态
  resetEmergencyStop() {
    this.isEmergencyStopped = false;
    this.eventService.emit('tailgate:emergencyStopReset');
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
      isClosed: this.isClosed()
    };
  }

  // 尾门专用动作服务

  // 启动尾门开启
  startOpen(speed = 1) {
    if (this.isOpen()) {
      this.eventService.emit('tailgate:warning', { message: 'Tailgate is already open' });
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
    const newAngle = this.currentAngle + deltaAngle;
    return this.moveToAngle(newAngle, speed);
  }

  // 软停止（减速停止）
  softStop() {
    if (this.timeline && this.isAnimating) {
      // 实现减速停止逻辑
      this.timeline.timeScale(0.5);
      setTimeout(() => {
        this.stop();
      }, 500);
      this.eventService.emit('tailgate:softStop', { angle: this.currentAngle });
      return true;
    }
    return false;
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
    
    // 添加红色闪烁效果
    emergencyTimeline.to(this.element, {
      backgroundColor: 'rgba(255, 0, 0, 0.3)',
      duration: 0.1,
      ease: "power2.inOut"
    })
    .to(this.element, {
      backgroundColor: 'transparent',
      duration: 0.1,
      ease: "power2.inOut"
    })
    .to(this.element, {
      backgroundColor: 'rgba(255, 0, 0, 0.3)',
      duration: 0.1,
      ease: "power2.inOut"
    })
    .to(this.element, {
      backgroundColor: 'transparent',
      duration: 0.1,
      ease: "power2.inOut"
    })
    .to(this.element, {
      backgroundColor: 'rgba(255, 0, 0, 0.3)',
      duration: 0.1,
      ease: "power2.inOut"
    })
    .to(this.element, {
      backgroundColor: 'transparent',
      duration: 0.1,
      ease: "power2.inOut"
    });
    
    // 播放紧急停止效果
    emergencyTimeline.play();
  }
}

export default TailgateActionService; 