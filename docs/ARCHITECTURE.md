# 尾门控制系统架构文档

## 概述

本系统采用分层架构设计，实现了尾门控制的原子服务、状态机管理、正常模式和演示模式控制逻辑。系统具备完整的安全检查、故障处理和事件驱动机制。

## 架构层次

### 1. 原子服务层 (Atomic Services)

原子服务层提供系统的基础功能，每个服务都是独立的、可复用的组件。

#### 1.1 输入请求服务 (InputRequestService)
- **功能**: 统一管理键盘、按钮输入和车速控制
- **主要方法**:
  - `handleKeyPress()` - 处理键盘按下
  - `handleButtonPress()` - 处理按钮按下
  - `setVehicleSpeed()` - 设置车速
  - `detectRequestTransition()` - 检测请求跳变
- **事件**: `input:request`, `input:requestTransition`, `input:speedChanged`

#### 1.2 故障事件服务 (FaultEventService)
- **功能**: 管理障碍物检测和硬件故障事件
- **故障类型**:
  - 障碍物检测 (OBSTACLE)
  - 硬件故障 (HARDWARE) - 电源、通信、控制器、内存
  - 传感器故障 (SENSOR) - 角度、速度、障碍物、温度传感器
  - 电机故障 (MOTOR) - 过流、过热、堵转、通信
- **主要方法**:
  - `triggerObstacleDetection()` - 触发障碍物检测
  - `triggerHardwareFault()` - 触发硬件故障
  - `triggerSensorFault()` - 触发传感器故障
  - `triggerMotorFault()` - 触发电机故障
  - `clearAllFaults()` - 清除所有故障

#### 1.3 运动控制服务 (MotionControlService)
- **功能**: 封装尾门运动控制功能
- **主要方法**:
  - `moveToPosition()` - 移动到指定位置
  - `openTailgate()` - 开启尾门
  - `closeTailgate()` - 关闭尾门
  - `emergencyStop()` - 紧急停止
  - `pauseMotion()` / `resumeMotion()` - 暂停/恢复运动
- **事件**: `motion:positionReached`, `motion:emergencyStop`, `motion:speedChanged`

#### 1.4 状态观测服务 (StateObservationService)
- **功能**: 统一管理尾门状态、车速等观测信息
- **状态组件**:
  - 尾门状态 (角度、状态、速度、目标角度)
  - 车辆状态 (车速、运动状态)
  - 环境状态 (障碍物、温度、湿度)
  - 系统状态 (状态、运行时间)
- **主要方法**:
  - `updateTailgateAngle()` - 更新尾门角度
  - `updateVehicleSpeed()` - 更新车速
  - `updateObstacleDetection()` - 更新障碍物检测
  - `checkCondition()` - 检查状态条件

#### 1.5 Dummy服务 (DummyService)
- **功能**: 演示模式下的模拟数据和场景管理
- **预设场景**:
  - 基础开启关闭演示
  - 安全功能演示
  - 故障处理演示
  - 速度控制演示
  - 精确控制演示
  - 压力测试演示
- **主要方法**:
  - `executeDemoScenario()` - 执行演示场景
  - `simulateInputRequest()` - 模拟输入请求
  - `simulateFaultEvent()` - 模拟故障事件

### 2. 控制逻辑层 (Controllers)

控制逻辑层负责协调原子服务，实现复杂的业务逻辑。

#### 2.1 状态机管理器 (StateMachineManager)
- **功能**: 管理尾门系统的状态转换
- **状态定义**:
  - `idle` - 空闲状态
  - `opening` - 开启中
  - `closing` - 关闭中
  - `open` - 已开启
  - `closed` - 已关闭
  - `paused` - 已暂停
  - `emergency_stop` - 紧急停止
- **主要方法**:
  - `transition()` - 状态转换
  - `startOpening()` / `startClosing()` - 开始开启/关闭
  - `emergencyStop()` / `resetEmergencyStop()` - 紧急停止/重置

#### 2.2 正常模式控制器 (NormalModeController)
- **功能**: 处理正常模式下的尾门控制逻辑
- **安全配置**:
  - 最大车速限制 (5 km/h)
  - 最小障碍物距离 (50 cm)
  - 最大温度限制 (80 °C)
- **主要功能**:
  - 前提条件检查
  - 安全验证
  - 故障处理
  - 请求队列管理
- **事件处理**:
  - 输入请求处理
  - 故障事件响应
  - 状态变化监控

#### 2.3 演示模式控制器 (DemoModeController)
- **功能**: 处理演示模式下的尾门控制逻辑
- **主要功能**:
  - 场景执行管理
  - 模拟故障注入
  - 条件等待处理
  - 执行历史记录
- **演示特性**:
  - 自动故障模拟
  - 场景循环执行
  - 进度跟踪
  - 暂停/恢复功能

### 3. 编排器层 (Orchestrators)

#### 3.1 增强动作编排器 (EnhancedActionOrchestrator)
- **功能**: 提供高级的动作编排功能
- **增强特性**:
  - 条件控制执行
  - 故障恢复机制
  - 安全模式执行
  - 并行执行支持
  - 循环执行增强
- **安全功能**:
  - 车速安全检查
  - 障碍物检测
  - 温度监控
  - 系统状态验证

## 数据流

### 正常模式数据流
1. **输入层**: 用户通过键盘/按钮触发输入请求
2. **输入服务**: 处理输入请求，检测跳变
3. **正常控制器**: 检查前提条件，执行安全验证
4. **状态机**: 管理状态转换
5. **运动服务**: 执行具体运动控制
6. **状态服务**: 更新系统状态
7. **故障服务**: 监控和处理故障

### 演示模式数据流
1. **Dummy服务**: 生成模拟数据和场景
2. **演示控制器**: 执行场景序列
3. **状态机**: 管理状态转换
4. **运动服务**: 执行运动控制
5. **故障服务**: 模拟故障事件
6. **状态服务**: 更新系统状态

## 事件系统

系统采用事件驱动架构，主要事件类型包括：

### 输入事件
- `input:request` - 输入请求
- `input:requestTransition` - 请求跳变
- `input:speedChanged` - 车速变化

### 故障事件
- `fault:obstacleDetected` - 障碍物检测
- `fault:hardwareFault` - 硬件故障
- `fault:sensorFault` - 传感器故障
- `fault:motorFault` - 电机故障

### 运动事件
- `motion:positionReached` - 位置到达
- `motion:emergencyStop` - 紧急停止
- `motion:speedChanged` - 速度变化

### 状态事件
- `state:updated` - 状态更新
- `tailgate:stateChanged` - 尾门状态变化
- `vehicle:speedChanged` - 车速变化

### 控制器事件
- `controller:activated` - 控制器激活
- `controller:actionExecuted` - 动作执行
- `controller:warning` - 控制器警告

### 演示事件
- `demo:scenarioStarted` - 场景开始
- `demo:stepCompleted` - 步骤完成
- `demo:scenarioCompleted` - 场景完成

## 安全机制

### 1. 前提条件检查
- 系统状态验证
- 车速安全检查
- 障碍物检测
- 温度监控

### 2. 故障处理
- 自动故障检测
- 紧急停止机制
- 故障恢复流程
- 故障历史记录

### 3. 状态机保护
- 状态转换验证
- 非法状态阻止
- 状态一致性检查

### 4. 超时保护
- 动作执行超时
- 条件等待超时
- 场景执行超时

## 扩展性

### 1. 原子服务扩展
- 新增故障类型
- 添加传感器类型
- 扩展运动控制功能

### 2. 控制器扩展
- 新增控制模式
- 添加安全策略
- 扩展业务逻辑

### 3. 编排器扩展
- 新增执行策略
- 添加条件检查器
- 扩展安全配置

## 部署架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   用户界面层     │    │   控制逻辑层     │    │   原子服务层     │
│                 │    │                 │    │                 │
│ - 按钮控制      │◄──►│ - 正常控制器     │◄──►│ - 输入服务      │
│ - 键盘控制      │    │ - 演示控制器     │    │ - 故障服务      │
│ - 场景选择      │    │ - 状态机管理     │    │ - 运动服务      │
│ - 状态显示      │    │                 │    │ - 状态服务      │
└─────────────────┘    └─────────────────┘    │ - Dummy服务     │
                                              └─────────────────┘
                                                       │
                                              ┌─────────────────┐
                                              │   编排器层       │
                                              │                 │
                                              │ - 增强编排器     │
                                              │ - 条件控制       │
                                              │ - 故障恢复       │
                                              └─────────────────┘
```

## 总结

新的架构设计实现了以下改进：

1. **原子服务分离**: 将功能按职责分离，提高可维护性和可测试性
2. **状态机管理**: 统一管理状态转换，确保状态一致性
3. **模式分离**: 正常模式和演示模式独立控制，避免相互干扰
4. **安全增强**: 多层次安全检查，确保系统安全运行
5. **事件驱动**: 松耦合的事件驱动架构，便于扩展和集成
6. **故障处理**: 完善的故障检测、处理和恢复机制
7. **演示功能**: 丰富的演示场景和模拟功能，便于展示和测试

该架构为尾门控制系统提供了坚实的基础，支持未来的功能扩展和系统集成。 