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

  // 条件控制场景
  vehicleSpeedControl: vehicleSpeedControlScenario,
  smartParking: smartParkingScenario,
  safetyDemo: safetyDemoScenario,
  dynamicResponse: dynamicResponseScenario
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
    scenarios: ["emergencyStopProcessTest", "continuousLoop", "obstacleDetectionTest"]
  },
  conditional: {
    name: "条件控制场景",
    scenarios: ["vehicleSpeedControl", "smartParking", "safetyDemo"]
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

// 外部状态条件示例（需要在实际应用中实现）
// 这些函数应该从外部状态提供者获取数据
function getVehicleSpeed() {
  // 实际应用中应该从物理引擎或传感器获取
  return 0; // 默认值
}

function isObstacleDetected() {
  // 实际应用中应该从传感器获取
  return false; // 默认值
}

function getDistanceToObstacle() {
  // 实际应用中应该从距离传感器获取
  return 100; // 默认值，单位：厘米
}

// 条件控制场景示例

// 车速安全控制场景
export const vehicleSpeedControlScenario = {
  name: "车速安全控制",
  description: "根据车速进行安全控制，车速过高时自动关闭尾门",
  sequence: [
    // 等待车速安全
    { wait: { type: "condition", value: (service) => getVehicleSpeed() < 5 } },
    { action: "open", params: { speed: 1 } },
    { wait: { type: "duration", value: 2000 } },
    // 监控车速，如果超过10km/h立即关闭
    { wait: { type: "condition", value: (service) => getVehicleSpeed() > 10 } },
    { action: "emergencyStop", params: {} },
    { action: "close", params: { speed: 1.5 } }
  ]
};

// 智能停车场景
export const smartParkingScenario = {
  name: "智能停车场景",
  description: "车辆停车后自动开启尾门，检测到移动时自动关闭",
  sequence: [
    // 等待车辆完全停车
    { wait: { type: "condition", value: (service) => getVehicleSpeed() === 0 } },
    // 渐进开启
    { action: "moveToAngle", params: { angle: 30, speed: 0.5 } },
    { wait: { type: "duration", value: 500 } },
    { action: "moveToAngle", params: { angle: 60, speed: 0.5 } },
    { wait: { type: "duration", value: 500 } },
    { action: "moveToAngle", params: { angle: 95, speed: 0.5 } },
    { wait: { type: "duration", value: 3000 } },
    // 如果车速超过5km/h，立即关闭
    { wait: { type: "condition", value: (service) => getVehicleSpeed() > 5 } },
    { action: "emergencyStop", params: {} },
    { action: "close", params: { speed: 1.5 } }
  ]
};

// 安全演示场景
export const safetyDemoScenario = {
  name: "安全演示场景",
  description: "演示障碍物检测和安全控制功能",
  sequence: [
    // 确保安全条件
    { wait: { type: "condition", value: (service) => 
      getVehicleSpeed() < 10 && !isObstacleDetected() && getDistanceToObstacle() > 30 
    } },
    // 开始演示
    { action: "open", params: { speed: 1 } },
    { wait: { type: "duration", value: 2000 } },
    // 模拟障碍物检测
    { wait: { type: "condition", value: (service) => isObstacleDetected() } },
    { action: "emergencyStop", params: {} },
    { wait: { type: "duration", value: 1000 } },
    // 障碍物清除后继续
    { wait: { type: "condition", value: (service) => !isObstacleDetected() } },
    { action: "close", params: { speed: 0.8 } }
  ]
};

// 动态响应场景
export const dynamicResponseScenario = {
  name: "动态响应场景",
  description: "根据车速动态调整尾门操作",
  sequence: [
    // 根据车速调整开启速度
    { action: "moveToAngle", params: { angle: 45, speed: 0.5 } },
    { wait: { type: "duration", value: 1000 } },
    // 如果车速增加，加快关闭
    { wait: { type: "condition", value: (service) => getVehicleSpeed() > 15 } },
    { action: "close", params: { speed: 2.0 } },
    // 如果车速降低，恢复正常速度
    { wait: { type: "condition", value: (service) => getVehicleSpeed() < 5 } },
    { action: "moveToAngle", params: { angle: 95, speed: 1.0 } }
  ]
}; 