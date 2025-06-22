// 尾门预设场景定义
export const TailgateScenarios = {
  // 基础场景
  basicOpenClose: {
    name: "基础开启关闭",
    description: "简单的尾门开启和关闭动作",
    sequence: [
      { action: "open", params: { speed: 1 } },
      { wait: { type: "duration", value: 3000 } },
      { action: "close", params: { speed: 1 } }
    ]
  },

  // 慢速演示场景
  slowMotion: {
    name: "慢速演示",
    description: "以慢速展示尾门开启关闭过程",
    sequence: [
      { action: "open", params: { speed: 0.5 } },
      { wait: { type: "duration", value: 4000 } },
      { action: "close", params: { speed: 0.5 } }
    ]
  },

  // 连续循环场景
  continuousLoop: {
    name: "连续循环",
    description: "尾门连续开启关闭循环",
    sequence: [
      { action: "open", params: { speed: 1 } },
      { wait: { type: "duration", value: 2000 } },
      { action: "close", params: { speed: 1 } },
      { wait: { type: "duration", value: 1000 } }
    ],
    loop: true,
    maxLoops: 5
  },

  // 精确控制场景
  preciseControl: {
    name: "精确控制演示",
    description: "展示精确角度控制功能",
    sequence: [
      { action: "moveToAngle", params: { angle: 30, speed: 0.8 } },
      { wait: { type: "duration", value: 1500 } },
      { action: "moveToAngle", params: { angle: 60, speed: 0.8 } },
      { wait: { type: "duration", value: 1500 } },
      { action: "moveToAngle", params: { angle: 95, speed: 0.8 } },
      { wait: { type: "duration", value: 2000 } },
      { action: "close", params: { speed: 1 } }
    ]
  },

  // 渐进开启场景
  progressiveOpen: {
    name: "渐进开启",
    description: "分步骤渐进开启尾门",
    sequence: [
      { action: "moveToAngle", params: { angle: 25, speed: 0.7 } },
      { wait: { type: "duration", value: 1000 } },
      { action: "moveToAngle", params: { angle: 50, speed: 0.7 } },
      { wait: { type: "duration", value: 1000 } },
      { action: "moveToAngle", params: { angle: 75, speed: 0.7 } },
      { wait: { type: "duration", value: 1000 } },
      { action: "moveToAngle", params: { angle: 95, speed: 0.7 } },
      { wait: { type: "duration", value: 2000 } },
      { action: "close", params: { speed: 1 } }
    ]
  },

  // 快速演示场景
  quickDemo: {
    name: "快速演示",
    description: "快速展示尾门功能",
    sequence: [
      { action: "open", params: { speed: 1.5 } },
      { wait: { type: "duration", value: 1000 } },
      { action: "close", params: { speed: 1.5 } }
    ]
  },

  // 角度探索场景
  angleExploration: {
    name: "角度探索",
    description: "探索不同角度位置",
    sequence: [
      { action: "moveToAngle", params: { angle: 15, speed: 0.6 } },
      { wait: { type: "duration", value: 600 } },
      { action: "moveToAngle", params: { angle: 45, speed: 0.6 } },
      { wait: { type: "duration", value: 600 } },
      { action: "moveToAngle", params: { angle: 75, speed: 0.6 } },
      { wait: { type: "duration", value: 600 } },
      { action: "moveToAngle", params: { angle: 95, speed: 0.6 } },
      { wait: { type: "duration", value: 1000 } },
      { action: "moveToAngle", params: { angle: 60, speed: 0.6 } },
      { wait: { type: "duration", value: 600 } },
      { action: "moveToAngle", params: { angle: 30, speed: 0.6 } },
      { wait: { type: "duration", value: 600 } },
      { action: "close", params: { speed: 1 } }
    ]
  },

  // 紧急停止过程状态测试场景
  emergencyStopProcessTest: {
    name: "紧急停止过程状态测试",
    description: "测试紧急停止过程中的状态显示和视觉提醒",
    sequence: [
      { action: "open", params: { speed: 1.5 } },
      { wait: { type: "duration", value: 500 } }, // 在尾门运动过程中执行紧急停止
      { action: "emergencyStop", params: {} }, // 此时应该显示"紧急停止中..."
      { wait: { type: "duration", value: 1000 } }, // 等待紧急停止过程完成
      { action: "moveToAngle", params: { angle: 45, speed: 0.8 } }, // 测试重置后是否能正常运动
      { wait: { type: "duration", value: 1000 } },
      { action: "close", params: { speed: 1 } }
    ]
  },

  // 障碍物检测测试场景
  obstacleDetectionTest: {
    name: "障碍物检测测试",
    description: "测试障碍物检测触发紧急停止功能",
    sequence: [
      { action: "open", params: { speed: 1 } },
      { wait: { type: "duration", value: 1000 } }, // 等待尾门开始运动
      { action: "emergencyStop", params: {} }, // 模拟障碍物检测触发紧急停止
      { wait: { type: "duration", value: 1500 } }, // 等待紧急停止完成
      { action: "moveToAngle", params: { angle: 30, speed: 0.8 } }, // 测试重置后是否能正常运动
      { wait: { type: "duration", value: 1000 } },
      { action: "close", params: { speed: 1 } }
    ]
  },

  // 速度变化场景
  speedVariation: {
    name: "速度变化演示",
    description: "展示不同速度下的运动效果",
    sequence: [
      { action: "open", params: { speed: 0.3 } },
      { wait: { type: "duration", value: 1000 } },
      { action: "close", params: { speed: 0.3 } },
      { wait: { type: "duration", value: 1000 } },
      { action: "open", params: { speed: 1.0 } },
      { wait: { type: "duration", value: 1000 } },
      { action: "close", params: { speed: 1.0 } },
      { wait: { type: "duration", value: 1000 } },
      { action: "open", params: { speed: 2.0 } },
      { wait: { type: "duration", value: 1000 } },
      { action: "close", params: { speed: 2.0 } }
    ]
  },

  // 复杂组合场景
  complexCombination: {
    name: "复杂组合动作",
    description: "复杂的动作组合演示",
    sequence: [
      // 第一阶段：渐进开启
      { action: "moveToAngle", params: { angle: 20, speed: 0.5 } },
      { wait: { type: "duration", value: 500 } },
      { action: "moveToAngle", params: { angle: 40, speed: 0.5 } },
      { wait: { type: "duration", value: 500 } },
      { action: "moveToAngle", params: { angle: 60, speed: 0.5 } },
      { wait: { type: "duration", value: 500 } },
      { action: "moveToAngle", params: { angle: 80, speed: 0.5 } },
      { wait: { type: "duration", value: 500 } },
      { action: "moveToAngle", params: { angle: 95, speed: 0.5 } },
      { wait: { type: "duration", value: 2000 } },
      
      // 第二阶段：快速关闭
      { action: "close", params: { speed: 1.5 } },
      { wait: { type: "duration", value: 1000 } },
      
      // 第三阶段：精确位置控制
      { action: "moveToAngle", params: { angle: 30, speed: 0.7 } },
      { wait: { type: "duration", value: 800 } },
      { action: "moveToAngle", params: { angle: 70, speed: 0.7 } },
      { wait: { type: "duration", value: 800 } },
      { action: "moveToAngle", params: { angle: 50, speed: 0.7 } },
      { wait: { type: "duration", value: 800 } },
      
      // 最终关闭
      { action: "close", params: { speed: 1 } }
    ]
  },

  // 演示场景定义 - 从DummyService迁移过来
  basicOpenClose: {
    id: 'basicOpenClose',
    name: '基础开启关闭演示',
    description: '演示基本的尾门开启和关闭功能',
    sequence: [
      { action: 'open', params: { speed: 1 } },
      { wait: { type: 'duration', value: 3000 } },
      { action: 'close', params: { speed: 1 } }
    ],
    loop: false,
    maxLoops: 1
  },
  
  safetyDemo: {
    id: 'safetyDemo',
    name: '安全功能演示',
    description: '演示障碍物检测和紧急停止功能',
    sequence: [
      { action: 'open', params: { speed: 1 } },
      { wait: { type: 'duration', value: 1000 } },
      { action: 'simulateObstacle', params: { distance: 30 } },
      { wait: { type: 'duration', value: 2000 } },
      { action: 'emergencyStop', params: {} },
      { wait: { type: 'duration', value: 1000 } },
      { action: 'close', params: { speed: 1 } }
    ],
    loop: false,
    maxLoops: 1
  },
  
  faultDemo: {
    id: 'faultDemo',
    name: '故障处理演示',
    description: '演示硬件故障和电机故障的处理',
    sequence: [
      { action: 'open', params: { speed: 1 } },
      { wait: { type: 'duration', value: 1000 } },
      { action: 'simulateHardwareFault', params: { faultType: 'COMMUNICATION' } },
      { wait: { type: 'duration', value: 2000 } },
      { action: 'emergencyStop', params: {} },
      { wait: { type: 'duration', value: 1000 } },
      { action: 'close', params: { speed: 1 } }
    ],
    loop: false,
    maxLoops: 1
  },
  
  speedDemo: {
    id: 'speedDemo',
    name: '速度控制演示',
    description: '演示不同速度下的运动效果',
    sequence: [
      { action: 'open', params: { speed: 0.5 } },
      { wait: { type: 'duration', value: 2000 } },
      { action: 'close', params: { speed: 0.5 } },
      { wait: { type: 'duration', value: 1000 } },
      { action: 'open', params: { speed: 1.5 } },
      { wait: { type: 'duration', value: 2000 } },
      { action: 'close', params: { speed: 1.5 } }
    ],
    loop: false,
    maxLoops: 1
  },
  
  precisionDemo: {
    id: 'precisionDemo',
    name: '精确控制演示',
    description: '演示精确角度控制功能',
    sequence: [
      { action: 'moveToAngle', params: { angle: 30, speed: 0.8 } },
      { wait: { type: 'duration', value: 1500 } },
      { action: 'moveToAngle', params: { angle: 60, speed: 0.8 } },
      { wait: { type: 'duration', value: 1500 } },
      { action: 'moveToAngle', params: { angle: 90, speed: 0.8 } },
      { wait: { type: 'duration', value: 1500 } },
      { action: 'close', params: { speed: 1 } }
    ],
    loop: false,
    maxLoops: 1
  },
  
  stressTest: {
    id: 'stressTest',
    name: '压力测试演示',
    description: '演示连续操作和故障恢复',
    sequence: [
      { action: 'open', params: { speed: 1 } },
      { wait: { type: 'duration', value: 500 } },
      { action: 'close', params: { speed: 1 } },
      { wait: { type: 'duration', value: 500 } },
      { action: 'open', params: { speed: 1 } },
      { wait: { type: 'duration', value: 500 } },
      { action: 'simulateObstacle', params: { distance: 20 } },
      { wait: { type: 'duration', value: 1000 } },
      { action: 'emergencyStop', params: {} },
      { wait: { type: 'duration', value: 1000 } },
      { action: 'close', params: { speed: 1 } }
    ],
    loop: false,
    maxLoops: 1
  }
};

// 场景分类
export const ScenarioCategories = {
  basic: {
    name: "基础场景",
    scenarios: ["basicOpenClose", "slowMotion", "quickDemo", "basicOpenClose"]
  },
  advanced: {
    name: "高级场景",
    scenarios: ["preciseControl", "progressiveOpen", "angleExploration", "precisionDemo"]
  },
  complex: {
    name: "复杂场景",
    scenarios: ["complexCombination", "speedVariation", "speedDemo", "stressTest"]
  },
  test: {
    name: "测试场景",
    scenarios: ["emergencyStopProcessTest", "continuousLoop", "obstacleDetectionTest", "safetyDemo", "faultDemo"]
  }
};

// 获取场景列表
export function getScenarioList() {
  const allScenarios = scenarioManager.getAllScenarios();
  return Object.keys(allScenarios).map(key => ({
    id: key,
    ...allScenarios[key]
  }));
}

// 获取分类场景
export function getScenariosByCategory() {
  const result = {};
  
  Object.keys(ScenarioCategories).forEach(categoryKey => {
    const category = ScenarioCategories[categoryKey];
    result[categoryKey] = {
      name: category.name,
      scenarios: category.scenarios.map(scenarioId => ({
        id: scenarioId,
        ...getScenarioConfig(scenarioId)
      }))
    };
  });
  
  // 添加自定义场景分类
  const customScenarios = scenarioManager.getCustomScenarios();
  if (customScenarios.length > 0) {
    result.custom = {
      name: "自定义场景",
      scenarios: customScenarios.map(scenario => ({
        id: scenario.id,
        name: scenario.name,
        description: scenario.description,
        isCustom: true
      }))
    };
  }
  
  return result;
}

// 获取场景配置
export function getScenarioConfig(scenarioId) {
  // 先检查预设场景
  if (TailgateScenarios[scenarioId]) {
    return TailgateScenarios[scenarioId];
  }
  
  // 再检查自定义场景
  return scenarioManager.customScenarios.get(scenarioId) || null;
}

// 验证场景配置
export function validateScenario(scenario) {
  if (!scenario || !scenario.sequence) {
    return { valid: false, error: "Invalid scenario structure" };
  }

  if (!Array.isArray(scenario.sequence)) {
    return { valid: false, error: "Sequence must be an array" };
  }

  for (let i = 0; i < scenario.sequence.length; i++) {
    const action = scenario.sequence[i];
    
    if (!action.action && !action.wait) {
      return { valid: false, error: `Invalid action at index ${i}` };
    }
    
    if (action.action && !['open', 'close', 'moveToAngle', 'moveByAngle', 'emergencyStop', 'simulateObstacle', 'simulateHardwareFault', 'simulateMotorFault'].includes(action.action)) {
      return { valid: false, error: `Unknown action: ${action.action}` };
    }
  }

  return { valid: true };
}

// 场景管理功能
class ScenarioManager {
  constructor() {
    this.customScenarios = new Map();
    this.eventService = null;
  }

  // 设置事件服务
  setEventService(eventService) {
    this.eventService = eventService;
  }

  // 创建自定义场景
  createCustomScenario(scenarioData) {
    const { id, name, description, sequence, loop = false, maxLoops = 1 } = scenarioData;
    
    if (!id || !name || !sequence) {
      this.emitEvent('scenario:error', {
        message: '场景数据不完整',
        scenarioData
      });
      return false;
    }
    
    if (this.customScenarios.has(id) || TailgateScenarios[id]) {
      this.emitEvent('scenario:warning', {
        message: `场景ID已存在: ${id}`,
        scenarioData
      });
      return false;
    }
    
    const validation = validateScenario(scenarioData);
    if (!validation.valid) {
      this.emitEvent('scenario:error', {
        message: `场景验证失败: ${validation.error}`,
        scenarioData
      });
      return false;
    }
    
    this.customScenarios.set(id, {
      id,
      name,
      description: description || '',
      sequence,
      loop,
      maxLoops,
      isCustom: true,
      createdAt: Date.now()
    });
    
    this.emitEvent('scenario:created', {
      scenario: this.customScenarios.get(id),
      timestamp: Date.now()
    });
    
    return true;
  }

  // 更新场景
  updateScenario(scenarioId, updates) {
    const scenario = this.customScenarios.get(scenarioId);
    if (!scenario) {
      this.emitEvent('scenario:error', {
        message: `自定义场景不存在: ${scenarioId}`,
        updates
      });
      return false;
    }
    
    const oldScenario = { ...scenario };
    const updatedScenario = {
      ...scenario,
      ...updates,
      updatedAt: Date.now()
    };
    
    // 验证更新后的场景
    const validation = validateScenario(updatedScenario);
    if (!validation.valid) {
      this.emitEvent('scenario:error', {
        message: `场景验证失败: ${validation.error}`,
        updates
      });
      return false;
    }
    
    this.customScenarios.set(scenarioId, updatedScenario);
    
    this.emitEvent('scenario:updated', {
      oldScenario,
      newScenario: updatedScenario,
      timestamp: Date.now()
    });
    
    return true;
  }

  // 删除场景
  deleteScenario(scenarioId) {
    const scenario = this.customScenarios.get(scenarioId);
    if (!scenario) {
      this.emitEvent('scenario:error', {
        message: `自定义场景不存在: ${scenarioId}`
      });
      return false;
    }
    
    this.customScenarios.delete(scenarioId);
    
    this.emitEvent('scenario:deleted', {
      scenario,
      timestamp: Date.now()
    });
    
    return true;
  }

  // 获取所有场景（包括预设和自定义）
  getAllScenarios() {
    const allScenarios = { ...TailgateScenarios };
    
    // 添加自定义场景
    this.customScenarios.forEach((scenario, id) => {
      allScenarios[id] = scenario;
    });
    
    return allScenarios;
  }

  // 获取自定义场景
  getCustomScenarios() {
    return Array.from(this.customScenarios.values());
  }

  // 导出场景配置
  exportScenarios() {
    return {
      customScenarios: Array.from(this.customScenarios.values()),
      exportTime: Date.now()
    };
  }

  // 导入场景配置
  importScenarios(config) {
    if (!config.customScenarios || !Array.isArray(config.customScenarios)) {
      this.emitEvent('scenario:error', {
        message: '无效的场景配置格式'
      });
      return false;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    config.customScenarios.forEach(scenarioData => {
      if (this.createCustomScenario(scenarioData)) {
        successCount++;
      } else {
        errorCount++;
      }
    });
    
    this.emitEvent('scenario:imported', {
      successCount,
      errorCount,
      timestamp: Date.now()
    });
    
    return { successCount, errorCount };
  }

  // 清空所有自定义场景
  clearCustomScenarios() {
    const count = this.customScenarios.size;
    this.customScenarios.clear();
    
    this.emitEvent('scenario:cleared', {
      clearedCount: count,
      timestamp: Date.now()
    });
    
    return count;
  }

  // 发出事件
  emitEvent(eventName, data) {
    if (this.eventService) {
      this.eventService.emit(eventName, data);
    }
  }
}

// 创建全局场景管理器实例
export const scenarioManager = new ScenarioManager();

// 导出场景管理器方法
export const {
  createCustomScenario,
  updateScenario,
  deleteScenario,
  getAllScenarios,
  getCustomScenarios,
  getCustomScenarioList,
  exportScenarios,
  importScenarios,
  clearCustomScenarios
} = scenarioManager; 