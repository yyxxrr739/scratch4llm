import { ActionTypes } from '../config/ActionTypes.js';

class ActionExecutor {
  constructor() {
    this.actionTypes = ActionTypes;
    this.eventService = null;
    this.tailgateService = null;
  }
  
  // 设置依赖服务
  setServices(eventService, tailgateService) {
    this.eventService = eventService;
    this.tailgateService = tailgateService;
  }
  
  // 执行动作
  async execute(action, params = {}, context = {}) {
    
    if (!action) {
      throw new Error('动作名称不能为空');
    }
    
    const actionType = this.actionTypes[action];
    if (!actionType) {
      throw new Error(`未知的动作类型: ${action}`);
    }
    
    // 验证参数
    const validation = this.validateActionParams(action, params);
    if (!validation.valid) {
      throw new Error(`动作参数验证失败: ${validation.error}`);
    }
    
    try {
      this.eventService?.emit('action:executionStarted', { action, params });
      
      let result;
      
      switch (action) {
        case 'open':
          result = await this.executeOpen(params, context);
          break;
        case 'close':
          result = await this.executeClose(params, context);
          break;
        case 'moveToAngle':
          result = await this.executeMoveToAngle(params, context);
          break;
        case 'moveByAngle':
          result = await this.executeMoveByAngle(params, context);
          break;
        case 'emergencyStop':
          result = await this.executeEmergencyStop(params, context);
          break;
        case 'wait':
          result = await this.executeWait(params, context);
          break;
        case 'updateStatus':
          result = await this.executeUpdateStatus(params, context);
          break;
        case 'setSpeed':
          result = await this.executeSetSpeed(params, context);
          break;
        case 'pause':
          result = await this.executePause(params, context);
          break;
        case 'resume':
          result = await this.executeResume(params, context);
          break;
        default:
          throw new Error(`未实现的动作类型: ${action}`);
      }
      
      this.eventService?.emit('action:executionCompleted', { action, params, result });
      return result;
      
    } catch (error) {
      this.eventService?.emit('action:executionError', { action, params, error: error.message });
      throw error;
    }
  }
  
  // 执行开门动作
  async executeOpen(params, context) {
    
    if (!this.tailgateService) {
      throw new Error('尾门服务未初始化');
    }
    
    const speed = params.speed || 1;
    const result = this.tailgateService.start({ action: 'open', speed });
    
    return {
      success: result,
      action: 'open',
      speed,
      timestamp: Date.now()
    };
  }
  
  // 执行关门动作
  async executeClose(params, context) {
    
    if (!this.tailgateService) {
      throw new Error('尾门服务未初始化');
    }
    
    const speed = params.speed || 1;
    const result = this.tailgateService.start({ action: 'close', speed });
    
    return {
      success: result,
      action: 'close',
      speed,
      timestamp: Date.now()
    };
  }
  
  // 执行移动到指定角度
  async executeMoveToAngle(params, context) {
    
    if (!this.tailgateService) {
      throw new Error('尾门服务未初始化');
    }
    
    const { angle, speed = 1 } = params;
    
    if (angle === undefined || angle === null) {
      throw new Error('moveToAngle动作必须指定angle参数');
    }
    
    const result = this.tailgateService.start({ 
      action: 'moveToAngle', 
      angle, 
      speed 
    });
    
    return {
      success: result,
      action: 'moveToAngle',
      angle,
      speed,
      timestamp: Date.now()
    };
  }
  
  // 执行相对角度移动
  async executeMoveByAngle(params, context) {
    
    if (!this.tailgateService) {
      throw new Error('尾门服务未初始化');
    }
    
    const { deltaAngle, speed = 1 } = params;
    
    if (deltaAngle === undefined || deltaAngle === null) {
      throw new Error('moveByAngle动作必须指定deltaAngle参数');
    }
    
    const result = this.tailgateService.start({ 
      action: 'moveByAngle', 
      deltaAngle, 
      speed 
    });
    
    return {
      success: result,
      action: 'moveByAngle',
      deltaAngle,
      speed,
      timestamp: Date.now()
    };
  }
  
  // 执行紧急停止
  async executeEmergencyStop(params, context) {
    
    if (!this.tailgateService) {
      throw new Error('尾门服务未初始化');
    }
    
    const result = this.tailgateService.start({ action: 'emergencyStop' });
    
    return {
      success: result,
      action: 'emergencyStop',
      timestamp: Date.now()
    };
  }
  
  // 执行等待
  async executeWait(params, context) {
    
    const { duration, condition } = params;
    
    if (duration) {
      await new Promise(resolve => setTimeout(resolve, duration));
      return {
        success: true,
        action: 'wait',
        duration,
        timestamp: Date.now()
      };
    } else if (condition) {
      // 等待条件满足的逻辑在ConfigurableActionEngine中处理
      return {
        success: true,
        action: 'wait',
        condition,
        timestamp: Date.now()
      };
    } else {
      throw new Error('wait动作必须指定duration或condition参数');
    }
  }
  
  // 执行状态更新
  async executeUpdateStatus(params, context) {
    const { state, data } = params;
    
    if (!state) {
      throw new Error('updateStatus动作必须指定state参数');
    }
    
    // 更新全局状态
    if (data) {
      Object.assign(window, data);
    }
    
    // 更新特定状态
    switch (state) {
      case 'open':
        window.currentTailgateState = 'open';
        break;
      case 'closed':
        window.currentTailgateState = 'closed';
        break;
      case 'opening':
        window.currentTailgateState = 'opening';
        break;
      case 'closing':
        window.currentTailgateState = 'closing';
        break;
      case 'paused':
        window.currentTailgateState = 'paused';
        break;
      case 'emergency_stop':
        window.currentTailgateState = 'emergency_stop';
        break;
      default:
        window.currentTailgateState = state;
    }
    
    return {
      success: true,
      action: 'updateStatus',
      state,
      data,
      timestamp: Date.now()
    };
  }
  
  // 执行设置速度
  async executeSetSpeed(params, context) {
    if (!this.tailgateService) {
      throw new Error('尾门服务未初始化');
    }
    
    const { speed } = params;
    
    if (speed === undefined || speed === null) {
      throw new Error('setSpeed动作必须指定speed参数');
    }
    
    const result = this.tailgateService.setSpeed(speed);
    
    return {
      success: result,
      action: 'setSpeed',
      speed,
      timestamp: Date.now()
    };
  }
  
  // 执行暂停
  async executePause(params, context) {
    if (!this.tailgateService) {
      throw new Error('尾门服务未初始化');
    }
    
    // 这里需要根据实际的尾门服务接口来实现
    // 暂时使用模拟实现
    const result = true;
    
    return {
      success: result,
      action: 'pause',
      timestamp: Date.now()
    };
  }
  
  // 执行恢复
  async executeResume(params, context) {
    if (!this.tailgateService) {
      throw new Error('尾门服务未初始化');
    }
    
    // 这里需要根据实际的尾门服务接口来实现
    // 暂时使用模拟实现
    const result = true;
    
    return {
      success: result,
      action: 'resume',
      timestamp: Date.now()
    };
  }
  
  // 验证动作参数
  validateActionParams(action, params) {
    const actionType = this.actionTypes[action];
    if (!actionType) {
      return { valid: false, error: `未知的动作类型: ${action}` };
    }
    
    const requiredParams = actionType.params || {};
    
    for (const [paramName, paramConfig] of Object.entries(requiredParams)) {
      if (paramConfig.required && (params[paramName] === undefined || params[paramName] === null)) {
        return { valid: false, error: `缺少必需参数: ${paramName}` };
      }
      
      if (params[paramName] !== undefined && params[paramName] !== null) {
        // 类型检查
        if (paramConfig.type && typeof params[paramName] !== paramConfig.type) {
          return { valid: false, error: `参数${paramName}类型错误，期望${paramConfig.type}` };
        }
        
        // 范围检查
        if (paramConfig.min !== undefined && params[paramName] < paramConfig.min) {
          return { valid: false, error: `参数${paramName}值过小，最小值为${paramConfig.min}` };
        }
        
        if (paramConfig.max !== undefined && params[paramName] > paramConfig.max) {
          return { valid: false, error: `参数${paramName}值过大，最大值为${paramConfig.max}` };
        }
      }
    }
    
    return { valid: true };
  }
  
  // 获取动作类型信息
  getActionTypeInfo(action) {
    return this.actionTypes[action];
  }
  
  // 获取所有支持的动作类型
  getSupportedActionTypes() {
    return Object.keys(this.actionTypes);
  }
  
  // 获取动作类型的参数定义
  getActionTypeParams(action) {
    const actionType = this.actionTypes[action];
    return actionType ? actionType.params : {};
  }
}

export default ActionExecutor; 