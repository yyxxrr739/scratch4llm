import { validateActionParams } from './ActionTypes.js';

class ActionConfigLibrary {
  constructor() {
    this.configs = new Map();
    this.categories = new Map();
    this.loadDefaultConfigs();
  }
  
  // 加载默认配置
  loadDefaultConfigs() {
    // 基础配置
    this.addConfig(this.createSimpleOpenConfig());
    this.addConfig(this.createSafeOpenConfig());
    this.addConfig(this.createIntelligentParkingOpenConfig());
    this.addConfig(this.createProgressiveOpenConfig());
    this.addConfig(this.createEmergencyStopConfig());
    this.addConfig(this.createSpeedVariationConfig());
    this.addConfig(this.createObstacleDetectionConfig());
    this.addConfig(this.createComplexCombinationConfig());
    
    // 设置分类
    this.setupCategories();
  }
  
  // 创建简单开门配置
  createSimpleOpenConfig() {
    return {
      id: "simple_open",
      name: "简单开门",
      description: "基础的开门动作，无安全检查",
      category: "basic",
      version: "1.0",
      steps: [
        {
          type: "action",
          action: "open",
          params: { speed: 1 }
        }
      ]
    };
  }
  
  // 创建安全开门配置
  createSafeOpenConfig() {
    return {
      id: "safe_open",
      name: "安全开门",
      description: "带安全检查的开门动作",
      category: "safety",
      version: "1.0",
      preconditions: [
        {
          id: "speed_check",
          type: "vehicle_speed",
          operator: "<",
          value: 5,
          timeout: 10000,
          onFail: "abort"
        },
        {
          id: "obstacle_check",
          type: "obstacle_detection",
          operator: "==",
          value: false,
          timeout: 5000,
          onFail: "abort"
        }
      ],
      steps: [
        {
          type: "action",
          action: "open",
          params: { speed: 1 }
        }
      ],
      monitors: [
        {
          id: "speed_monitor",
          type: "vehicle_speed",
          operator: ">",
          value: 10,
          onTrigger: "emergency_stop"
        }
      ]
    };
  }
  
  // 创建智能停车开门配置
  createIntelligentParkingOpenConfig() {
    return {
      id: "intelligent_parking_open",
      name: "智能停车开门",
      description: "车辆停车后自动开门",
      category: "intelligent",
      version: "1.0",
      preconditions: [
        {
          id: "vehicle_stopped",
          type: "vehicle_speed",
          operator: "==",
          value: 0,
          timeout: 30000
        }
      ],
      steps: [
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 30, speed: 0.5 }
        },
        {
          type: "wait",
          duration: 500
        },
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 60, speed: 0.5 }
        },
        {
          type: "wait",
          duration: 500
        },
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 95, speed: 0.5 }
        }
      ],
      monitors: [
        {
          id: "vehicle_moving",
          type: "vehicle_speed",
          operator: ">",
          value: 5,
          onTrigger: "emergency_stop"
        }
      ],
      postActions: [
        {
          type: "updateStatus",
          params: { state: "parking_open" }
        }
      ]
    };
  }
  
  // 创建渐进开门配置
  createProgressiveOpenConfig() {
    return {
      id: "progressive_open",
      name: "渐进开门",
      description: "分步骤渐进开启尾门",
      category: "advanced",
      version: "1.0",
      steps: [
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 25, speed: 0.7 }
        },
        {
          type: "wait",
          duration: 1000
        },
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 50, speed: 0.7 }
        },
        {
          type: "wait",
          duration: 1000
        },
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 75, speed: 0.7 }
        },
        {
          type: "wait",
          duration: 1000
        },
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 95, speed: 0.7 }
        }
      ]
    };
  }
  
  // 创建紧急停止配置
  createEmergencyStopConfig() {
    return {
      id: "emergency_stop",
      name: "紧急停止",
      description: "紧急停止所有动作",
      category: "safety",
      version: "1.0",
      steps: [
        {
          type: "action",
          action: "emergencyStop",
          params: {}
        }
      ]
    };
  }
  
  // 创建速度变化配置
  createSpeedVariationConfig() {
    return {
      id: "speed_variation",
      name: "速度变化演示",
      description: "展示不同速度下的运动效果",
      category: "demo",
      version: "1.0",
      steps: [
        {
          type: "action",
          action: "open",
          params: { speed: 0.3 }
        },
        {
          type: "wait",
          duration: 1000
        },
        {
          type: "action",
          action: "close",
          params: { speed: 0.3 }
        },
        {
          type: "wait",
          duration: 1000
        },
        {
          type: "action",
          action: "open",
          params: { speed: 1.0 }
        },
        {
          type: "wait",
          duration: 1000
        },
        {
          type: "action",
          action: "close",
          params: { speed: 1.0 }
        },
        {
          type: "wait",
          duration: 1000
        },
        {
          type: "action",
          action: "open",
          params: { speed: 2.0 }
        },
        {
          type: "wait",
          duration: 1000
        },
        {
          type: "action",
          action: "close",
          params: { speed: 2.0 }
        }
      ]
    };
  }
  
  // 创建障碍物检测配置
  createObstacleDetectionConfig() {
    return {
      id: "obstacle_detection",
      name: "障碍物检测演示",
      description: "演示障碍物检测和安全控制",
      category: "demo",
      version: "1.0",
      steps: [
        {
          type: "action",
          action: "open",
          params: { speed: 1 }
        },
        {
          type: "wait",
          duration: 2000
        },
        {
          type: "action",
          action: "simulateObstacle",
          params: { detected: true, distance: 20 }
        },
        {
          type: "wait",
          duration: 1000
        },
        {
          type: "action",
          action: "emergencyStop",
          params: {}
        },
        {
          type: "wait",
          duration: 2000
        },
        {
          type: "action",
          action: "simulateObstacle",
          params: { detected: false, distance: 100 }
        },
        {
          type: "wait",
          duration: 1000
        },
        {
          type: "action",
          action: "close",
          params: { speed: 0.8 }
        }
      ]
    };
  }
  
  // 创建复杂组合配置
  createComplexCombinationConfig() {
    return {
      id: "complex_combination",
      name: "复杂组合动作",
      description: "复杂的动作组合演示",
      category: "advanced",
      version: "1.0",
      steps: [
        // 第一阶段：渐进开启
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 20, speed: 0.5 }
        },
        {
          type: "wait",
          duration: 500
        },
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 40, speed: 0.5 }
        },
        {
          type: "wait",
          duration: 500
        },
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 60, speed: 0.5 }
        },
        {
          type: "wait",
          duration: 500
        },
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 80, speed: 0.5 }
        },
        {
          type: "wait",
          duration: 500
        },
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 95, speed: 0.5 }
        },
        {
          type: "wait",
          duration: 2000
        },
        
        // 第二阶段：快速关闭
        {
          type: "action",
          action: "close",
          params: { speed: 1.5 }
        },
        {
          type: "wait",
          duration: 1000
        },
        
        // 第三阶段：精确位置控制
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 30, speed: 0.7 }
        },
        {
          type: "wait",
          duration: 800
        },
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 70, speed: 0.7 }
        },
        {
          type: "wait",
          duration: 800
        },
        {
          type: "action",
          action: "moveToAngle",
          params: { angle: 50, speed: 0.7 }
        },
        {
          type: "wait",
          duration: 800
        },
        
        // 最终关闭
        {
          type: "action",
          action: "close",
          params: { speed: 1 }
        }
      ]
    };
  }
  
  // 设置分类
  setupCategories() {
    this.categories.set("basic", {
      name: "基础配置",
      description: "基础的尾门控制配置",
      configs: ["simple_open", "progressive_open"]
    });
    
    this.categories.set("safety", {
      name: "安全配置",
      description: "带安全检查的配置",
      configs: ["safe_open", "emergency_stop"]
    });
    
    this.categories.set("intelligent", {
      name: "智能配置",
      description: "智能化的尾门控制配置",
      configs: ["intelligent_parking_open"]
    });
    
    this.categories.set("advanced", {
      name: "高级配置",
      description: "复杂的动作组合配置",
      configs: ["complex_combination"]
    });
    
    this.categories.set("demo", {
      name: "演示配置",
      description: "用于演示的配置",
      configs: ["speed_variation", "obstacle_detection"]
    });
  }
  
  // 添加配置
  addConfig(config) {
    const validation = this.validateConfig(config);
    if (!validation.valid) {
      throw new Error(`配置验证失败: ${validation.error}`);
    }
    
    this.configs.set(config.id, config);
    console.log(`ActionConfigLibrary: 添加配置 ${config.id}`);
  }
  
  // 获取配置
  getConfig(id) {
    return this.configs.get(id);
  }
  
  // 获取所有配置
  getAllConfigs() {
    return Array.from(this.configs.values());
  }
  
  // 获取分类配置
  getConfigsByCategory(category) {
    const categoryInfo = this.categories.get(category);
    if (!categoryInfo) {
      return [];
    }
    
    return categoryInfo.configs
      .map(configId => this.getConfig(configId))
      .filter(config => config !== undefined);
  }
  
  // 获取所有分类
  getCategories() {
    return Array.from(this.categories.values());
  }
  
  // 验证配置
  validateConfig(config) {
    if (!config || typeof config !== 'object') {
      return { valid: false, error: '配置必须是对象' };
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
    
    // 验证前置条件
    if (config.preconditions) {
      for (let i = 0; i < config.preconditions.length; i++) {
        const precondition = config.preconditions[i];
        if (!precondition.id || !precondition.type || !precondition.operator) {
          return { valid: false, error: `前置条件${i + 1}: 缺少必需字段` };
        }
      }
    }
    
    // 验证监控
    if (config.monitors) {
      for (let i = 0; i < config.monitors.length; i++) {
        const monitor = config.monitors[i];
        if (!monitor.id || !monitor.type || !monitor.operator || !monitor.onTrigger) {
          return { valid: false, error: `监控${i + 1}: 缺少必需字段` };
        }
      }
    }
    
    return { valid: true };
  }
  
  // 验证步骤
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
        // 验证动作参数
        if (step.params) {
          const paramValidation = validateActionParams(step.action, step.params);
          if (!paramValidation.valid) {
            return { valid: false, error: `动作参数错误: ${paramValidation.error}` };
          }
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
  
  // 导出配置
  exportConfig(id) {
    const config = this.getConfig(id);
    if (!config) {
      throw new Error(`配置不存在: ${id}`);
    }
    
    return JSON.stringify(config, null, 2);
  }
  
  // 导入配置
  importConfig(configJson) {
    try {
      const config = JSON.parse(configJson);
      const validation = this.validateConfig(config);
      if (validation.valid) {
        this.addConfig(config);
        return { success: true, config };
      } else {
        return { success: false, error: validation.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // 删除配置
  removeConfig(id) {
    if (this.configs.has(id)) {
      this.configs.delete(id);
      console.log(`ActionConfigLibrary: 删除配置 ${id}`);
      return true;
    }
    return false;
  }
  
  // 更新配置
  updateConfig(id, updates) {
    const config = this.getConfig(id);
    if (!config) {
      throw new Error(`配置不存在: ${id}`);
    }
    
    const updatedConfig = { ...config, ...updates };
    const validation = this.validateConfig(updatedConfig);
    if (!validation.valid) {
      throw new Error(`配置验证失败: ${validation.error}`);
    }
    
    this.configs.set(id, updatedConfig);
    console.log(`ActionConfigLibrary: 更新配置 ${id}`);
    return updatedConfig;
  }
  
  // 搜索配置
  searchConfigs(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    for (const config of this.configs.values()) {
      if (config.name.toLowerCase().includes(lowerQuery) ||
          config.description.toLowerCase().includes(lowerQuery) ||
          config.id.toLowerCase().includes(lowerQuery)) {
        results.push(config);
      }
    }
    
    return results;
  }
  
  // 获取配置统计信息
  getStats() {
    return {
      totalConfigs: this.configs.size,
      categories: this.categories.size,
      configsByCategory: Object.fromEntries(
        Array.from(this.categories.entries()).map(([key, category]) => [
          key,
          category.configs.length
        ])
      )
    };
  }
}

export default ActionConfigLibrary; 