# 尾门演示系统原子服务文档体系

## 概述

本文档体系描述了尾门演示系统的完整原子服务接口，旨在为大模型提供足够的信息，使其能够理解系统能力并根据自然语言需求生成正确的服务编排代码。

## 文档结构

### 核心文档

1. **[原子服务文档](TAILGATE_ATOMIC_SERVICES.md)** - 核心接口文档
   - 系统架构说明
   - 原子服务接口定义
   - 动作类型和参数说明
   - 等待条件和事件系统
   - 服务编排示例
   - 大模型使用指南

2. **[外部状态集成指南](EXTERNAL_STATE_INTEGRATION.md)** - 外部状态监控
   - 车辆状态监控（车速、档位等）
   - 环境状态监控（障碍物检测、距离传感器）
   - 状态提供者模式
   - 条件函数工厂
   - 实际应用场景

### 辅助文档

3. **[架构文档](ARCHITECTURE.md)** - 系统整体架构
4. **[场景示例](TAILGATE_SEQUENCE_EXPLANATION.md)** - 详细场景解释
5. **[数据流图](data-flow.puml)** - 系统数据流

## 大模型使用指南

### 1. 理解系统能力

大模型首先需要理解系统支持的核心能力：

#### 原子动作
- **基础动作**: `open`, `close`
- **精确控制**: `moveToAngle`, `moveByAngle`
- **安全控制**: `emergencyStop`

#### 等待条件
- **时间等待**: `duration`
- **状态等待**: `condition`
- **事件等待**: `event`

#### 外部状态
- **车速监控**: 0-30 km/h
- **障碍物检测**: boolean
- **距离传感器**: 0-100 cm

### 2. 自然语言到代码转换

#### 示例1: "当车速低于5km/h时开启尾门"
```javascript
const sequence = [
  { wait: { type: "condition", value: (service) => getVehicleSpeed() < 5 } },
  { action: "open", params: { speed: 1 } }
];
```

#### 示例2: "渐进开启尾门，每步等待1秒"
```javascript
const sequence = [
  { action: "moveToAngle", params: { angle: 25, speed: 0.7 } },
  { wait: { type: "duration", value: 1000 } },
  { action: "moveToAngle", params: { angle: 50, speed: 0.7 } },
  { wait: { type: "duration", value: 1000 } },
  { action: "moveToAngle", params: { angle: 75, speed: 0.7 } },
  { wait: { type: "duration", value: 1000 } },
  { action: "moveToAngle", params: { angle: 95, speed: 0.7 } }
];
```

#### 示例3: "如果检测到障碍物就紧急停止"
```javascript
const sequence = [
  { action: "open", params: { speed: 1 } },
  { wait: { type: "condition", value: (service) => isObstacleDetected() } },
  { action: "emergencyStop", params: {} }
];
```

### 3. 常见模式识别

大模型应该能够识别以下常见模式：

#### 安全模式
```javascript
// 确保安全条件后再操作
{ wait: { type: "condition", value: (service) => getVehicleSpeed() < 5 } }
```

#### 渐进模式
```javascript
// 分步骤渐进操作
{ action: "moveToAngle", params: { angle: step, speed: 0.5 } },
{ wait: { type: "duration", value: 1000 } }
```

#### 监控模式
```javascript
// 持续监控状态变化
{ wait: { type: "condition", value: (service) => customCondition(service) } }
```

#### 应急模式
```javascript
// 紧急情况处理
{ action: "emergencyStop", params: {} },
{ wait: { type: "duration", value: 1000 } }
```

## 系统约束和限制

### 角度限制
- 最小角度: 0度
- 最大角度: 95度
- 完全开启判定: ≥94度
- 完全关闭判定: ≤1度

### 速度限制
- 最小速度: 0.1倍
- 最大速度: 3.0倍
- 默认速度: 1.0倍

### 时间限制
- 动画超时: 30秒
- 条件等待超时: 30秒
- 事件等待超时: 30秒

### 状态约束
- 紧急停止状态下无法执行新动作
- 需要先重置紧急停止状态才能继续操作
- 同时只能执行一个动作

## 扩展性说明

### 新增动作类型
可以通过扩展 `TailgateActionService` 的 `start` 方法添加新的动作类型。

### 新增等待条件
可以通过扩展 `ActionOrchestrator` 的 `handleWait` 方法添加新的等待类型。

### 新增外部状态
可以通过扩展 `ExternalStateProvider` 和 `ConditionFactory` 添加新的外部状态监控。

## 实际应用示例

### 智能停车场景
```javascript
const intelligentParkingScenario = {
  name: "智能停车场景",
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
    // 监控车速，如果超过5km/h立即关闭
    { wait: { type: "condition", value: (service) => getVehicleSpeed() > 5 } },
    { action: "emergencyStop", params: {} },
    { action: "close", params: { speed: 1.5 } }
  ]
};
```

### 安全演示场景
```javascript
const safetyDemoScenario = {
  name: "安全演示场景",
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

## 最佳实践

### 1. 条件设计
- 使用复合条件确保安全性
- 设置合理的超时时间
- 考虑异常情况的处理

### 2. 动作编排
- 遵循渐进式操作原则
- 合理设置等待时间
- 考虑用户体验

### 3. 错误处理
- 提供清晰的错误信息
- 实现优雅的降级处理
- 记录关键操作日志

## 总结

本原子服务文档体系为大模型提供了完整的系统接口信息，包括：

1. **核心能力**: 原子动作、等待条件、事件系统
2. **外部集成**: 状态监控、条件控制、安全机制
3. **使用指南**: 自然语言转换、模式识别、最佳实践
4. **约束限制**: 系统边界、性能限制、安全约束

通过这些文档，大模型可以：
- 理解系统的完整能力边界
- 根据自然语言需求生成正确的编排代码
- 考虑安全性和用户体验
- 实现复杂的条件控制逻辑

---

*本文档体系为尾门演示系统提供了完整的原子服务接口描述，旨在帮助大模型理解系统能力并生成正确的服务编排代码。* 