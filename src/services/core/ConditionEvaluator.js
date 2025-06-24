import { ConditionTypes } from '../config/ConditionTypes.js';

class ConditionEvaluator {
  constructor() {
    this.conditionTypes = ConditionTypes;
  }
  
  // 评估条件
  async evaluate(condition) {
    
    if (!condition || !condition.type) {
      return { success: false, error: '条件配置无效' };
    }
    
    const conditionType = this.conditionTypes[condition.type];
    if (!conditionType) {
      return { success: false, error: `未知条件类型: ${condition.type}` };
    }
    
    try {
      const actualValue = await this.getValue(conditionType, condition);
      const expectedValue = condition.value;
      const operator = condition.operator || '==';
      
      const result = this.compareValues(actualValue, operator, expectedValue);
      
      return {
        success: result,
        actualValue,
        expectedValue,
        operator,
        conditionType: condition.type
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // 获取条件值
  async getValue(conditionType, condition) {
    if (typeof conditionType.getValue === 'function') {
      return await conditionType.getValue(condition);
    }
    
    // 默认值获取逻辑
    switch (condition.type) {
      case 'vehicle_speed':
        return window.currentVehicleSpeed || 0;
      case 'obstacle_detection':
        return window.obstacleDetectionStatus || false;
      case 'distance_to_obstacle':
        return window.distanceToObstacle || 100;
      case 'tailgate_angle':
        return window.currentTailgateAngle || 0;
      case 'tailgate_state':
        return window.currentTailgateState || 'closed';
      case 'system_ready':
        return window.systemReadyStatus || true;
      case 'emergency_stop_active':
        return window.emergencyStopActive || false;
      default:
        throw new Error(`未实现的条件类型: ${condition.type}`);
    }
  }
  
  // 比较值
  compareValues(actual, operator, expected) {
    switch (operator) {
      case '<':
        return actual < expected;
      case '<=':
        return actual <= expected;
      case '==':
        return actual === expected;
      case '>=':
        return actual >= expected;
      case '>':
        return actual > expected;
      case '!=':
        return actual !== expected;
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      case 'not_in':
        return Array.isArray(expected) && !expected.includes(actual);
      case 'between':
        if (Array.isArray(expected) && expected.length === 2) {
          return actual >= expected[0] && actual <= expected[1];
        }
        return false;
      default:
        return false;
    }
  }
  
  // 等待条件满足
  async waitForCondition(condition, timeout = 30000) {
    
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const checkCondition = async () => {
        try {
          const result = await this.evaluate(condition);
          
          if (result.success) {
            resolve(result);
            return;
          }
          
          // 检查超时
          if (Date.now() - startTime > timeout) {
            reject(new Error(`等待条件超时: ${condition.type} ${condition.operator} ${condition.value}`));
            return;
          }
          
          // 继续检查
          setTimeout(checkCondition, 100);
        } catch (error) {
          reject(error);
        }
      };
      
      checkCondition();
    });
  }
  
  // 评估复合条件
  async evaluateCompositeCondition(conditions, logic = 'AND') {
    
    const results = [];
    
    for (const condition of conditions) {
      const result = await this.evaluate(condition);
      results.push(result);
      
      // 对于AND逻辑，如果有一个失败就立即返回
      if (logic === 'AND' && !result.success) {
        return {
          success: false,
          results,
          failedCondition: condition
        };
      }
      
      // 对于OR逻辑，如果有一个成功就立即返回
      if (logic === 'OR' && result.success) {
        return {
          success: true,
          results,
          successfulCondition: condition
        };
      }
    }
    
    // 根据逻辑返回最终结果
    const success = logic === 'AND' ? 
      results.every(r => r.success) : 
      results.some(r => r.success);
    
    return {
      success,
      results
    };
  }
  
  // 获取条件类型信息
  getConditionTypeInfo(type) {
    return this.conditionTypes[type];
  }
  
  // 获取所有支持的条件类型
  getSupportedConditionTypes() {
    return Object.keys(this.conditionTypes);
  }
  
  // 验证条件配置
  validateCondition(condition) {
    if (!condition || typeof condition !== 'object') {
      return { valid: false, error: '条件必须是对象' };
    }
    
    if (!condition.type) {
      return { valid: false, error: '条件必须包含type字段' };
    }
    
    const conditionType = this.conditionTypes[condition.type];
    if (!conditionType) {
      return { valid: false, error: `不支持的条件类型: ${condition.type}` };
    }
    
    if (!condition.operator) {
      return { valid: false, error: '条件必须包含operator字段' };
    }
    
    if (!conditionType.operators.includes(condition.operator)) {
      return { valid: false, error: `条件类型${condition.type}不支持操作符: ${condition.operator}` };
    }
    
    if (condition.value === undefined || condition.value === null) {
      return { valid: false, error: '条件必须包含value字段' };
    }
    
    return { valid: true };
  }
}

export default ConditionEvaluator; 