// 条件类型配置
export const ConditionTypes = {
  // 车辆状态条件
  vehicle_speed: {
    name: "车速",
    unit: "km/h",
    description: "车辆当前速度",
    operators: ["<", "<=", "==", ">=", ">", "!=", "between"],
    getValue: () => window.currentVehicleSpeed || 0,
    defaultValue: 0,
    minValue: 0,
    maxValue: 200
  },
  
  obstacle_detection: {
    name: "障碍物检测",
    unit: "boolean",
    description: "是否检测到障碍物",
    operators: ["==", "!="],
    getValue: () => window.obstacleDetectionStatus || false,
    defaultValue: false
  },
  
  distance_to_obstacle: {
    name: "障碍物距离",
    unit: "cm",
    description: "距离障碍物的距离",
    operators: ["<", "<=", "==", ">=", ">", "!=", "between"],
    getValue: () => window.distanceToObstacle || 100,
    defaultValue: 100,
    minValue: 0,
    maxValue: 1000
  },
  
  // 尾门状态条件
  tailgate_angle: {
    name: "尾门角度",
    unit: "degrees",
    description: "尾门当前角度",
    operators: ["<", "<=", "==", ">=", ">", "!=", "between"],
    getValue: () => window.currentTailgateAngle || 0,
    defaultValue: 0,
    minValue: 0,
    maxValue: 95
  },
  
  tailgate_state: {
    name: "尾门状态",
    unit: "string",
    description: "尾门当前状态",
    operators: ["==", "!=", "in", "not_in"],
    getValue: () => window.currentTailgateState || 'closed',
    defaultValue: 'closed',
    allowedValues: ['closed', 'opening', 'open', 'closing', 'paused', 'emergency_stop']
  },
  
  tailgate_animation_progress: {
    name: "尾门动画进度",
    unit: "percentage",
    description: "尾门动画执行进度 (0-100)",
    operators: ["<", "<=", "==", ">=", ">", "!=", "between"],
    getValue: () => window.currentTailgateProgress || 0,
    defaultValue: 0,
    minValue: 0,
    maxValue: 100
  },
  
  // 系统状态条件
  system_ready: {
    name: "系统就绪",
    unit: "boolean",
    description: "系统是否就绪",
    operators: ["==", "!="],
    getValue: () => window.systemReadyStatus || true,
    defaultValue: true
  },
  
  emergency_stop_active: {
    name: "紧急停止激活",
    unit: "boolean",
    description: "紧急停止是否激活",
    operators: ["==", "!="],
    getValue: () => window.emergencyStopActive || false,
    defaultValue: false
  },
  
  system_temperature: {
    name: "系统温度",
    unit: "°C",
    description: "系统当前温度",
    operators: ["<", "<=", "==", ">=", ">", "!=", "between"],
    getValue: () => window.systemTemperature || 25,
    defaultValue: 25,
    minValue: -40,
    maxValue: 100
  },
  
  // 环境条件
  ambient_temperature: {
    name: "环境温度",
    unit: "°C",
    description: "环境温度",
    operators: ["<", "<=", "==", ">=", ">", "!=", "between"],
    getValue: () => window.ambientTemperature || 20,
    defaultValue: 20,
    minValue: -40,
    maxValue: 60
  },
  
  humidity: {
    name: "湿度",
    unit: "%",
    description: "环境湿度",
    operators: ["<", "<=", "==", ">=", ">", "!=", "between"],
    getValue: () => window.humidity || 50,
    defaultValue: 50,
    minValue: 0,
    maxValue: 100
  },
  
  // 时间条件
  time_of_day: {
    name: "一天中的时间",
    unit: "hours",
    description: "当前时间（小时）",
    operators: ["<", "<=", "==", ">=", ">", "!=", "between"],
    getValue: () => new Date().getHours(),
    defaultValue: 12,
    minValue: 0,
    maxValue: 23
  },
  
  day_of_week: {
    name: "星期几",
    unit: "number",
    description: "星期几 (0=周日, 1=周一, ..., 6=周六)",
    operators: ["==", "!=", "in", "not_in"],
    getValue: () => new Date().getDay(),
    defaultValue: 1,
    allowedValues: [0, 1, 2, 3, 4, 5, 6]
  },
  
  // 自定义条件
  custom_condition: {
    name: "自定义条件",
    unit: "any",
    description: "自定义条件函数",
    operators: ["==", "!="],
    getValue: (condition) => {
      if (condition.customFunction && typeof window[condition.customFunction] === 'function') {
        return window[condition.customFunction]();
      }
      return condition.defaultValue || false;
    },
    defaultValue: false
  },
  
  // 复合条件
  composite_condition: {
    name: "复合条件",
    unit: "boolean",
    description: "多个条件的组合",
    operators: ["==", "!="],
    getValue: async (condition) => {
      if (!condition.subConditions || !Array.isArray(condition.subConditions)) {
        return false;
      }
      
      const results = await Promise.all(
        condition.subConditions.map(subCondition => 
          this.evaluateCondition(subCondition)
        )
      );
      
      const logic = condition.logic || 'AND';
      return logic === 'AND' ? 
        results.every(r => r.success) : 
        results.some(r => r.success);
    },
    defaultValue: false
  }
};

// 条件类型分类
export const ConditionCategories = {
  vehicle: {
    name: "车辆状态",
    types: ["vehicle_speed", "obstacle_detection", "distance_to_obstacle"]
  },
  tailgate: {
    name: "尾门状态", 
    types: ["tailgate_angle", "tailgate_state", "tailgate_animation_progress"]
  },
  system: {
    name: "系统状态",
    types: ["system_ready", "emergency_stop_active", "system_temperature"]
  },
  environment: {
    name: "环境条件",
    types: ["ambient_temperature", "humidity"]
  },
  time: {
    name: "时间条件",
    types: ["time_of_day", "day_of_week"]
  },
  custom: {
    name: "自定义条件",
    types: ["custom_condition", "composite_condition"]
  }
};

// 操作符说明
export const OperatorDescriptions = {
  "<": "小于",
  "<=": "小于等于", 
  "==": "等于",
  ">=": "大于等于",
  ">": "大于",
  "!=": "不等于",
  "in": "在列表中",
  "not_in": "不在列表中",
  "between": "在范围内"
};

// 获取条件类型信息
export function getConditionTypeInfo(type) {
  return ConditionTypes[type];
}

// 获取条件类型分类
export function getConditionCategories() {
  return ConditionCategories;
}

// 验证条件类型
export function validateConditionType(type) {
  return ConditionTypes.hasOwnProperty(type);
}

// 获取条件类型的操作符
export function getConditionTypeOperators(type) {
  const conditionType = ConditionTypes[type];
  return conditionType ? conditionType.operators : [];
}

// 获取条件类型的默认值
export function getConditionTypeDefaultValue(type) {
  const conditionType = ConditionTypes[type];
  return conditionType ? conditionType.defaultValue : null;
} 