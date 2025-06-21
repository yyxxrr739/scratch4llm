# 尾门演示系统原子服务文档

## 概述

本文档描述了尾门演示系统所支持的原子服务接口，这些服务可以通过服务编排的方式组合构建复杂的尾门控制场景。系统采用分层架构设计，包含动作服务、状态服务和编排服务三个核心层次。大模型可以通过这些原子服务进行服务编排，根据自然语言需求生成正确的控制代码。

**重要说明**: 本文档与 `EXTERNAL_STATE_INTEGRATION.md` 配合使用，后者详细说明了如何集成外部状态监控功能（如车速监控、障碍物检测等）用于条件控制。

## 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  编排服务层      │    │  状态服务层      │    │  动作服务层      │
│ ActionOrchestrator│    │ TailgateStateService│    │ TailgateActionService│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  事件服务        │
                    │ EventService    │
                    └─────────────────┘
```

## 核心原子服务

### 1. 尾门动作服务 (TailgateActionService)

#### 服务接口
```javascript
// 主要接口方法
start(params)           // 执行动作的主入口
stop()                  // 停止当前动作
pause()                 // 暂停当前动作
resume()                // 恢复暂停的动作
emergencyStop()         // 紧急停止
resetEmergencyStop()    // 重置紧急停止状态
setSpeed(speed)         // 设置运动速度
getStatus()             // 获取当前状态
```

#### 支持的原子动作

##### 1.1 基础动作
- **open** - 开启尾门到最大角度(95度)
  ```javascript
  {
    action: "open",
    params: { speed: 1 }  // 可选，默认1.0，范围0.1-3.0
  }
  ```

- **close** - 关闭尾门到0度
  ```javascript
  {
    action: "close", 
    params: { speed: 1 }  // 可选，默认1.0，范围0.1-3.0
  }
  ```

##### 1.2 精确控制动作
- **moveToAngle** - 移动到指定角度
  ```javascript
  {
    action: "moveToAngle",
    params: { 
      angle: 45,    // 目标角度，范围0-95度
      speed: 1      // 可选，默认1.0，范围0.1-3.0
    }
  }
  ```

- **moveByAngle** - 相对当前位置移动指定角度
  ```javascript
  {
    action: "moveByAngle",
    params: {
      angle: 30,    // 相对角度，正值向上，负值向下
      speed: 1      // 可选，默认1.0，范围0.1-3.0
    }
  }
  ```

##### 1.3 控制动作
- **emergencyStop** - 紧急停止
  ```javascript
  {
    action: "emergencyStop",
    params: {}  // 无需参数
  }
  ```

#### 动作参数说明

| 参数 | 类型 | 范围 | 默认值 | 说明 |
|------|------|------|--------|------|
| speed | number | 0.1 - 3.0 | 1.0 | 运动速度倍数 |
| angle | number | 0 - 95 | - | 目标角度(度) |

#### 状态查询接口

```javascript
getStatus() // 返回完整状态对象
{
  isAnimating: boolean,        // 是否正在动画
  currentAction: string,       // 当前动作类型
  currentAngle: number,        // 当前角度
  targetAngle: number,         // 目标角度
  currentSpeed: number,        // 当前速度
  isEmergencyStopped: boolean, // 是否紧急停止
  isOpen: boolean,             // 是否完全开启
  isClosed: boolean            // 是否完全关闭
}
```

### 2. 尾门状态服务 (TailgateStateService)

#### 状态属性
```javascript
{
  angle: number,                    // 当前角度 (0-95)
  isOpen: boolean,                  // 是否完全开启 (≥94度)
  isClosed: boolean,                // 是否完全关闭 (≤1度)
  isAnimating: boolean,             // 是否正在动画
  currentAction: string,            // 当前动作类型
  animationProgress: number,        // 动画进度 (0-1)
  speed: number,                    // 当前速度
  targetAngle: number,              // 目标角度
  isEmergencyStopped: boolean,      // 是否紧急停止
  isEmergencyStopInProcess: boolean, // 是否正在紧急停止过程
  lastUpdateTime: number            // 最后更新时间
}
```

#### 状态查询方法
```javascript
getCurrentAngle()           // 获取当前角度
getIsOpen()                 // 获取是否开启
getIsClosed()               // 获取是否关闭
getIsAnimating()            // 获取是否正在动画
getCurrentAction()          // 获取当前动作
getAnimationProgress()      // 获取动画进度
getCurrentSpeed()           // 获取当前速度
getTargetAngle()            // 获取目标角度
getEmergencyStopStatus()    // 获取紧急停止状态
getTailgateState()          // 获取完整状态
getStateSummary()           // 获取状态摘要
```

### 3. 动作编排服务 (ActionOrchestrator)

#### 编排接口
```javascript
addAction(action)           // 添加单个动作
addActions(actions)         // 添加多个动作
clearQueue()               // 清空动作队列
executeSequence(service)    // 执行动作序列
stopSequence()             // 停止序列执行
pauseSequence()            // 暂停序列执行
resumeSequence()           // 恢复序列执行
getStatus()                // 获取编排器状态
getActionQueue()           // 获取动作队列
```

#### 动作序列格式
```javascript
{
  action: string,           // 动作类型
  params: object,           // 动作参数
  wait: {                   // 等待条件 (可选)
    type: "duration" | "condition" | "event",
    value: any
  }
}
```

#### 等待类型详解

##### 3.1 固定时长等待 (duration)
```javascript
{ type: "duration", value: 3000 }  // 等待3秒
```

##### 3.2 条件等待 (condition)
支持多种条件类型：

**状态条件**
```javascript
// 等待尾门开启
{ type: "condition", value: "isOpen" }

// 等待尾门关闭
{ type: "condition", value: "isClosed" }

// 等待动画完成
{ type: "condition", value: "!isAnimating" }

// 等待紧急停止重置
{ type: "condition", value: "!isEmergencyStopped" }
```

**角度条件**
```javascript
// 等待到达指定角度
{ type: "condition", value: (service) => service.getStatus().currentAngle >= 45 }

// 等待角度在指定范围内
{ type: "condition", value: (service) => {
  const angle = service.getStatus().currentAngle;
  return angle >= 30 && angle <= 60;
}}
```

**复合条件**
```javascript
// 等待车速低于5km/h且尾门关闭
{ type: "condition", value: (service) => {
  const vehicleSpeed = getVehicleSpeed(); // 外部函数
  const tailgateStatus = service.getStatus();
  return vehicleSpeed < 5 && tailgateStatus.isClosed;
}}
```

##### 3.3 事件等待 (event)
```javascript
// 等待动画完成事件
{ type: "event", value: "tailgate:animationComplete" }

// 等待紧急停止事件
{ type: "event", value: "tailgate:emergencyStop" }

// 等待编排器事件
{ type: "event", value: "orchestrator:actionCompleted" }
```

#### 高级编排功能

##### 3.4 条件执行 (executeIf)
```javascript
// 条件执行动作
await orchestrator.executeIf(
  (service) => service.getStatus().currentAngle < 45,
  { action: "moveToAngle", params: { angle: 45, speed: 0.8 } },
  service
);
```

##### 3.5 循环执行 (executeLoop)
```javascript
// 循环执行动作
await orchestrator.executeLoop(
  { action: "open", params: { speed: 1 } },
  3, // 循环3次
  service
);
```

##### 3.6 延迟执行 (executeAfter)
```javascript
// 延迟执行动作
await orchestrator.executeAfter(
  2000, // 延迟2秒
  { action: "close", params: { speed: 1 } },
  service
);
```

##### 3.7 并行执行 (executeParallel)
```javascript
// 并行执行多个动作
await orchestrator.executeParallel(service, [
  { action: "moveToAngle", params: { angle: 30, speed: 0.5 } },
  { action: "setSpeed", params: { speed: 1.5 } }
]);
```

## 外部状态监控

### 车辆状态监控

系统支持监控外部车辆状态，可用于条件控制：

#### 车速监控
```javascript
// 获取当前车速 (km/h)
function getVehicleSpeed() {
  // 从物理引擎获取车速
  return currentSpeedKmh; // 0-30 km/h
}

// 车速条件示例
const speedCondition = (service) => {
  const speed = getVehicleSpeed();
  return speed < 5; // 车速低于5km/h
};
```

#### 车辆状态条件
```javascript
// 安全车速条件
{ type: "condition", value: (service) => getVehicleSpeed() < 10 }

// 停车条件
{ type: "condition", value: (service) => getVehicleSpeed() === 0 }

// 行驶条件
{ type: "condition", value: (service) => getVehicleSpeed() > 0 }
```

### 环境状态监控

#### 障碍物检测
```javascript
// 障碍物检测状态
function isObstacleDetected() {
  return obstacleDetectionStatus; // boolean
}

// 障碍物检测条件
{ type: "condition", value: (service) => !isObstacleDetected() }
```

## 事件系统

### 核心事件类型

#### 动作事件
- `tailgate:initialized` - 服务初始化完成
- `tailgate:opening` - 开始开启
- `tailgate:closing` - 开始关闭
- `tailgate:moving` - 开始移动
- `tailgate:animationComplete` - 动画完成
- `tailgate:stopped` - 动作停止
- `tailgate:paused` - 动作暂停
- `tailgate:resumed` - 动作恢复

#### 紧急停止事件
- `tailgate:emergencyStopStarted` - 紧急停止开始
- `tailgate:emergencyStop` - 紧急停止完成
- `tailgate:emergencyStopReset` - 紧急停止重置

#### 控制事件
- `tailgate:speedChanged` - 速度改变
- `tailgate:angleChanged` - 角度改变
- `tailgate:error` - 错误事件
- `tailgate:warning` - 警告事件

#### 编排器事件
- `orchestrator:sequenceStarted` - 序列开始
- `orchestrator:actionStarted` - 动作开始
- `orchestrator:actionCompleted` - 动作完成
- `orchestrator:sequenceCompleted` - 序列完成
- `orchestrator:error` - 编排错误
- `orchestrator:loopCompleted` - 循环完成
- `orchestrator:parallelStarted` - 并行开始
- `orchestrator:parallelCompleted` - 并行完成

## 服务编排示例

### 基础场景编排

#### 1. 简单开启关闭
```javascript
const sequence = [
  { action: "open", params: { speed: 1 } },
  { wait: { type: "duration", value: 3000 } },
  { action: "close", params: { speed: 1 } }
];
```

#### 2. 渐进开启
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

### 条件控制场景

#### 3. 车速安全控制
```javascript
const sequence = [
  // 等待车速安全
  { wait: { type: "condition", value: (service) => getVehicleSpeed() < 5 } },
  { action: "open", params: { speed: 1 } },
  { wait: { type: "duration", value: 2000 } },
  { action: "close", params: { speed: 1 } }
];
```

#### 4. 障碍物检测控制
```javascript
const sequence = [
  { action: "open", params: { speed: 1 } },
  { wait: { type: "duration", value: 1000 } },
  // 如果检测到障碍物，执行紧急停止
  { action: "emergencyStop", params: {} },
  { wait: { type: "condition", value: (service) => !isObstacleDetected() } },
  { action: "close", params: { speed: 0.8 } }
];
```

#### 5. 智能停车场景
```javascript
const sequence = [
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
];
```

### 复杂组合场景

#### 6. 紧急停止测试
```javascript
const sequence = [
  { action: "open", params: { speed: 1.5 } },
  { wait: { type: "duration", value: 500 } },
  { action: "emergencyStop", params: {} },
  { wait: { type: "duration", value: 1000 } },
  { action: "moveToAngle", params: { angle: 45, speed: 0.8 } }
];
```

#### 7. 复杂组合动作
```javascript
const sequence = [
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
];
```

#### 8. 循环演示场景
```javascript
const sequence = [
  { action: "open", params: { speed: 1 } },
  { wait: { type: "duration", value: 2000 } },
  { action: "close", params: { speed: 1 } },
  { wait: { type: "duration", value: 1000 } }
];
// 设置循环属性
const scenario = {
  name: "循环演示",
  sequence: sequence,
  loop: true,
  maxLoops: 5
};
```

## 使用指南

### 1. 服务初始化
```javascript
// 创建服务实例
const actionService = new TailgateActionService();
const stateService = new TailgateStateService();
const orchestrator = new ActionOrchestrator();

// 初始化动作服务
actionService.init(tailgateElement);
```

### 2. 执行原子动作
```javascript
// 直接执行单个动作
actionService.start({ action: "open", speed: 1 });

// 或使用编排器执行序列
orchestrator.addActions(sequence);
orchestrator.executeSequence(actionService);
```

### 3. 状态监控
```javascript
// 订阅状态变化
stateService.subscribeToTailgateState((newState, oldState) => {
  console.log('状态变化:', newState);
});

// 获取当前状态
const status = actionService.getStatus();
```

### 4. 事件监听
```javascript
// 监听动作完成事件
actionService.on('tailgate:animationComplete', (data) => {
  console.log('动画完成:', data);
});

// 监听编排器事件
orchestrator.on('orchestrator:actionCompleted', (data) => {
  console.log('动作完成:', data);
});
```

### 5. 条件控制实现
```javascript
// 自定义条件函数
const customCondition = (service) => {
  const status = service.getStatus();
  const vehicleSpeed = getVehicleSpeed();
  
  // 复合条件：车速安全且尾门未开启
  return vehicleSpeed < 10 && !status.isOpen;
};

// 在序列中使用
const sequence = [
  { wait: { type: "condition", value: customCondition } },
  { action: "open", params: { speed: 1 } }
];
```

## 约束和限制

### 角度限制
- 最小角度: 0度
- 最大角度: 95度
- 完全开启判定: ≥94度
- 完全关闭判定: ≤1度

### 速度限制
- 最小速度: 0.1倍
- 最大速度: 3.0倍
- 默认速度: 1.0倍

### 动画限制
- 动画超时: 30秒
- 紧急停止响应时间: 300ms
- 软停止响应时间: 500ms

### 状态约束
- 紧急停止状态下无法执行新动作
- 需要先重置紧急停止状态才能继续操作
- 同时只能执行一个动作

### 条件等待限制
- 条件检查间隔: 50ms
- 条件等待超时: 30秒
- 事件等待超时: 30秒

## 错误处理

### 常见错误类型
- 无效的动作类型
- 参数超出范围
- 服务未初始化
- 动画超时
- 状态冲突
- 条件等待超时
- 事件等待超时

### 错误处理策略
- 自动参数范围检查
- 状态一致性验证
- 超时保护机制
- 错误事件通知
- 优雅降级处理

## 扩展性

### 新增动作类型
可以通过扩展 `TailgateActionService` 的 `start` 方法添加新的动作类型。

### 新增等待条件
可以通过扩展 `ActionOrchestrator` 的 `handleWait` 方法添加新的等待类型。

### 新增事件类型
可以通过 `EventService` 发送和监听自定义事件。

### 新增状态属性
可以通过扩展 `TailgateStateService` 添加新的状态属性。

### 新增外部状态监控
可以通过扩展条件函数添加新的外部状态监控逻辑。

## 大模型使用指南

### 自然语言到编排代码转换

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

### 常见模式

#### 安全模式
```javascript
// 确保车速安全后再操作
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

---

*本文档描述了尾门演示系统的完整原子服务接口，大模型可以通过这些接口进行服务编排，构建复杂的尾门控制场景。通过理解动作类型、等待条件、状态监控和事件系统，大模型可以根据自然语言需求生成正确的服务编排代码。*

## 相关文档

- **[外部状态集成指南](EXTERNAL_STATE_INTEGRATION.md)** - 详细说明如何集成车速监控、障碍物检测等外部状态用于条件控制
- **[架构文档](ARCHITECTURE.md)** - 系统整体架构设计说明
- **[场景示例](TAILGATE_SEQUENCE_EXPLANATION.md)** - 详细的服务编排场景示例和解释