import EventService from '../../services/core/EventService.js';
import StateMachineManager from './StateMachineManager.js';

class NormalModeController {
  constructor(inputService, stateService, motionService, faultService) {
    this.eventService = new EventService();
    this.inputService = inputService;
    this.stateService = stateService;
    this.motionService = motionService;
    this.faultService = faultService;
    this.stateMachine = new StateMachineManager();
    
    // 控制状态
    this.controlState = {
      isActive: false,
      lastRequestTime: null,
      requestQueue: [],
      maxQueueSize: 10
    };
    
    // 安全配置
    this.safetyConfig = {
      maxVehicleSpeedForOpening: 5, // km/h
      minDistanceToObstacle: 50, // cm
      maxTemperature: 80, // °C
      emergencyStopTimeout: 5000 // ms
    };
    
    // 车速安全状态跟踪
    this.speedSafetyState = {
      wasSpeedTooHigh: false,
      lastSpeedCheck: 0
    };
    
    // 初始化事件监听
    this.initEventListeners();
  }

  // 初始化事件监听
  initEventListeners() {
    // 监听输入请求
    this.inputService.on('input:request', (request) => {
      this.handleInputRequest(request);
    });
    
    // 监听故障事件
    this.faultService.on('fault:obstacleDetected', (fault) => {
      this.handleObstacleDetection(fault);
    });
    
    this.faultService.on('fault:hardwareFault', (fault) => {
      this.handleHardwareFault(fault);
    });
    
    this.faultService.on('fault:motorFault', (fault) => {
      this.handleMotorFault(fault);
    });
    
    // 监听状态变化
    this.stateService.on('vehicle:speedChanged', (change) => {
      this.handleVehicleSpeedChange(change);
    });
    
    this.stateService.on('environment:obstacleDetectionChanged', (change) => {
      this.handleObstacleDetectionChange(change);
    });
    
    // 监听运动完成
    this.motionService.on('motion:positionReached', (motion) => {
      this.handleMotionComplete(motion);
    });
    
    this.motionService.on('motion:emergencyStop', (motion) => {
      this.handleEmergencyStop(motion);
    });
  }

  // 激活控制器
  activate() {
    this.controlState.isActive = true;
    this.eventService.emit('controller:activated', {
      timestamp: Date.now()
    });
  }

  // 停用控制器
  deactivate() {
    this.controlState.isActive = false;
    this.eventService.emit('controller:deactivated', {
      timestamp: Date.now()
    });
  }

  // 处理输入请求
  handleInputRequest(request) {
    
    if (!this.controlState.isActive) {
      this.eventService.emit('controller:warning', {
        message: '控制器未激活，忽略请求',
        request
      });
      return;
    }

    // 检查前提条件
    if (!this.checkPrerequisites(request)) {
      this.eventService.emit('controller:warning', {
        message: '不满足前提条件，拒绝请求',
        request,
        reason: 'prerequisites_not_met'
      });
      return;
    }

    // 添加到请求队列
    this.addToRequestQueue(request);

    // 执行相应动作
    this.executeAction(request);
  }

  // 检查前提条件
  checkPrerequisites(request) {
    const systemState = this.stateService.getSystemState();
    
    // 检查系统状态
    if (systemState.system.status !== 'ready') {
      return false;
    }
    
    // 检查紧急停止状态
    if (this.stateMachine.isEmergencyStopped()) {
      return false;
    }
    
    // 根据请求类型检查特定条件
    switch (request.type) {
      case 'open_request':
        return this.checkOpenPrerequisites(systemState);
      case 'close_request':
        return this.checkClosePrerequisites(systemState);
      case 'emergency_stop_request':
        return true; // 紧急停止总是允许
      default:
        return true;
    }
  }

  // 检查开启前提条件
  checkOpenPrerequisites(systemState) {
    // 检查车速
    if (systemState.vehicle.speed > this.safetyConfig.maxVehicleSpeedForOpening) {
      // 记录车速过高状态
      this.speedSafetyState.wasSpeedTooHigh = true;
      
      this.eventService.emit('controller:warning', {
        message: `车速过高 (${systemState.vehicle.speed} km/h)，无法开启尾门`,
        reason: 'vehicle_speed_too_high'
      });
      return false;
    }
    
    // 检查障碍物
    if (systemState.environment.obstacleDetected) {
      this.eventService.emit('controller:warning', {
        message: '检测到障碍物，无法开启尾门',
        reason: 'obstacle_detected'
      });
      return false;
    }
    
    // 检查尾门状态
    if (systemState.tailgate.isOpen) {
      this.eventService.emit('controller:warning', {
        message: '尾门已开启',
        reason: 'tailgate_already_open'
      });
      return false;
    }
    
    return true;
  }

  // 检查关闭前提条件
  checkClosePrerequisites(systemState) {
    // 检查障碍物
    if (systemState.environment.obstacleDetected) {
      this.eventService.emit('controller:warning', {
        message: '检测到障碍物，无法关闭尾门',
        reason: 'obstacle_detected'
      });
      return false;
    }
    
    // 检查尾门状态
    if (systemState.tailgate.isClosed) {
      this.eventService.emit('controller:warning', {
        message: '尾门已关闭',
        reason: 'tailgate_already_closed'
      });
      return false;
    }
    
    return true;
  }

  // 执行动作
  executeAction(request) {
    switch (request.type) {
      case 'open_request':
        this.executeOpenAction(request);
        break;
      case 'close_request':
        this.executeCloseAction(request);
        break;
      case 'emergency_stop_request':
        this.executeEmergencyStopAction(request);
        break;
      case 'reset_emergency_request':
        this.executeResetEmergencyAction(request);
        break;
      default:
        this.eventService.emit('controller:warning', {
          message: `未知请求类型: ${request.type}`,
          request
        });
    }
  }

  // 执行开启动作
  executeOpenAction(request) {
    const currentState = this.stateMachine.getCurrentState();
    
    if (currentState.name === 'opening') {
      this.eventService.emit('controller:warning', {
        message: '尾门正在开启中',
        request
      });
      return;
    }
    
    // 状态机转换
    if (this.stateMachine.startOpening()) {
      // 执行运动控制
      const success = this.motionService.openTailgate(
        this.stateService.getTailgateState().speed
      );
      
      if (success) {
        this.eventService.emit('controller:actionExecuted', {
          action: 'open',
          request,
          timestamp: Date.now()
        });
      } else {
        // 回滚状态机
        this.stateMachine.transition('idle', 'motion_failed');
        this.eventService.emit('controller:error', {
          message: '开启动作执行失败',
          request
        });
      }
    }
  }

  // 执行关闭动作
  executeCloseAction(request) {
    const currentState = this.stateMachine.getCurrentState();
    
    if (currentState.name === 'closing') {
      this.eventService.emit('controller:warning', {
        message: '尾门正在关闭中',
        request
      });
      return;
    }
    
    // 状态机转换
    if (this.stateMachine.startClosing()) {
      // 执行运动控制
      const success = this.motionService.closeTailgate(
        this.stateService.getTailgateState().speed
      );
      
      if (success) {
        this.eventService.emit('controller:actionExecuted', {
          action: 'close',
          request,
          timestamp: Date.now()
        });
      } else {
        // 回滚状态机
        this.stateMachine.transition('idle', 'motion_failed');
        this.eventService.emit('controller:error', {
          message: '关闭动作执行失败',
          request
        });
      }
    }
  }

  // 执行紧急停止动作
  executeEmergencyStopAction(request) {
    // 状态机转换
    if (this.stateMachine.emergencyStop()) {
      // 执行运动控制
      const success = this.motionService.emergencyStop();
      
      if (success) {
        this.eventService.emit('controller:actionExecuted', {
          action: 'emergency_stop',
          request,
          timestamp: Date.now()
        });
      }
    }
  }

  // 执行重置紧急停止动作
  executeResetEmergencyAction(request) {
    // 状态机转换
    if (this.stateMachine.resetEmergencyStop()) {
      // 执行运动控制
      const success = this.motionService.resetEmergencyStop();
      
      if (success) {
        this.eventService.emit('controller:actionExecuted', {
          action: 'reset_emergency',
          request,
          timestamp: Date.now()
        });
      }
    }
  }

  // 处理障碍物检测
  handleObstacleDetection(fault) {
    if (this.stateMachine.isMoving()) {
      this.executeEmergencyStopAction({
        type: 'emergency_stop_request',
        data: { reason: 'obstacle_detected' }
      });
    }
  }

  // 处理硬件故障
  handleHardwareFault(fault) {
    if (this.stateMachine.isMoving()) {
      this.executeEmergencyStopAction({
        type: 'emergency_stop_request',
        data: { reason: 'hardware_fault' }
      });
    }
  }

  // 处理电机故障
  handleMotorFault(fault) {
    if (this.stateMachine.isMoving()) {
      this.executeEmergencyStopAction({
        type: 'emergency_stop_request',
        data: { reason: 'motor_fault' }
      });
    }
  }

  // 处理车速变化
  handleVehicleSpeedChange(change) {
    const newSpeed = change.data.newSpeed;
    const oldSpeed = change.data.oldSpeed;
    
    // 更新车速安全状态
    const wasTooHigh = this.speedSafetyState.wasSpeedTooHigh;
    const isNowSafe = newSpeed <= this.safetyConfig.maxVehicleSpeedForOpening;
    const wasSafe = oldSpeed <= this.safetyConfig.maxVehicleSpeedForOpening;
    
    // 如果之前车速过高，现在车速安全了，发出状态变化事件
    if (wasTooHigh && isNowSafe) {
      this.speedSafetyState.wasSpeedTooHigh = false;
      this.eventService.emit('controller:speedSafetyChanged', {
        isSafe: true,
        currentSpeed: newSpeed,
        maxSpeed: this.safetyConfig.maxVehicleSpeedForOpening,
        message: '车速已降至安全范围，可以开启尾门'
      });
    }
    
    // 如果车速从安全变为过高，记录状态
    if (wasSafe && !isNowSafe) {
      this.speedSafetyState.wasSpeedTooHigh = true;
      this.eventService.emit('controller:speedSafetyChanged', {
        isSafe: false,
        currentSpeed: newSpeed,
        maxSpeed: this.safetyConfig.maxVehicleSpeedForOpening,
        message: `车速过高，请等待车速降至${this.safetyConfig.maxVehicleSpeedForOpening} km/h以下`
      });
    }
    
    // 更新状态
    this.speedSafetyState.lastSpeedCheck = newSpeed;
    
    // 如果车速过高且尾门正在开启，执行紧急停止
    if (newSpeed > this.safetyConfig.maxVehicleSpeedForOpening && 
        this.stateMachine.isInState('opening')) {
      this.executeEmergencyStopAction({
        type: 'emergency_stop_request',
        data: { reason: 'vehicle_speed_too_high' }
      });
    }
  }

  // 处理障碍物检测变化
  handleObstacleDetectionChange(change) {
    if (change.data.newDetected && this.stateMachine.isMoving()) {
      this.executeEmergencyStopAction({
        type: 'emergency_stop_request',
        data: { reason: 'obstacle_detected' }
      });
    }
  }

  // 处理运动完成
  handleMotionComplete(motion) {
    const currentState = this.stateMachine.getCurrentState();
    
    if (currentState.name === 'opening') {
      this.stateMachine.completeOpening();
    } else if (currentState.name === 'closing') {
      this.stateMachine.completeClosing();
    }
    
    this.eventService.emit('controller:motionCompleted', {
      motion,
      timestamp: Date.now()
    });
  }

  // 处理紧急停止
  handleEmergencyStop(motion) {
    this.stateMachine.emergencyStop();
    
    this.eventService.emit('controller:emergencyStopExecuted', {
      motion,
      timestamp: Date.now()
    });
  }

  // 添加请求到队列
  addToRequestQueue(request) {
    this.controlState.requestQueue.push({
      ...request,
      timestamp: Date.now()
    });
    
    // 限制队列大小
    if (this.controlState.requestQueue.length > this.controlState.maxQueueSize) {
      this.controlState.requestQueue.shift();
    }
  }

  // 获取请求队列
  getRequestQueue() {
    return [...this.controlState.requestQueue];
  }

  // 清空请求队列
  clearRequestQueue() {
    this.controlState.requestQueue = [];
  }

  // 获取控制器状态
  getControllerState() {
    return {
      ...this.controlState,
      stateMachine: this.stateMachine.getCurrentState(),
      systemState: this.stateService.getStateSummary()
    };
  }

  // 事件监听
  on(eventName, callback) {
    return this.eventService.on(eventName, callback);
  }

  // 销毁控制器
  destroy() {
    this.stateMachine.destroy();
    this.eventService.destroy();
  }
}

export default NormalModeController; 