import EventService from '../../services/core/EventService.js';
import ActionOrchestrator from './ActionOrchestrator.js';

class EnhancedActionOrchestrator extends ActionOrchestrator {
  constructor() {
    super();
    
    // 增强功能状态
    this.enhancedState = {
      isSafeMode: false,
      faultRecoveryEnabled: true,
      conditionCheckingEnabled: true,
      safetyChecksEnabled: true,
      maxRetryAttempts: 3,
      retryDelay: 1000, // ms
      safetyTimeout: 30000 // ms
    };
    
    // 安全配置
    this.safetyConfig = {
      maxVehicleSpeed: 30, // km/h
      minObstacleDistance: 50, // cm
      maxTemperature: 80, // °C
      maxContinuousOperationTime: 60000, // ms
      emergencyStopOnFault: true
    };
    
    // 条件检查器
    this.conditionCheckers = new Map();
    this.initConditionCheckers();
  }

  // 初始化条件检查器
  initConditionCheckers() {
    // 车速条件检查器
    this.conditionCheckers.set('vehicle_speed_safe', (systemState) => {
      return systemState.vehicle.speed <= this.safetyConfig.maxVehicleSpeed;
    });
    
    // 障碍物条件检查器
    this.conditionCheckers.set('obstacle_clear', (systemState) => {
      return !systemState.environment.obstacleDetected;
    });
    
    // 温度条件检查器
    this.conditionCheckers.set('temperature_safe', (systemState) => {
      return systemState.environment.temperature <= this.safetyConfig.maxTemperature;
    });
    
    // 系统状态检查器
    this.conditionCheckers.set('system_ready', (systemState) => {
      return systemState.system.status === 'ready';
    });
    
    // 尾门状态检查器
    this.conditionCheckers.set('tailgate_ready', (systemState) => {
      return !systemState.tailgate.isEmergencyStopped && 
             systemState.tailgate.state !== 'emergency_stop';
    });
  }

  // 带条件控制的执行
  async executeWithConditions(actions, conditions = []) {
    if (!this.enhancedState.conditionCheckingEnabled) {
      return await this.executeSequence(actions);
    }

    this.eventService.emit('enhanced:conditionalExecutionStarted', {
      actions,
      conditions,
      timestamp: Date.now()
    });

    try {
      for (const action of actions) {
        // 检查前置条件
        if (action.preconditions) {
          await this.waitForConditions(action.preconditions);
        }
        
        // 执行动作
        await this.executeAction(action);
        
        // 检查后置条件
        if (action.postconditions) {
          await this.waitForConditions(action.postconditions);
        }
      }
      
      this.eventService.emit('enhanced:conditionalExecutionCompleted', {
        actions,
        conditions,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      this.eventService.emit('enhanced:conditionalExecutionFailed', {
        actions,
        conditions,
        error: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  // 等待条件满足
  async waitForConditions(conditions) {
    const conditionPromises = conditions.map(condition => 
      this.waitForCondition(condition)
    );
    
    await Promise.all(conditionPromises);
  }

  // 等待单个条件
  async waitForCondition(condition) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`条件等待超时: ${condition.type}`));
      }, this.enhancedState.safetyTimeout);
      
      const checkInterval = setInterval(() => {
        if (!this.isExecuting) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          reject(new Error('执行已停止'));
          return;
        }
        
        if (this.checkCondition(condition)) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          resolve();
        }
      }, 100);
    });
  }

  // 检查条件
  checkCondition(condition) {
    const { type, check } = condition;
    
    // 使用预定义的条件检查器
    if (this.conditionCheckers.has(type)) {
      const systemState = this.getSystemState();
      return this.conditionCheckers.get(type)(systemState);
    }
    
    // 使用自定义检查函数
    if (typeof check === 'function') {
      const systemState = this.getSystemState();
      return check(systemState);
    }
    
    return false;
  }

  // 故障恢复执行
  async executeWithFaultRecovery(actions) {
    if (!this.enhancedState.faultRecoveryEnabled) {
      return await this.executeSequence(actions);
    }

    this.eventService.emit('enhanced:faultRecoveryExecutionStarted', {
      actions,
      timestamp: Date.now()
    });

    let retryCount = 0;
    
    while (retryCount < this.enhancedState.maxRetryAttempts) {
      try {
        const result = await this.executeSequence(actions);
        
        this.eventService.emit('enhanced:faultRecoveryExecutionCompleted', {
          actions,
          retryCount,
          timestamp: Date.now()
        });
        
        return result;
      } catch (error) {
        retryCount++;
        
        this.eventService.emit('enhanced:faultRecoveryRetry', {
          actions,
          error: error.message,
          retryCount,
          maxRetries: this.enhancedState.maxRetryAttempts,
          timestamp: Date.now()
        });
        
        if (retryCount >= this.enhancedState.maxRetryAttempts) {
          this.eventService.emit('enhanced:faultRecoveryFailed', {
            actions,
            error: error.message,
            retryCount,
            timestamp: Date.now()
          });
          throw error;
        }
        
        // 等待重试
        await this.wait(this.enhancedState.retryDelay);
        
        // 尝试故障恢复
        await this.performFaultRecovery();
      }
    }
  }

  // 执行故障恢复
  async performFaultRecovery() {
    this.eventService.emit('enhanced:faultRecoveryStarted', {
      timestamp: Date.now()
    });
    
    try {
      // 清除所有故障
      await this.clearAllFaults();
      
      // 重置系统状态
      await this.resetSystemState();
      
      this.eventService.emit('enhanced:faultRecoveryCompleted', {
        timestamp: Date.now()
      });
    } catch (error) {
      this.eventService.emit('enhanced:faultRecoveryFailed', {
        error: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  // 清除所有故障
  async clearAllFaults() {
    // 这里应该调用故障服务来清除故障
    // 暂时使用模拟实现
    this.eventService.emit('enhanced:faultsCleared', {
      timestamp: Date.now()
    });
  }

  // 重置系统状态
  async resetSystemState() {
    // 这里应该调用状态服务来重置状态
    // 暂时使用模拟实现
    this.eventService.emit('enhanced:systemStateReset', {
      timestamp: Date.now()
    });
  }

  // 安全模式执行
  async executeInSafeMode(actions) {
    if (!this.enhancedState.safetyChecksEnabled) {
      return await this.executeSequence(actions);
    }

    this.enhancedState.isSafeMode = true;
    
    this.eventService.emit('enhanced:safeModeExecutionStarted', {
      actions,
      timestamp: Date.now()
    });

    try {
      // 创建安全检查
      const safetyChecks = this.createSafetyChecks(actions);
      
      // 执行带安全条件的动作
      const result = await this.executeWithConditions(actions, safetyChecks);
      
      this.eventService.emit('enhanced:safeModeExecutionCompleted', {
        actions,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      this.eventService.emit('enhanced:safeModeExecutionFailed', {
        actions,
        error: error.message,
        timestamp: Date.now()
      });
      throw error;
    } finally {
      this.enhancedState.isSafeMode = false;
    }
  }

  // 创建安全检查
  createSafetyChecks(actions) {
    const safetyChecks = [];
    
    for (const action of actions) {
      const actionChecks = [];
      
      // 根据动作类型添加相应的安全检查
      switch (action.action) {
        case 'open':
        case 'close':
        case 'moveToAngle':
          actionChecks.push(
            { type: 'vehicle_speed_safe' },
            { type: 'obstacle_clear' },
            { type: 'system_ready' },
            { type: 'tailgate_ready' }
          );
          break;
        case 'emergencyStop':
          // 紧急停止不需要安全检查
          break;
        default:
          actionChecks.push(
            { type: 'system_ready' },
            { type: 'tailgate_ready' }
          );
      }
      
      if (actionChecks.length > 0) {
        action.preconditions = actionChecks;
      }
    }
    
    return safetyChecks;
  }

  // 并行执行增强
  async executeParallel(service, actions, options = {}) {
    const { maxConcurrent = 3, timeout = 30000 } = options;
    
    this.eventService.emit('enhanced:parallelExecutionStarted', {
      actions,
      options,
      timestamp: Date.now()
    });

    try {
      const results = [];
      const actionChunks = this.chunkArray(actions, maxConcurrent);
      
      for (const chunk of actionChunks) {
        const chunkPromises = chunk.map(action => 
          this.executeActionWithTimeout(service, action, timeout)
        );
        
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
      }
      
      this.eventService.emit('enhanced:parallelExecutionCompleted', {
        actions,
        results,
        timestamp: Date.now()
      });
      
      return results;
    } catch (error) {
      this.eventService.emit('enhanced:parallelExecutionFailed', {
        actions,
        error: error.message,
        timestamp: Date.now()
      });
      throw error;
    }
  }

  // 带超时的动作执行
  async executeActionWithTimeout(service, action, timeout) {
    return Promise.race([
      this.executeAction(service, action),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('动作执行超时')), timeout)
      )
    ]);
  }

  // 数组分块
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // 条件执行
  async executeIf(condition, action, service) {
    if (this.checkCondition(condition)) {
      return await this.executeAction(service, action);
    } else {
      this.eventService.emit('enhanced:conditionalActionSkipped', {
        condition,
        action,
        timestamp: Date.now()
      });
      return null;
    }
  }

  // 循环执行增强
  async executeLoop(action, times, service, options = {}) {
    const { condition, breakOnError = false } = options;
    
    this.eventService.emit('enhanced:loopExecutionStarted', {
      action,
      times,
      options,
      timestamp: Date.now()
    });

    const results = [];
    
    for (let i = 0; i < times; i++) {
      try {
        // 检查循环条件
        if (condition && !this.checkCondition(condition)) {
          this.eventService.emit('enhanced:loopConditionFailed', {
            action,
            iteration: i,
            condition,
            timestamp: Date.now()
          });
          break;
        }
        
        const result = await this.executeAction(service, action);
        results.push(result);
        
        this.eventService.emit('enhanced:loopIterationCompleted', {
          action,
          iteration: i + 1,
          total: times,
          result,
          timestamp: Date.now()
        });
      } catch (error) {
        this.eventService.emit('enhanced:loopIterationFailed', {
          action,
          iteration: i + 1,
          error: error.message,
          timestamp: Date.now()
        });
        
        if (breakOnError) {
          throw error;
        }
      }
    }
    
    this.eventService.emit('enhanced:loopExecutionCompleted', {
      action,
      times,
      results,
      timestamp: Date.now()
    });
    
    return results;
  }

  // 获取系统状态（需要外部注入）
  getSystemState() {
    // 这里应该从状态服务获取系统状态
    // 暂时返回模拟数据
    return {
      vehicle: { speed: 0 },
      environment: { obstacleDetected: false, temperature: 25 },
      system: { status: 'ready' },
      tailgate: { isEmergencyStopped: false, state: 'idle' }
    };
  }

  // 设置系统状态获取器
  setSystemStateGetter(getter) {
    this.getSystemState = getter;
  }

  // 设置故障服务
  setFaultService(faultService) {
    this.faultService = faultService;
  }

  // 设置状态服务
  setStateService(stateService) {
    this.stateService = stateService;
  }

  // 获取增强状态
  getEnhancedState() {
    return {
      ...this.enhancedState,
      safetyConfig: this.safetyConfig
    };
  }

  // 更新增强配置
  updateEnhancedConfig(config) {
    this.enhancedState = {
      ...this.enhancedState,
      ...config
    };
    
    this.eventService.emit('enhanced:configUpdated', {
      config: this.enhancedState,
      timestamp: Date.now()
    });
  }

  // 更新安全配置
  updateSafetyConfig(config) {
    this.safetyConfig = {
      ...this.safetyConfig,
      ...config
    };
    
    this.eventService.emit('enhanced:safetyConfigUpdated', {
      config: this.safetyConfig,
      timestamp: Date.now()
    });
  }

  // 添加条件检查器
  addConditionChecker(type, checker) {
    this.conditionCheckers.set(type, checker);
    
    this.eventService.emit('enhanced:conditionCheckerAdded', {
      type,
      timestamp: Date.now()
    });
  }

  // 移除条件检查器
  removeConditionChecker(type) {
    this.conditionCheckers.delete(type);
    
    this.eventService.emit('enhanced:conditionCheckerRemoved', {
      type,
      timestamp: Date.now()
    });
  }

  // 等待方法
  wait(duration) {
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }
}

export default EnhancedActionOrchestrator; 