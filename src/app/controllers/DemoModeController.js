import EventService from '../../services/core/EventService.js';
import StateMachineManager from './StateMachineManager.js';
import { getScenarioConfig } from '../orchestrator/scenarios/TailgateScenarios.js';

class DemoModeController {
  constructor(dummyService, motionService, stateService, faultService) {
    this.eventService = new EventService();
    this.dummyService = dummyService;
    this.motionService = motionService;
    this.stateService = stateService;
    this.faultService = faultService;
    this.stateMachine = new StateMachineManager();
    
    // 演示状态
    this.demoState = {
      isActive: false,
      currentScenario: null,
      scenarioProgress: 0,
      isExecuting: false,
      executionHistory: [],
      maxHistorySize: 50
    };
    
    // 演示配置
    this.demoConfig = {
      autoProgress: true,
      showFaults: true,
      faultProbability: 0.1, // 10% 故障概率
      scenarioTimeout: 30000 // 30秒超时
    };
    
    // 初始化事件监听
    this.initEventListeners();
  }

  // 初始化事件监听
  initEventListeners() {
    // 监听运动完成
    this.motionService.on('motion:positionReached', (motion) => {
      this.handleMotionComplete(motion);
    });
    
    this.motionService.on('motion:emergencyStop', (motion) => {
      this.handleEmergencyStop(motion);
    });
    
    // 监听状态变化
    this.stateService.on('state:updated', (update) => {
      this.handleStateUpdate(update);
    });
  }

  // 激活演示模式
  activate() {
    this.demoState.isActive = true;
    this.eventService.emit('demo:activated', {
      timestamp: Date.now()
    });
  }

  // 停用演示模式
  deactivate() {
    this.demoState.isActive = false;
    this.stopCurrentScenario();
    this.eventService.emit('demo:deactivated', {
      timestamp: Date.now()
    });
  }

  // 执行演示场景
  async executeDemoScenario(scenarioId) {
    if (!this.demoState.isActive) {
      this.eventService.emit('demo:error', {
        message: '演示模式未激活',
        scenarioId
      });
      return false;
    }

    const scenario = getScenarioConfig(scenarioId);
    if (!scenario) {
      this.eventService.emit('demo:error', {
        message: `场景不存在: ${scenarioId}`,
        scenarioId
      });
      return false;
    }

    // 停止当前场景
    this.stopCurrentScenario();

    // 设置新场景
    this.demoState.currentScenario = scenario;
    this.demoState.scenarioProgress = 0;
    this.demoState.isExecuting = true;

    this.eventService.emit('demo:scenarioStarted', {
      scenario,
      timestamp: Date.now()
    });

    try {
      await this.executeScenarioSequence(scenario);
    } catch (error) {
      this.eventService.emit('demo:error', {
        message: `场景执行失败: ${error.message}`,
        scenario,
        error
      });
      this.stopCurrentScenario();
      return false;
    }

    return true;
  }

  // 执行场景序列
  async executeScenarioSequence(scenario) {
    const { sequence, loop = false, maxLoops = 1 } = scenario;
    
    for (let loopIndex = 0; loopIndex < maxLoops; loopIndex++) {
      if (!this.demoState.isExecuting) {
        break;
      }

      this.eventService.emit('demo:loopStarted', {
        loopIndex: loopIndex + 1,
        maxLoops,
        scenario: this.demoState.currentScenario
      });

      for (let stepIndex = 0; stepIndex < sequence.length; stepIndex++) {
        if (!this.demoState.isExecuting) {
          break;
        }

        const step = sequence[stepIndex];
        this.demoState.scenarioProgress = (stepIndex / sequence.length) * 100;

        this.eventService.emit('demo:stepStarted', {
          step,
          stepIndex,
          totalSteps: sequence.length,
          progress: this.demoState.scenarioProgress
        });

        try {
          await this.executeScenarioStep(step);
        } catch (error) {
          this.eventService.emit('demo:stepError', {
            step,
            error: error.message
          });
          throw error;
        }

        this.eventService.emit('demo:stepCompleted', {
          step,
          stepIndex,
          progress: this.demoState.scenarioProgress
        });
      }

      this.eventService.emit('demo:loopCompleted', {
        loopIndex: loopIndex + 1,
        maxLoops,
        scenario: this.demoState.currentScenario
      });

      // 如果不是最后一个循环，等待一段时间
      if (loopIndex < maxLoops - 1 && this.demoState.isExecuting) {
        await this.wait(2000);
      }
    }

    this.eventService.emit('demo:scenarioCompleted', {
      scenario: this.demoState.currentScenario,
      timestamp: Date.now()
    });
  }

  // 执行场景步骤
  async executeScenarioStep(step) {
    const { action, params = {}, wait } = step;

    // 模拟故障（如果启用）
    if (this.demoConfig.showFaults && Math.random() < this.demoConfig.faultProbability) {
      await this.simulateRandomFault();
    }

    // 执行动作
    if (action) {
      await this.executeDemoAction(action, params);
    }

    // 等待
    if (wait) {
      await this.handleDemoWait(wait);
    }
  }

  // 执行演示动作
  async executeDemoAction(action, params) {
    switch (action) {
      case 'open':
        return this.executeDemoOpen(params);
      case 'close':
        return this.executeDemoClose(params);
      case 'moveToAngle':
        return this.executeDemoMoveToAngle(params);
      case 'emergencyStop':
        return this.executeDemoEmergencyStop(params);
      case 'simulateObstacle':
        return this.simulateObstacleDetection(params);
      case 'simulateHardwareFault':
        return this.simulateHardwareFault(params);
      case 'simulateMotorFault':
        return this.simulateMotorFault(params);
      default:
        this.eventService.emit('demo:warning', {
          message: `未知演示动作: ${action}`,
          action,
          params
        });
        return false;
    }
  }

  // 执行演示开启
  executeDemoOpen(params) {
    const { speed = 1 } = params;
    
    // 状态机转换
    if (this.stateMachine.startOpening()) {
      // 执行运动控制
      const success = this.motionService.openTailgate(speed);
      
      if (success) {
        this.eventService.emit('demo:actionExecuted', {
          action: 'open',
          params,
          timestamp: Date.now()
        });
        return true;
      }
    }
    
    return false;
  }

  // 执行演示关闭
  executeDemoClose(params) {
    const { speed = 1 } = params;
    
    // 状态机转换
    if (this.stateMachine.startClosing()) {
      // 执行运动控制
      const success = this.motionService.closeTailgate(speed);
      
      if (success) {
        this.eventService.emit('demo:actionExecuted', {
          action: 'close',
          params,
          timestamp: Date.now()
        });
        return true;
      }
    }
    
    return false;
  }

  // 执行演示移动到角度
  executeDemoMoveToAngle(params) {
    const { angle, speed = 1 } = params;
    
    // 状态机转换
    if (this.stateMachine.transition('opening', 'demo_move')) {
      // 执行运动控制
      const success = this.motionService.moveToPosition(angle, speed);
      
      if (success) {
        this.eventService.emit('demo:actionExecuted', {
          action: 'moveToAngle',
          params,
          timestamp: Date.now()
        });
        return true;
      }
    }
    
    return false;
  }

  // 执行演示紧急停止
  executeDemoEmergencyStop(params) {
    // 状态机转换
    if (this.stateMachine.emergencyStop()) {
      // 执行运动控制
      const success = this.motionService.emergencyStop();
      
      if (success) {
        this.eventService.emit('demo:actionExecuted', {
          action: 'emergencyStop',
          params,
          timestamp: Date.now()
        });
        return true;
      }
    }
    
    return false;
  }

  // 模拟障碍物检测
  simulateObstacleDetection(params) {
    const { distance = 30 } = params;
    
    const success = this.faultService.triggerObstacleDetection(distance);
    
    if (success) {
      this.eventService.emit('demo:actionExecuted', {
        action: 'simulateObstacle',
        params,
        timestamp: Date.now()
      });
    }
    
    return success;
  }

  // 模拟硬件故障
  simulateHardwareFault(params) {
    const { faultType = 'COMMUNICATION' } = params;
    
    const success = this.faultService.triggerHardwareFault(faultType, {
      simulated: true,
      ...params
    });
    
    if (success) {
      this.eventService.emit('demo:actionExecuted', {
        action: 'simulateHardwareFault',
        params,
        timestamp: Date.now()
      });
    }
    
    return success;
  }

  // 模拟电机故障
  simulateMotorFault(params) {
    const { faultType = 'OVERCURRENT' } = params;
    
    const success = this.faultService.triggerMotorFault(faultType, {
      simulated: true,
      ...params
    });
    
    if (success) {
      this.eventService.emit('demo:actionExecuted', {
        action: 'simulateMotorFault',
        params,
        timestamp: Date.now()
      });
    }
    
    return success;
  }

  // 模拟随机故障
  async simulateRandomFault() {
    const faultTypes = [
      { type: 'obstacle', method: 'triggerObstacleDetection' },
      { type: 'hardware', method: 'triggerHardwareFault', params: ['COMMUNICATION'] },
      { type: 'motor', method: 'triggerMotorFault', params: ['OVERCURRENT'] }
    ];
    
    const randomFault = faultTypes[Math.floor(Math.random() * faultTypes.length)];
    
    this.eventService.emit('demo:randomFaultTriggered', {
      faultType: randomFault.type,
      timestamp: Date.now()
    });
    
    // 等待一段时间后清除故障
    setTimeout(() => {
      this.clearSimulatedFault(randomFault.type);
    }, 3000);
  }

  // 清除模拟故障
  clearSimulatedFault(faultType) {
    switch (faultType) {
      case 'obstacle':
        this.faultService.clearObstacleDetection();
        break;
      case 'hardware':
        this.faultService.clearHardwareFault('COMMUNICATION');
        break;
      case 'motor':
        this.faultService.clearMotorFault('OVERCURRENT');
        break;
    }
    
    this.eventService.emit('demo:simulatedFaultCleared', {
      faultType,
      timestamp: Date.now()
    });
  }

  // 处理演示等待
  async handleDemoWait(wait) {
    const { type, value } = wait;
    
    switch (type) {
      case 'duration':
        await this.wait(value);
        break;
      case 'condition':
        await this.waitForCondition(value);
        break;
      case 'event':
        await this.waitForEvent(value);
        break;
      default:
        this.eventService.emit('demo:warning', {
          message: `未知等待类型: ${type}`,
          wait
        });
    }
  }

  // 等待指定时间
  wait(duration) {
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  // 等待条件满足
  waitForCondition(condition) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!this.demoState.isExecuting) {
          clearInterval(checkInterval);
          reject(new Error('演示已停止'));
          return;
        }
        
        if (this.stateService.checkCondition(condition)) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // 设置超时
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('条件等待超时'));
      }, this.demoConfig.scenarioTimeout);
    });
  }

  // 等待事件
  waitForEvent(eventName) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`事件等待超时: ${eventName}`));
      }, this.demoConfig.scenarioTimeout);
      
      const unsubscribe = this.eventService.on(eventName, () => {
        clearTimeout(timeout);
        unsubscribe();
        resolve();
      });
    });
  }

  // 停止当前场景
  stopCurrentScenario() {
    if (this.demoState.isExecuting) {
      this.demoState.isExecuting = false;
      this.demoState.currentScenario = null;
      this.demoState.scenarioProgress = 0;
      
      this.eventService.emit('demo:scenarioStopped', {
        timestamp: Date.now()
      });
    }
  }

  // 暂停场景
  pauseScenario() {
    if (this.demoState.isExecuting) {
      this.demoState.isExecuting = false;
      
      this.eventService.emit('demo:scenarioPaused', {
        timestamp: Date.now()
      });
    }
  }

  // 恢复场景
  resumeScenario() {
    if (this.demoState.currentScenario && !this.demoState.isExecuting) {
      this.demoState.isExecuting = true;
      
      this.eventService.emit('demo:scenarioResumed', {
        timestamp: Date.now()
      });
      
      // 重新执行场景
      this.executeDemoScenario(this.demoState.currentScenario.id);
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
    
    this.eventService.emit('demo:motionCompleted', {
      motion,
      timestamp: Date.now()
    });
  }

  // 处理紧急停止
  handleEmergencyStop(motion) {
    this.stateMachine.emergencyStop();
    
    this.eventService.emit('demo:emergencyStopExecuted', {
      motion,
      timestamp: Date.now()
    });
  }

  // 处理状态更新
  handleStateUpdate(update) {
    // 记录执行历史
    this.addToExecutionHistory({
      type: 'state_update',
      data: update,
      timestamp: Date.now()
    });
  }

  // 添加执行历史
  addToExecutionHistory(record) {
    this.demoState.executionHistory.push(record);
    
    // 限制历史记录大小
    if (this.demoState.executionHistory.length > this.demoState.maxHistorySize) {
      this.demoState.executionHistory.shift();
    }
  }

  // 获取演示状态
  getDemoState() {
    return {
      ...this.demoState,
      stateMachine: this.stateMachine.getCurrentState(),
      systemState: this.stateService.getStateSummary()
    };
  }

  // 获取执行历史
  getExecutionHistory(limit = 20) {
    return this.demoState.executionHistory.slice(-limit);
  }

  // 清除执行历史
  clearExecutionHistory() {
    this.demoState.executionHistory = [];
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

export default DemoModeController; 