# 外部状态集成指南

## 概述

本文档详细说明了如何在尾门演示系统中集成外部状态监控功能，包括车速监控、障碍物检测、环境感知等。这些外部状态可以用于条件控制，实现更智能和安全的尾门控制场景。

## 外部状态类型

### 1. 车辆状态监控

#### 车速监控
系统通过物理引擎提供车速监控功能：

```javascript
// 从物理引擎获取车速
import { useWheelPhysicsEngine } from '../hooks/useWheelPhysicsEngine';

const { currentSpeedKmh } = useWheelPhysicsEngine();

// 车速范围：0-30 km/h
function getVehicleSpeed() {
  return currentSpeedKmh;
}
```

#### 车速条件示例
```javascript
// 安全车速条件（低于5km/h）
const safeSpeedCondition = (service) => getVehicleSpeed() < 5;

// 停车条件（车速为0）
const parkedCondition = (service) => getVehicleSpeed() === 0;

// 行驶条件（车速大于0）
const movingCondition = (service) => getVehicleSpeed() > 0;

// 高速条件（车速超过20km/h）
const highSpeedCondition = (service) => getVehicleSpeed() > 20;
```

### 2. 环境状态监控

#### 障碍物检测
```javascript
// 障碍物检测状态（示例实现）
let obstacleDetectionStatus = false;

function isObstacleDetected() {
  return obstacleDetectionStatus;
}

// 设置障碍物检测状态
function setObstacleDetected(detected) {
  obstacleDetectionStatus = detected;
}

// 障碍物检测条件
const noObstacleCondition = (service) => !isObstacleDetected();
const obstacleDetectedCondition = (service) => isObstacleDetected();
```

#### 距离传感器
```javascript
// 距离传感器数据（示例）
let distanceToObstacle = 100; // 厘米

function getDistanceToObstacle() {
  return distanceToObstacle;
}

// 安全距离条件
const safeDistanceCondition = (service) => getDistanceToObstacle() > 50;
```

### 3. 车辆系统状态

#### 发动机状态
```javascript
let engineRunning = false;

function isEngineRunning() {
  return engineRunning;
}

// 发动机运行条件
const engineRunningCondition = (service) => isEngineRunning();
```

#### 档位状态
```javascript
let gearPosition = 'P'; // P, R, N, D

function getGearPosition() {
  return gearPosition;
}

// 停车档条件
const parkGearCondition = (service) => getGearPosition() === 'P';
```

## 集成方法

### 1. 状态提供者模式

创建一个状态提供者来统一管理外部状态：

```javascript
// ExternalStateProvider.js
class ExternalStateProvider {
  constructor() {
    this.states = {
      vehicleSpeed: 0,
      obstacleDetected: false,
      distanceToObstacle: 100,
      engineRunning: false,
      gearPosition: 'P'
    };
    
    this.listeners = [];
  }

  // 更新状态
  updateState(key, value) {
    this.states[key] = value;
    this.notifyListeners(key, value);
  }

  // 获取状态
  getState(key) {
    return this.states[key];
  }

  // 获取所有状态
  getAllStates() {
    return { ...this.states };
  }

  // 添加监听器
  addListener(callback) {
    this.listeners.push(callback);
  }

  // 通知监听器
  notifyListeners(key, value) {
    this.listeners.forEach(listener => listener(key, value));
  }
}

// 创建全局实例
export const externalStateProvider = new ExternalStateProvider();
```

### 2. 条件函数工厂

创建条件函数工厂来简化条件定义：

```javascript
// ConditionFactory.js
import { externalStateProvider } from './ExternalStateProvider';

export class ConditionFactory {
  // 车速条件
  static vehicleSpeed(operator, value) {
    return (service) => {
      const speed = externalStateProvider.getState('vehicleSpeed');
      switch (operator) {
        case '<': return speed < value;
        case '<=': return speed <= value;
        case '>': return speed > value;
        case '>=': return speed >= value;
        case '==': return speed === value;
        case '!=': return speed !== value;
        default: return false;
      }
    };
  }

  // 障碍物检测条件
  static obstacleDetection(detected = false) {
    return (service) => {
      return externalStateProvider.getState('obstacleDetected') === detected;
    };
  }

  // 距离条件
  static distance(operator, value) {
    return (service) => {
      const distance = externalStateProvider.getState('distanceToObstacle');
      switch (operator) {
        case '<': return distance < value;
        case '<=': return distance <= value;
        case '>': return distance > value;
        case '>=': return distance >= value;
        default: return false;
      }
    };
  }

  // 发动机状态条件
  static engineRunning(running = true) {
    return (service) => {
      return externalStateProvider.getState('engineRunning') === running;
    };
  }

  // 档位条件
  static gearPosition(position) {
    return (service) => {
      return externalStateProvider.getState('gearPosition') === position;
    };
  }

  // 复合条件
  static and(...conditions) {
    return (service) => {
      return conditions.every(condition => condition(service));
    };
  }

  static or(...conditions) {
    return (service) => {
      return conditions.some(condition => condition(service));
    };
  }

  static not(condition) {
    return (service) => {
      return !condition(service);
    };
  }
}
```

### 3. 使用示例

#### 基础条件使用
```javascript
import { ConditionFactory } from './ConditionFactory';

// 车速低于5km/h
const slowSpeedCondition = ConditionFactory.vehicleSpeed('<', 5);

// 无障碍物
const noObstacleCondition = ConditionFactory.obstacleDetection(false);

// 距离大于50cm
const safeDistanceCondition = ConditionFactory.distance('>', 50);

// 停车档
const parkGearCondition = ConditionFactory.gearPosition('P');
```

#### 复合条件使用
```javascript
// 安全开启条件：车速低 + 无障碍物 + 停车档
const safeOpenCondition = ConditionFactory.and(
  ConditionFactory.vehicleSpeed('<', 5),
  ConditionFactory.obstacleDetection(false),
  ConditionFactory.gearPosition('P')
);

// 紧急停止条件：高速或检测到障碍物
const emergencyStopCondition = ConditionFactory.or(
  ConditionFactory.vehicleSpeed('>', 20),
  ConditionFactory.obstacleDetection(true)
);
```

## 实际应用场景

### 1. 智能停车场景

```javascript
const intelligentParkingScenario = {
  name: "智能停车场景",
  sequence: [
    // 等待车辆完全停车
    { wait: { type: "condition", value: ConditionFactory.vehicleSpeed('==', 0) } },
    
    // 等待停车档
    { wait: { type: "condition", value: ConditionFactory.gearPosition('P') } },
    
    // 渐进开启
    { action: "moveToAngle", params: { angle: 30, speed: 0.5 } },
    { wait: { type: "duration", value: 500 } },
    { action: "moveToAngle", params: { angle: 60, speed: 0.5 } },
    { wait: { type: "duration", value: 500 } },
    { action: "moveToAngle", params: { angle: 95, speed: 0.5 } },
    { wait: { type: "duration", value: 3000 } },
    
    // 监控车速，如果超过5km/h立即关闭
    { wait: { type: "condition", value: ConditionFactory.vehicleSpeed('>', 5) } },
    { action: "emergencyStop", params: {} },
    { action: "close", params: { speed: 1.5 } }
  ]
};
```

### 2. 安全演示场景

```javascript
const safetyDemoScenario = {
  name: "安全演示场景",
  sequence: [
    // 确保安全条件
    { wait: { type: "condition", value: ConditionFactory.and(
      ConditionFactory.vehicleSpeed('<', 10),
      ConditionFactory.obstacleDetection(false),
      ConditionFactory.distance('>', 30)
    ) } },
    
    // 开始演示
    { action: "open", params: { speed: 1 } },
    { wait: { type: "duration", value: 2000 } },
    
    // 模拟障碍物检测
    { wait: { type: "condition", value: ConditionFactory.obstacleDetection(true) } },
    { action: "emergencyStop", params: {} },
    { wait: { type: "duration", value: 1000 } },
    
    // 障碍物清除后继续
    { wait: { type: "condition", value: ConditionFactory.obstacleDetection(false) } },
    { action: "close", params: { speed: 0.8 } }
  ]
};
```

### 3. 动态响应场景

```javascript
const dynamicResponseScenario = {
  name: "动态响应场景",
  sequence: [
    // 根据车速调整开启速度
    { action: "moveToAngle", params: { angle: 45, speed: 0.5 } },
    { wait: { type: "duration", value: 1000 } },
    
    // 如果车速增加，加快关闭
    { wait: { type: "condition", value: ConditionFactory.vehicleSpeed('>', 15) } },
    { action: "close", params: { speed: 2.0 } },
    
    // 如果车速降低，恢复正常速度
    { wait: { type: "condition", value: ConditionFactory.vehicleSpeed('<', 5) } },
    { action: "moveToAngle", params: { angle: 95, speed: 1.0 } }
  ]
};
```

## 状态更新机制

### 1. 实时状态更新

```javascript
// 在组件中集成状态更新
import { useEffect } from 'react';
import { externalStateProvider } from './ExternalStateProvider';
import { useWheelPhysicsEngine } from '../hooks/useWheelPhysicsEngine';

function TailgateWithExternalState() {
  const { currentSpeedKmh } = useWheelPhysicsEngine();

  // 更新车速状态
  useEffect(() => {
    externalStateProvider.updateState('vehicleSpeed', currentSpeedKmh);
  }, [currentSpeedKmh]);

  // 模拟障碍物检测（实际应用中从传感器获取）
  useEffect(() => {
    const interval = setInterval(() => {
      // 模拟随机障碍物检测
      const randomObstacle = Math.random() < 0.1; // 10%概率检测到障碍物
      externalStateProvider.updateState('obstacleDetected', randomObstacle);
      
      // 模拟距离变化
      const randomDistance = 20 + Math.random() * 80; // 20-100cm
      externalStateProvider.updateState('distanceToObstacle', randomDistance);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    // 组件内容
  );
}
```

### 2. 事件驱动的状态更新

```javascript
// 监听外部事件更新状态
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'p':
    case 'P':
      externalStateProvider.updateState('gearPosition', 'P');
      break;
    case 'r':
    case 'R':
      externalStateProvider.updateState('gearPosition', 'R');
      break;
    case 'n':
    case 'N':
      externalStateProvider.updateState('gearPosition', 'N');
      break;
    case 'd':
    case 'D':
      externalStateProvider.updateState('gearPosition', 'D');
      break;
    case 'e':
    case 'E':
      externalStateProvider.updateState('engineRunning', !externalStateProvider.getState('engineRunning'));
      break;
    case 'o':
    case 'O':
      externalStateProvider.updateState('obstacleDetected', !externalStateProvider.getState('obstacleDetected'));
      break;
  }
});
```

## 测试和调试

### 1. 状态监控工具

```javascript
// 创建状态监控组件
function StateMonitor() {
  const [states, setStates] = useState({});

  useEffect(() => {
    const updateStates = () => {
      setStates(externalStateProvider.getAllStates());
    };

    externalStateProvider.addListener(updateStates);
    updateStates();

    return () => {
      // 清理监听器
    };
  }, []);

  return (
    <div className="state-monitor">
      <h3>外部状态监控</h3>
      <div>
        <p>车速: {states.vehicleSpeed?.toFixed(1)} km/h</p>
        <p>障碍物: {states.obstacleDetected ? '检测到' : '无'}</p>
        <p>距离: {states.distanceToObstacle?.toFixed(0)} cm</p>
        <p>发动机: {states.engineRunning ? '运行' : '停止'}</p>
        <p>档位: {states.gearPosition}</p>
      </div>
    </div>
  );
}
```

### 2. 条件测试工具

```javascript
// 条件测试函数
function testCondition(condition, service) {
  const result = condition(service);
  console.log('条件测试结果:', result);
  return result;
}

// 测试所有条件
function testAllConditions(service) {
  console.log('=== 条件测试 ===');
  
  testCondition(ConditionFactory.vehicleSpeed('<', 5), service);
  testCondition(ConditionFactory.obstacleDetection(false), service);
  testCondition(ConditionFactory.distance('>', 50), service);
  testCondition(ConditionFactory.gearPosition('P'), service);
  
  console.log('=== 复合条件测试 ===');
  
  const safeCondition = ConditionFactory.and(
    ConditionFactory.vehicleSpeed('<', 5),
    ConditionFactory.obstacleDetection(false)
  );
  testCondition(safeCondition, service);
}
```

## 扩展指南

### 1. 添加新的外部状态

```javascript
// 1. 在ExternalStateProvider中添加新状态
this.states.newState = defaultValue;

// 2. 在ConditionFactory中添加条件函数
static newStateCondition(value) {
  return (service) => {
    return externalStateProvider.getState('newState') === value;
  };
}

// 3. 在组件中更新状态
externalStateProvider.updateState('newState', newValue);
```

### 2. 添加新的条件类型

```javascript
// 在ConditionFactory中添加新的条件类型
static customCondition(customFunction) {
  return (service) => {
    return customFunction(service, externalStateProvider.getAllStates());
  };
}
```

---

*本文档提供了完整的外部状态集成指南，帮助开发者理解如何在实际应用中集成车速监控、障碍物检测等外部状态，并用于条件控制。通过状态提供者模式和条件函数工厂，可以轻松扩展和管理复杂的外部状态条件。* 