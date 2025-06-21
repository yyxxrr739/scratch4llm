# 尾门控制场景示例

## 概述

本文档提供了各种实际应用场景的服务编排示例，展示如何使用原子服务构建复杂的尾门控制逻辑。

## 基础场景

### 1. 简单开启关闭

**需求**: 开启尾门，等待3秒后关闭

```javascript
const simpleOpenClose = {
  name: "简单开启关闭",
  description: "基础的开启关闭动作",
  sequence: [
    { action: "open", params: { speed: 1 } },
    { wait: { type: "duration", value: 3000 } },
    { action: "close", params: { speed: 1 } }
  ]
};
```

### 2. 渐进开启

**需求**: 分步骤渐进开启尾门，每步等待1秒

```javascript
const progressiveOpen = {
  name: "渐进开启",
  description: "分步骤渐进开启尾门",
  sequence: [
    { action: "moveToAngle", params: { angle: 25, speed: 0.7 } },
    { wait: { type: "duration", value: 1000 } },
    { action: "moveToAngle", params: { angle: 50, speed: 0.7 } },
    { wait: { type: "duration", value: 1000 } },
    { action: "moveToAngle", params: { angle: 75, speed: 0.7 } },
    { wait: { type: "duration", value: 1000 } },
    { action: "moveToAngle", params: { angle: 95, speed: 0.7 } }
  ]
};
```

## 安全控制场景

### 3. 车速安全控制

**需求**: 当车速低于5km/h时开启尾门，车速超过10km/h时立即关闭

```javascript
const vehicleSpeedControl = {
  name: "车速安全控制",
  description: "基于车速的安全控制",
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
```

### 4. 障碍物检测控制

**需求**: 开启尾门过程中检测到障碍物时紧急停止

```javascript
const obstacleDetectionControl = {
  name: "障碍物检测控制",
  description: "基于障碍物检测的安全控制",
  sequence: [
    { action: "open", params: { speed: 1 } },
    { wait: { type: "duration", value: 1000 } },
    // 如果检测到障碍物，执行紧急停止
    { wait: { type: "condition", value: (service) => isObstacleDetected() } },
    { action: "emergencyStop", params: {} },
    { wait: { type: "condition", value: (service) => !isObstacleDetected() } },
    { action: "close", params: { speed: 0.8 } }
  ]
};
```

### 5. 复合安全条件

**需求**: 同时满足车速、障碍物、距离等多个安全条件才开启

```javascript
const compositeSafetyControl = {
  name: "复合安全条件",
  description: "多条件复合安全控制",
  sequence: [
    // 确保所有安全条件满足
    { wait: { type: "condition", value: (service) => 
      getVehicleSpeed() < 5 && 
      !isObstacleDetected() && 
      getDistanceToObstacle() > 50 
    } },
    { action: "open", params: { speed: 1 } },
    { wait: { type: "duration", value: 3000 } },
    { action: "close", params: { speed: 1 } }
  ]
};
```

## 智能场景

### 6. 智能停车场景

**需求**: 车辆停车后自动开启尾门，检测到移动时自动关闭

```javascript
const intelligentParking = {
  name: "智能停车场景",
  description: "车辆停车后自动开启尾门",
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
```

### 7. 动态响应场景

**需求**: 根据车速动态调整尾门操作

```javascript
const dynamicResponse = {
  name: "动态响应场景",
  description: "根据车速动态调整操作",
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
```

### 8. 自适应场景

**需求**: 根据环境条件自适应调整操作

```javascript
const adaptiveScenario = {
  name: "自适应场景",
  description: "根据环境条件自适应调整",
  sequence: [
    // 根据距离调整开启角度
    { wait: { type: "condition", value: (service) => getDistanceToObstacle() > 30 } },
    { action: "moveToAngle", params: { angle: 95, speed: 1 } },
    { wait: { type: "duration", value: 2000 } },
    // 如果距离过近，降低开启角度
    { wait: { type: "condition", value: (service) => getDistanceToObstacle() < 20 } },
    { action: "moveToAngle", params: { angle: 45, speed: 0.8 } },
    { wait: { type: "duration", value: 1000 } },
    { action: "close", params: { speed: 1 } }
  ]
};
```

## 演示场景

### 9. 安全演示场景

**需求**: 演示障碍物检测和安全控制功能

```javascript
const safetyDemo = {
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
```

### 10. 性能演示场景

**需求**: 展示不同速度下的运动效果

```javascript
const performanceDemo = {
  name: "性能演示场景",
  description: "展示不同速度下的运动效果",
  sequence: [
    // 慢速演示
    { action: "open", params: { speed: 0.3 } },
    { wait: { type: "duration", value: 1000 } },
    { action: "close", params: { speed: 0.3 } },
    { wait: { type: "duration", value: 1000 } },
    // 正常速度演示
    { action: "open", params: { speed: 1.0 } },
    { wait: { type: "duration", value: 1000 } },
    { action: "close", params: { speed: 1.0 } },
    { wait: { type: "duration", value: 1000 } },
    // 快速演示
    { action: "open", params: { speed: 2.0 } },
    { wait: { type: "duration", value: 1000 } },
    { action: "close", params: { speed: 2.0 } }
  ]
};
```

## 循环场景

### 11. 连续循环场景

**需求**: 尾门连续开启关闭循环

```javascript
const continuousLoop = {
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
};
```

### 12. 条件循环场景

**需求**: 在安全条件下循环演示

```javascript
const conditionalLoop = {
  name: "条件循环",
  description: "在安全条件下循环演示",
  sequence: [
    // 等待安全条件
    { wait: { type: "condition", value: (service) => getVehicleSpeed() < 5 } },
    { action: "open", params: { speed: 1 } },
    { wait: { type: "duration", value: 2000 } },
    { action: "close", params: { speed: 1 } },
    { wait: { type: "duration", value: 1000 } }
  ],
  loop: true,
  maxLoops: 3
};
```

## 复杂组合场景

### 13. 复杂组合动作

**需求**: 复杂的动作组合演示

```javascript
const complexCombination = {
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
};
```

## 使用说明

### 场景执行

```javascript
// 创建编排器实例
const orchestrator = new ActionOrchestrator();

// 添加场景动作
orchestrator.addActions(scenario.sequence);

// 执行场景
orchestrator.executeSequence(actionService);
```

### 条件函数实现

```javascript
// 车速获取函数（需要根据实际系统实现）
function getVehicleSpeed() {
  // 从物理引擎或传感器获取车速
  return currentSpeedKmh; // 0-30 km/h
}

// 障碍物检测函数（需要根据实际系统实现）
function isObstacleDetected() {
  // 从传感器获取障碍物检测状态
  return obstacleDetectionStatus; // boolean
}

// 距离获取函数（需要根据实际系统实现）
function getDistanceToObstacle() {
  // 从距离传感器获取距离
  return distanceToObstacle; // 0-100 cm
}
```

### 场景分类

```javascript
const scenarioCategories = {
  basic: {
    name: "基础场景",
    scenarios: ["simpleOpenClose", "progressiveOpen"]
  },
  safety: {
    name: "安全场景",
    scenarios: ["vehicleSpeedControl", "obstacleDetectionControl", "compositeSafetyControl"]
  },
  intelligent: {
    name: "智能场景",
    scenarios: ["intelligentParking", "dynamicResponse", "adaptiveScenario"]
  },
  demo: {
    name: "演示场景",
    scenarios: ["safetyDemo", "performanceDemo"]
  },
  loop: {
    name: "循环场景",
    scenarios: ["continuousLoop", "conditionalLoop"]
  },
  complex: {
    name: "复杂场景",
    scenarios: ["complexCombination"]
  }
};
```

---

*本文档提供了丰富的场景示例，展示了如何使用原子服务构建各种复杂的尾门控制逻辑。这些示例可以作为大模型理解和生成服务编排代码的参考。*