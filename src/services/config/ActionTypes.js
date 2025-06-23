// 动作类型配置
export const ActionTypes = {
  // 基础尾门动作
  open: {
    name: "开启尾门",
    description: "开启尾门到最大角度",
    category: "basic",
    params: {
      speed: { 
        type: "number", 
        min: 0.1, 
        max: 3, 
        default: 1,
        description: "开启速度"
      },
      angle: { 
        type: "number", 
        min: 0, 
        max: 95, 
        default: 95,
        description: "目标角度"
      }
    }
  },
  
  close: {
    name: "关闭尾门",
    description: "关闭尾门到最小角度",
    category: "basic",
    params: {
      speed: { 
        type: "number", 
        min: 0.1, 
        max: 3, 
        default: 1,
        description: "关闭速度"
      }
    }
  },
  
  moveToAngle: {
    name: "移动到指定角度",
    description: "移动尾门到指定角度",
    category: "basic",
    params: {
      angle: { 
        type: "number", 
        min: 0, 
        max: 95, 
        required: true,
        description: "目标角度"
      },
      speed: { 
        type: "number", 
        min: 0.1, 
        max: 3, 
        default: 1,
        description: "移动速度"
      }
    }
  },
  
  moveByAngle: {
    name: "相对角度移动",
    description: "相对于当前角度移动指定角度",
    category: "basic",
    params: {
      deltaAngle: { 
        type: "number", 
        min: -95, 
        max: 95, 
        required: true,
        description: "相对角度变化"
      },
      speed: { 
        type: "number", 
        min: 0.1, 
        max: 3, 
        default: 1,
        description: "移动速度"
      }
    }
  },
  
  // 控制动作
  emergencyStop: {
    name: "紧急停止",
    description: "立即停止所有尾门动作",
    category: "control",
    params: {}
  },
  
  setSpeed: {
    name: "设置速度",
    description: "设置尾门运动速度",
    category: "control",
    params: {
      speed: { 
        type: "number", 
        min: 0.1, 
        max: 3, 
        required: true,
        description: "运动速度"
      }
    }
  },
  
  pause: {
    name: "暂停",
    description: "暂停当前动作",
    category: "control",
    params: {}
  },
  
  resume: {
    name: "恢复",
    description: "恢复暂停的动作",
    category: "control",
    params: {}
  },
  
  // 等待动作
  wait: {
    name: "等待",
    description: "等待指定时间或条件满足",
    category: "control",
    params: {
      duration: { 
        type: "number", 
        min: 0, 
        max: 60000, 
        description: "等待时间(毫秒)"
      },
      condition: { 
        type: "condition", 
        description: "等待条件满足"
      }
    }
  },
  
  // 状态更新动作
  updateStatus: {
    name: "更新状态",
    description: "更新系统状态",
    category: "system",
    params: {
      state: { 
        type: "string", 
        required: true,
        description: "状态名称"
      },
      data: { 
        type: "object", 
        description: "状态数据"
      }
    }
  },
  
  // 系统动作
  log: {
    name: "日志记录",
    description: "记录日志信息",
    category: "system",
    params: {
      level: { 
        type: "string", 
        default: "info",
        allowedValues: ["debug", "info", "warn", "error"],
        description: "日志级别"
      },
      message: { 
        type: "string", 
        required: true,
        description: "日志消息"
      },
      data: { 
        type: "object", 
        description: "附加数据"
      }
    }
  },
  
  // 模拟动作（用于演示）
  simulateObstacle: {
    name: "模拟障碍物",
    description: "模拟障碍物检测",
    category: "simulation",
    params: {
      detected: { 
        type: "boolean", 
        default: true,
        description: "是否检测到障碍物"
      },
      distance: { 
        type: "number", 
        min: 0, 
        max: 1000, 
        default: 50,
        description: "障碍物距离"
      }
    }
  },
  
  simulateVehicleSpeed: {
    name: "模拟车速",
    description: "模拟车辆速度变化",
    category: "simulation",
    params: {
      speed: { 
        type: "number", 
        min: 0, 
        max: 200, 
        required: true,
        description: "车速(km/h)"
      }
    }
  },
  
  simulateFault: {
    name: "模拟故障",
    description: "模拟系统故障",
    category: "simulation",
    params: {
      type: { 
        type: "string", 
        required: true,
        allowedValues: ["hardware", "sensor", "motor", "communication"],
        description: "故障类型"
      },
      severity: { 
        type: "string", 
        default: "warning",
        allowedValues: ["info", "warning", "error", "critical"],
        description: "故障严重程度"
      }
    }
  }
};

// 动作类型分类
export const ActionCategories = {
  basic: {
    name: "基础动作",
    description: "基本的尾门控制动作",
    types: ["open", "close", "moveToAngle", "moveByAngle"]
  },
  control: {
    name: "控制动作",
    description: "尾门运动控制动作",
    types: ["emergencyStop", "setSpeed", "pause", "resume", "wait"]
  },
  system: {
    name: "系统动作",
    description: "系统状态管理动作",
    types: ["updateStatus", "log"]
  },
  simulation: {
    name: "模拟动作",
    description: "用于演示的模拟动作",
    types: ["simulateObstacle", "simulateVehicleSpeed", "simulateFault"]
  }
};

// 获取动作类型信息
export function getActionTypeInfo(type) {
  return ActionTypes[type];
}

// 获取动作类型分类
export function getActionCategories() {
  return ActionCategories;
}

// 验证动作类型
export function validateActionType(type) {
  return ActionTypes.hasOwnProperty(type);
}

// 获取动作类型的参数定义
export function getActionTypeParams(type) {
  const actionType = ActionTypes[type];
  return actionType ? actionType.params : {};
}

// 获取动作类型的默认参数
export function getActionTypeDefaultParams(type) {
  const params = getActionTypeParams(type);
  const defaultParams = {};
  
  for (const [paramName, paramConfig] of Object.entries(params)) {
    if (paramConfig.default !== undefined) {
      defaultParams[paramName] = paramConfig.default;
    }
  }
  
  return defaultParams;
}

// 验证动作参数
export function validateActionParams(type, params) {
  const actionType = ActionTypes[type];
  if (!actionType) {
    return { valid: false, error: `未知的动作类型: ${type}` };
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
      
      // 允许值检查
      if (paramConfig.allowedValues && !paramConfig.allowedValues.includes(params[paramName])) {
        return { valid: false, error: `参数${paramName}值无效，允许的值: ${paramConfig.allowedValues.join(', ')}` };
      }
    }
  }
  
  return { valid: true };
} 