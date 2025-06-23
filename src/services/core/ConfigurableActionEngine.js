import EventService from './EventService.js';
import ConditionEvaluator from './ConditionEvaluator.js';
import ActionExecutor from './ActionExecutor.js';
import MonitorManager from './MonitorManager.js';

class ConfigurableActionEngine {
  constructor() {
    this.eventService = new EventService();
    this.conditionEvaluator = new ConditionEvaluator();
    this.actionExecutor = new ActionExecutor();
    this.monitorManager = new MonitorManager();
    
    this.isExecuting = false;
    this.currentConfig = null;
    this.executionContext = {};
  }
  
  // 执行配置化的动作
  async executeConfig(config, context = {}) {
    console.log(`ConfigurableActionEngine: 执行动作配置: ${config.name}`, config);
    
    if (this.isExecuting) {
      throw new Error('已有动作正在执行中');
    }
    
    // 1. 验证配置
    const validation = this.validateConfig(config);
    if (!validation.valid) {
      throw new Error(`配置验证失败: ${validation.error}`);
    }
    
    this.isExecuting = true;
    this.currentConfig = config;
    this.executionContext = { ...context, startTime: Date.now() };
    
    this.eventService.emit('config:executionStarted', {
      config,
      context: this.executionContext
    });
    
    try {
      // 2. 检查前置条件
      const preconditionsResult = await this.checkPreconditions(config.preconditions || []);
      if (!preconditionsResult.success) {
        this.handlePreconditionFailure(preconditionsResult);
        return false;
      }
      
      // 3. 启动监控
      this.startMonitors(config.monitors || []);
      
      // 4. 执行步骤
      const stepsResult = await this.executeSteps(config.steps || [], context);
      
      // 5. 停止监控
      this.stopMonitors();
      
      // 6. 执行后置动作
      await this.executePostActions(config.postActions || []);
      
      this.eventService.emit('config:executionCompleted', {
        config,
        result: stepsResult,
        context: this.executionContext
      });
      
      return stepsResult;
      
    } catch (error) {
      this.eventService.emit('config:executionError', {
        config,
        error: error.message,
        context: this.executionContext
      });
      throw error;
    } finally {
      this.isExecuting = false;
      this.currentConfig = null;
      this.executionContext = {};
    }
  }
  
  // 验证配置
  validateConfig(config) {
    if (!config || typeof config !== 'object') {
      return { valid: false, error: '配置必须是一个对象' };
    }
    
    if (!config.id || !config.name) {
      return { valid: false, error: '配置必须包含id和name字段' };
    }
    
    if (!Array.isArray(config.steps)) {
      return { valid: false, error: 'steps必须是数组' };
    }
    
    // 验证步骤
    for (let i = 0; i < config.steps.length; i++) {
      const step = config.steps[i];
      const stepValidation = this.validateStep(step, i);
      if (!stepValidation.valid) {
        return { valid: false, error: `步骤${i + 1}: ${stepValidation.error}` };
      }
    }
    
    return { valid: true };
  }
  
  // 验证单个步骤
  validateStep(step, index) {
    if (!step || typeof step !== 'object') {
      return { valid: false, error: '步骤必须是对象' };
    }
    
    if (!step.type) {
      return { valid: false, error: '步骤必须包含type字段' };
    }
    
    switch (step.type) {
      case 'action':
        if (!step.action) {
          return { valid: false, error: 'action类型步骤必须包含action字段' };
        }
        break;
      case 'wait':
        if (!step.duration && !step.condition) {
          return { valid: false, error: 'wait类型步骤必须包含duration或condition字段' };
        }
        break;
      case 'condition':
        if (!step.condition) {
          return { valid: false, error: 'condition类型步骤必须包含condition字段' };
        }
        break;
      default:
        return { valid: false, error: `未知的步骤类型: ${step.type}` };
    }
    
    return { valid: true };
  }
  
  // 检查前置条件
  async checkPreconditions(preconditions) {
    console.log('ConfigurableActionEngine: 检查前置条件', preconditions);
    
    for (const condition of preconditions) {
      const result = await this.conditionEvaluator.evaluate(condition);
      if (!result.success) {
        return {
          success: false,
          failedCondition: condition,
          error: result.error,
          actualValue: result.actualValue,
          expectedValue: result.expectedValue
        };
      }
    }
    return { success: true };
  }
  
  // 处理前置条件失败
  handlePreconditionFailure(result) {
    console.warn('ConfigurableActionEngine: 前置条件检查失败', result);
    
    this.eventService.emit('config:preconditionFailed', {
      failedCondition: result.failedCondition,
      error: result.error,
      actualValue: result.actualValue,
      expectedValue: result.expectedValue
    });
    
    // 根据配置决定失败处理方式
    if (result.failedCondition.onFail === 'abort') {
      throw new Error(`前置条件失败: ${result.error}`);
    }
  }
  
  // 执行步骤
  async executeSteps(steps, context) {
    console.log('ConfigurableActionEngine: 执行步骤', steps);
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      if (!this.isExecuting) {
        console.log('ConfigurableActionEngine: 执行被中断');
        break;
      }
      
      try {
        this.eventService.emit('config:stepStarted', { 
          step, 
          index: i, 
          total: steps.length 
        });
        
        await this.executeStep(step, context);
        
        this.eventService.emit('config:stepCompleted', { 
          step, 
          index: i 
        });
        
      } catch (error) {
        this.eventService.emit('config:stepError', { 
          step, 
          index: i, 
          error: error.message 
        });
        throw error;
      }
    }
  }
  
  // 执行单个步骤
  async executeStep(step, context) {
    console.log('ConfigurableActionEngine: 执行步骤', step);
    
    switch (step.type) {
      case 'action':
        return await this.actionExecutor.execute(step.action, step.params, context);
      case 'wait':
        return await this.handleWait(step);
      case 'condition':
        return await this.conditionEvaluator.evaluate(step.condition);
      default:
        throw new Error(`未知的步骤类型: ${step.type}`);
    }
  }
  
  // 处理等待步骤
  async handleWait(step) {
    if (step.duration) {
      console.log(`ConfigurableActionEngine: 等待 ${step.duration}ms`);
      await new Promise(resolve => setTimeout(resolve, step.duration));
    } else if (step.condition) {
      console.log('ConfigurableActionEngine: 等待条件满足', step.condition);
      await this.conditionEvaluator.waitForCondition(step.condition, step.timeout || 30000);
    }
  }
  
  // 启动监控
  startMonitors(monitors) {
    console.log('ConfigurableActionEngine: 启动监控', monitors);
    this.monitorManager.startMonitors(monitors, this.eventService);
  }
  
  // 停止监控
  stopMonitors() {
    console.log('ConfigurableActionEngine: 停止监控');
    this.monitorManager.stopMonitors();
  }
  
  // 执行后置动作
  async executePostActions(postActions) {
    console.log('ConfigurableActionEngine: 执行后置动作', postActions);
    
    for (const action of postActions) {
      try {
        await this.actionExecutor.execute(action.type, action.params, this.executionContext);
      } catch (error) {
        console.error('ConfigurableActionEngine: 后置动作执行失败', error);
        this.eventService.emit('config:postActionError', { action, error: error.message });
      }
    }
  }
  
  // 停止执行
  stop() {
    console.log('ConfigurableActionEngine: 停止执行');
    this.isExecuting = false;
    this.stopMonitors();
    this.eventService.emit('config:executionStopped');
  }
  
  // 暂停执行
  pause() {
    console.log('ConfigurableActionEngine: 暂停执行');
    this.eventService.emit('config:executionPaused');
  }
  
  // 恢复执行
  resume() {
    console.log('ConfigurableActionEngine: 恢复执行');
    this.eventService.emit('config:executionResumed');
  }
  
  // 获取执行状态
  getStatus() {
    return {
      isExecuting: this.isExecuting,
      currentConfig: this.currentConfig,
      executionContext: this.executionContext
    };
  }
  
  // 事件订阅
  on(eventName, callback) {
    return this.eventService.on(eventName, callback);
  }
  
  // 清理资源
  destroy() {
    this.stop();
    this.eventService.clear();
  }
}

export default ConfigurableActionEngine; 