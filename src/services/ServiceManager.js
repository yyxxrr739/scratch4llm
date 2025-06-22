import InputRequestService from './atomic/InputRequestService.js';
import FaultEventService from './atomic/FaultEventService.js';
import MotionControlService from './atomic/MotionControlService.js';
import StateObservationService from './atomic/StateObservationService.js';
import DummyService from './atomic/DummyService.js';
import NormalModeController from './controllers/NormalModeController.js';
import DemoModeController from './controllers/DemoModeController.js';
import EnhancedActionOrchestrator from './orchestrator/EnhancedActionOrchestrator.js';

class ServiceManager {
  constructor() {
    // 原子服务实例
    this.atomicServices = {
      inputService: null,
      faultService: null,
      motionService: null,
      stateService: null,
      dummyService: null
    };
    
    // 控制器实例
    this.controllers = {
      normalController: null,
      demoController: null
    };
    
    // 编排器实例
    this.orchestrators = {
      enhancedOrchestrator: null
    };
    
    // 服务状态
    this.serviceState = {
      isInitialized: false,
      currentMode: 'normal', // 'normal' | 'demo'
      activeServices: new Set(),
      serviceHealth: new Map()
    };
    
    // 初始化服务
    this.initializeServices();
  }

  // 初始化所有服务
  initializeServices() {
    try {
      // 初始化原子服务
      this.initializeAtomicServices();
      
      // 初始化控制器
      this.initializeControllers();
      
      // 初始化编排器
      this.initializeOrchestrators();
      
      // 建立服务间的连接
      this.establishServiceConnections();
      
      // 启动服务监控
      this.startServiceMonitoring();
      
      // 激活正常模式控制器
      this.controllers.normalController.activate();
      
      this.serviceState.isInitialized = true;
      
      console.log('ServiceManager: 所有服务初始化完成');
    } catch (error) {
      console.error('ServiceManager: 服务初始化失败', error);
      throw error;
    }
  }

  // 初始化原子服务
  initializeAtomicServices() {
    // 输入请求服务
    this.atomicServices.inputService = new InputRequestService();
    this.serviceState.activeServices.add('inputService');
    
    // 故障事件服务
    this.atomicServices.faultService = new FaultEventService();
    this.serviceState.activeServices.add('faultService');
    
    // 运动控制服务
    this.atomicServices.motionService = new MotionControlService();
    this.serviceState.activeServices.add('motionService');
    
    // 状态观测服务
    this.atomicServices.stateService = new StateObservationService();
    this.serviceState.activeServices.add('stateService');
    
    // Dummy服务
    this.atomicServices.dummyService = new DummyService();
    this.serviceState.activeServices.add('dummyService');
  }

  // 初始化控制器
  initializeControllers() {
    const { inputService, stateService, motionService, faultService, dummyService } = this.atomicServices;
    
    // 正常模式控制器
    this.controllers.normalController = new NormalModeController(
      inputService,
      stateService,
      motionService,
      faultService
    );
    
    // 演示模式控制器
    this.controllers.demoController = new DemoModeController(
      dummyService,
      motionService,
      stateService,
      faultService
    );
  }

  // 初始化编排器
  initializeOrchestrators() {
    this.orchestrators.enhancedOrchestrator = new EnhancedActionOrchestrator();
    
    // 设置编排器的依赖服务
    this.orchestrators.enhancedOrchestrator.setSystemStateGetter(() => 
      this.atomicServices.stateService.getSystemState()
    );
    this.orchestrators.enhancedOrchestrator.setFaultService(this.atomicServices.faultService);
    this.orchestrators.enhancedOrchestrator.setStateService(this.atomicServices.stateService);
  }

  // 建立服务间的连接
  establishServiceConnections() {
    const { motionService, stateService } = this.atomicServices;
    
    // 运动服务位置更新 -> 状态服务
    motionService.on('motion:positionUpdated', (data) => {
      stateService.updateTailgateAngle(data.newAngle);
    });
    
    // 运动服务状态更新 -> 状态服务
    motionService.on('motion:stateChanged', (data) => {
      const motionState = data.motionState;
      stateService.updateTailgateState(motionState.currentAction || 'idle');
      stateService.updateTailgateSpeed(motionState.currentSpeed);
      stateService.updateTailgateTargetAngle(motionState.targetAngle);
      stateService.updateTailgateEmergencyStop(motionState.isEmergencyStopped);
    });
    
    // 输入服务车速更新 -> 状态服务
    this.atomicServices.inputService.on('input:speedChanged', (data) => {
      stateService.updateVehicleSpeed(data.newSpeed);
    });
    
    // 故障服务障碍物检测 -> 状态服务
    this.atomicServices.faultService.on('fault:obstacleDetected', (fault) => {
      stateService.updateObstacleDetection(true, fault.details.distance);
    });
    
    this.atomicServices.faultService.on('fault:obstacleCleared', () => {
      stateService.updateObstacleDetection(false);
    });
    
    // Dummy服务数据更新 -> 状态服务
    this.atomicServices.dummyService.on('dummy:dataUpdated', (data) => {
      stateService.updateVehicleSpeed(data.data.vehicleSpeed);
      stateService.updateTemperature(data.data.temperature);
      stateService.updateHumidity(data.data.humidity);
    });
    
    // 建立MotionControlService和TailgateActionService的连接
    // 这需要在TailgateAnimation组件初始化时建立
    this.setupMotionControlIntegration = (tailgateActionService) => {
      // MotionControlService的openTailgate -> TailgateActionService的startOpen
      const originalOpenTailgate = motionService.openTailgate.bind(motionService);
      motionService.openTailgate = (speed = 1) => {
        if (tailgateActionService) {
          const result = tailgateActionService.startOpen(speed);
          if (result) {
            // 更新MotionControlService的状态
            motionService.updateCurrentPosition(tailgateActionService.getCurrentAngle());
            motionService.setSpeed(speed);
          }
          return result;
        }
        return originalOpenTailgate(speed);
      };
      
      // MotionControlService的closeTailgate -> TailgateActionService的startClose
      const originalCloseTailgate = motionService.closeTailgate.bind(motionService);
      motionService.closeTailgate = (speed = 1) => {
        if (tailgateActionService) {
          const result = tailgateActionService.startClose(speed);
          if (result) {
            // 更新MotionControlService的状态
            motionService.updateCurrentPosition(tailgateActionService.getCurrentAngle());
            motionService.setSpeed(speed);
          }
          return result;
        }
        return originalCloseTailgate(speed);
      };
      
      // MotionControlService的emergencyStop -> TailgateActionService的emergencyStop
      const originalEmergencyStop = motionService.emergencyStop.bind(motionService);
      motionService.emergencyStop = () => {
        if (tailgateActionService) {
          const result = tailgateActionService.emergencyStop();
          if (result) {
            // 更新MotionControlService的状态
            motionService.updateCurrentPosition(tailgateActionService.getCurrentAngle());
          }
          return result;
        }
        return originalEmergencyStop();
      };
      
      // TailgateActionService的角度变化 -> MotionControlService
      tailgateActionService.on('tailgate:angleChanged', ({ angle }) => {
        motionService.updateCurrentPosition(angle);
      });
      
      // TailgateActionService的状态变化 -> MotionControlService
      tailgateActionService.on('tailgate:opening', ({ speed }) => {
        motionService.setSpeed(speed);
      });
      
      tailgateActionService.on('tailgate:closing', ({ speed }) => {
        motionService.setSpeed(speed);
      });
      
      tailgateActionService.on('tailgate:emergencyStop', () => {
        motionService.emergencyStop();
      });
    };
  }

  // 启动服务监控
  startServiceMonitoring() {
    setInterval(() => {
      this.checkServiceHealth();
    }, 5000); // 每5秒检查一次
  }

  // 检查服务健康状态
  checkServiceHealth() {
    const healthStatus = {};
    
    // 检查原子服务
    Object.entries(this.atomicServices).forEach(([name, service]) => {
      healthStatus[name] = {
        status: service ? 'healthy' : 'unhealthy',
        timestamp: Date.now()
      };
    });
    
    // 检查控制器
    Object.entries(this.controllers).forEach(([name, controller]) => {
      healthStatus[name] = {
        status: controller ? 'healthy' : 'unhealthy',
        timestamp: Date.now()
      };
    });
    
    // 检查编排器
    Object.entries(this.orchestrators).forEach(([name, orchestrator]) => {
      healthStatus[name] = {
        status: orchestrator ? 'healthy' : 'unhealthy',
        timestamp: Date.now()
      };
    });
    
    this.serviceState.serviceHealth = new Map(Object.entries(healthStatus));
  }

  // 切换模式
  switchMode(mode) {
    if (!['normal', 'demo'].includes(mode)) {
      throw new Error(`不支持的模式: ${mode}`);
    }
    
    const oldMode = this.serviceState.currentMode;
    
    // 停用当前模式
    if (oldMode === 'normal') {
      this.controllers.normalController.deactivate();
    } else if (oldMode === 'demo') {
      this.controllers.demoController.deactivate();
    }
    
    // 激活新模式
    if (mode === 'normal') {
      this.controllers.normalController.activate();
    } else if (mode === 'demo') {
      this.controllers.demoController.activate();
    }
    
    this.serviceState.currentMode = mode;
    
    console.log(`ServiceManager: 模式切换 ${oldMode} -> ${mode}`);
  }

  // 获取当前模式
  getCurrentMode() {
    return this.serviceState.currentMode;
  }

  // 获取服务实例
  getService(serviceName) {
    // 原子服务
    if (this.atomicServices[serviceName]) {
      return this.atomicServices[serviceName];
    }
    
    // 控制器
    if (this.controllers[serviceName]) {
      return this.controllers[serviceName];
    }
    
    // 编排器
    if (this.orchestrators[serviceName]) {
      return this.orchestrators[serviceName];
    }
    
    throw new Error(`服务不存在: ${serviceName}`);
  }

  // 获取所有服务状态
  getServiceState() {
    return {
      ...this.serviceState,
      serviceHealth: Object.fromEntries(this.serviceState.serviceHealth)
    };
  }

  // 获取系统状态摘要
  getSystemSummary() {
    const stateService = this.atomicServices.stateService;
    const faultService = this.atomicServices.faultService;
    const motionService = this.atomicServices.motionService;
    
    return {
      mode: this.serviceState.currentMode,
      systemState: stateService.getStateSummary(),
      faultState: faultService.getFaultState(),
      motionState: motionService.getMotionState(),
      activeFaults: faultService.getActiveFaults(),
      timestamp: Date.now()
    };
  }

  // 执行演示场景
  async executeDemoScenario(scenarioId) {
    if (this.serviceState.currentMode !== 'demo') {
      throw new Error('当前不在演示模式');
    }
    
    return await this.controllers.demoController.executeDemoScenario(scenarioId);
  }

  // 获取演示场景列表
  getDemoScenarios() {
    return this.atomicServices.dummyService.getScenarioList();
  }

  // 模拟输入请求
  simulateInputRequest(requestType, data = {}) {
    // 直接通过InputRequestService创建请求，这样会经过NormalModeController的安全检查
    const request = this.atomicServices.inputService.createRequest(requestType, data);
    
    // 同时也在DummyService中记录，保持兼容性
    this.atomicServices.dummyService.simulateInputRequest(requestType, data);
    
    return request;
  }

  // 模拟故障事件
  simulateFaultEvent(faultType, details = {}) {
    return this.atomicServices.dummyService.simulateFaultEvent(faultType, details);
  }

  // 清除所有故障
  clearAllFaults() {
    return this.atomicServices.faultService.clearAllFaults();
  }

  // 重置系统状态
  resetSystemState() {
    this.atomicServices.stateService.resetSystemState();
    this.atomicServices.motionService.resetMotionState();
    this.atomicServices.dummyService.resetDummyData();
  }

  // 获取服务事件监听器
  getEventListeners() {
    const listeners = {};
    
    // 收集所有服务的事件监听器
    Object.entries(this.atomicServices).forEach(([name, service]) => {
      listeners[name] = service.on.bind(service);
    });
    
    Object.entries(this.controllers).forEach(([name, controller]) => {
      listeners[name] = controller.on.bind(controller);
    });
    
    Object.entries(this.orchestrators).forEach(([name, orchestrator]) => {
      listeners[name] = orchestrator.on.bind(orchestrator);
    });
    
    return listeners;
  }

  // 销毁所有服务
  destroy() {
    console.log('ServiceManager: 开始销毁所有服务');
    
    // 销毁原子服务
    Object.values(this.atomicServices).forEach(service => {
      if (service && typeof service.destroy === 'function') {
        service.destroy();
      }
    });
    
    // 销毁控制器
    Object.values(this.controllers).forEach(controller => {
      if (controller && typeof controller.destroy === 'function') {
        controller.destroy();
      }
    });
    
    // 销毁编排器
    Object.values(this.orchestrators).forEach(orchestrator => {
      if (orchestrator && typeof orchestrator.destroy === 'function') {
        orchestrator.destroy();
      }
    });
    
    // 清空状态
    this.serviceState.isInitialized = false;
    this.serviceState.activeServices.clear();
    this.serviceState.serviceHealth.clear();
    
    console.log('ServiceManager: 所有服务已销毁');
  }
}

export default ServiceManager; 