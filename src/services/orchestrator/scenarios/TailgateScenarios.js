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

  // 紧急停止测试场景
  emergencyStopTest: {
    name: "紧急停止测试",
    description: "测试紧急停止功能",
    sequence: [
      { action: "open", params: { speed: 0.8 } },
      { wait: { type: "duration", value: 1000 } },
      { action: "emergencyStop", params: {} },
      { wait: { type: "duration", value: 2000 } },
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
  }
};

// 场景分类
export const ScenarioCategories = {
  basic: {
    name: "基础场景",
    scenarios: ["basicOpenClose", "slowMotion", "quickDemo"]
  },
  advanced: {
    name: "高级场景",
    scenarios: ["preciseControl", "progressiveOpen", "angleExploration"]
  },
  complex: {
    name: "复杂场景",
    scenarios: ["complexCombination", "speedVariation"]
  },
  test: {
    name: "测试场景",
    scenarios: ["emergencyStopTest", "continuousLoop"]
  }
};

// 获取场景列表
export function getScenarioList() {
  return Object.keys(TailgateScenarios).map(key => ({
    id: key,
    ...TailgateScenarios[key]
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
        ...TailgateScenarios[scenarioId]
      }))
    };
  });
  
  return result;
}

// 获取场景配置
export function getScenarioConfig(scenarioId) {
  return TailgateScenarios[scenarioId] || null;
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
    
    if (action.action && !['open', 'close', 'moveToAngle', 'moveByAngle', 'emergencyStop'].includes(action.action)) {
      return { valid: false, error: `Unknown action: ${action.action}` };
    }
  }

  return { valid: true };
} 