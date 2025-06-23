# 配置驱动尾门动作系统使用示例

## 概述

配置驱动尾门动作系统允许您通过JSON配置来定义复杂的尾门控制逻辑，实现像搭积木一样构建多样化的运动逻辑。系统支持前置条件检查、步骤执行、实时监控和后置动作。

## 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   配置库管理器   │    │   配置执行引擎   │    │   事件驱动系统   │
│                 │    │                 │    │                 │
│ • 配置存储      │───▶│ • 配置验证      │───▶│ • 事件发布      │
│ • 配置分类      │    │ • 条件评估      │    │ • 事件订阅      │
│ • 配置搜索      │    │ • 步骤执行      │    │ • 实时监控      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   条件评估器     │    │   动作执行器     │    │   监控管理器     │
│                 │    │                 │    │                 │
│ • 条件类型定义  │    │ • 动作类型定义  │    │ • 实时监控      │
│ • 条件验证      │    │ • 参数验证      │    │ • 触发处理      │
│ • 值比较        │    │ • 动作执行      │    │ • 状态管理      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 配置结构

### 基本配置格式

```json
{
  "id": "配置唯一标识",
  "name": "配置名称",
  "description": "配置描述",
  "category": "配置分类",
  "version": "版本号",
  "preconditions": [
    // 前置条件列表
  ],
  "steps": [
    // 执行步骤列表
  ],
  "monitors": [
    // 监控条件列表
  ],
  "postActions": [
    // 后置动作列表
  ]
}
```

## 使用示例

### 1. 简单开门配置

```json
{
  "id": "simple_open",
  "name": "简单开门",
  "description": "基础的开门动作，无安全检查",
  "category": "basic",
  "version": "1.0",
  "steps": [
    {
      "type": "action",
      "action": "open",
      "params": { "speed": 1 }
    }
  ]
}
```

**说明：**
- 最简单的配置，只包含一个开门动作
- 无前置条件检查，无监控，无后置动作
- 适用于演示和测试场景

### 2. 安全开门配置

```json
{
  "id": "safe_open",
  "name": "安全开门",
  "description": "带安全检查的开门动作",
  "category": "safety",
  "version": "1.0",
  "preconditions": [
    {
      "id": "speed_check",
      "type": "vehicle_speed",
      "operator": "<",
      "value": 5,
      "timeout": 10000,
      "onFail": "abort"
    },
    {
      "id": "obstacle_check",
      "type": "obstacle_detection",
      "operator": "==",
      "value": false,
      "timeout": 5000,
      "onFail": "abort"
    }
  ],
  "steps": [
    {
      "type": "action",
      "action": "open",
      "params": { "speed": 1 }
    }
  ],
  "monitors": [
    {
      "id": "speed_monitor",
      "type": "vehicle_speed",
      "operator": ">",
      "value": 10,
      "onTrigger": "emergency_stop"
    }
  ]
}
```

**说明：**
- 包含前置条件：车速必须小于5km/h，无障碍物检测
- 包含实时监控：如果车速超过10km/h，触发紧急停止
- 适用于实际车辆环境

### 3. 智能停车开门配置

```json
{
  "id": "intelligent_parking_open",
  "name": "智能停车开门",
  "description": "车辆停车后自动开门",
  "category": "intelligent",
  "version": "1.0",
  "preconditions": [
    {
      "id": "vehicle_stopped",
      "type": "vehicle_speed",
      "operator": "==",
      "value": 0,
      "timeout": 30000
    }
  ],
  "steps": [
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 30, "speed": 0.5 }
    },
    {
      "type": "wait",
      "duration": 500
    },
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 60, "speed": 0.5 }
    },
    {
      "type": "wait",
      "duration": 500
    },
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 95, "speed": 0.5 }
    }
  ],
  "monitors": [
    {
      "id": "vehicle_moving",
      "type": "vehicle_speed",
      "operator": ">",
      "value": 5,
      "onTrigger": "emergency_stop"
    }
  ],
  "postActions": [
    {
      "type": "updateStatus",
      "params": { "state": "parking_open" }
    }
  ]
}
```

**说明：**
- 等待车辆完全停车（车速为0）
- 分步骤渐进开启尾门，每步之间有短暂停顿
- 实时监控车辆是否开始移动
- 完成后更新系统状态

### 4. 渐进开门配置

```json
{
  "id": "progressive_open",
  "name": "渐进开门",
  "description": "分步骤渐进开启尾门",
  "category": "advanced",
  "version": "1.0",
  "steps": [
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 25, "speed": 0.7 }
    },
    {
      "type": "wait",
      "duration": 1000
    },
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 50, "speed": 0.7 }
    },
    {
      "type": "wait",
      "duration": 1000
    },
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 75, "speed": 0.7 }
    },
    {
      "type": "wait",
      "duration": 1000
    },
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 95, "speed": 0.7 }
    }
  ]
}
```

**说明：**
- 分4个阶段开启尾门：25° → 50° → 75° → 95°
- 每个阶段之间有1秒停顿
- 提供更平滑的开门体验

### 5. 复杂组合配置

```json
{
  "id": "complex_combination",
  "name": "复杂组合动作",
  "description": "复杂的动作组合演示",
  "category": "advanced",
  "version": "1.0",
  "steps": [
    // 第一阶段：渐进开启
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 20, "speed": 0.5 }
    },
    {
      "type": "wait",
      "duration": 500
    },
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 40, "speed": 0.5 }
    },
    {
      "type": "wait",
      "duration": 500
    },
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 60, "speed": 0.5 }
    },
    {
      "type": "wait",
      "duration": 500
    },
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 80, "speed": 0.5 }
    },
    {
      "type": "wait",
      "duration": 500
    },
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 95, "speed": 0.5 }
    },
    {
      "type": "wait",
      "duration": 2000
    },
    
    // 第二阶段：快速关闭
    {
      "type": "action",
      "action": "close",
      "params": { "speed": 1.5 }
    },
    {
      "type": "wait",
      "duration": 1000
    },
    
    // 第三阶段：精确位置控制
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 30, "speed": 0.7 }
    },
    {
      "type": "wait",
      "duration": 800
    },
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 70, "speed": 0.7 }
    },
    {
      "type": "wait",
      "duration": 800
    },
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 50, "speed": 0.7 }
    },
    {
      "type": "wait",
      "duration": 800
    },
    
    // 最终关闭
    {
      "type": "action",
      "action": "close",
      "params": { "speed": 1 }
    }
  ]
}
```

**说明：**
- 包含多个阶段的复杂动作序列
- 展示渐进开启、快速关闭、精确位置控制等不同动作模式
- 适用于演示系统的完整功能

## 条件类型

### 车辆状态条件

```json
{
  "type": "vehicle_speed",
  "operator": "<",
  "value": 5
}
```

### 尾门状态条件

```json
{
  "type": "tailgate_angle",
  "operator": ">=",
  "value": 90
}
```

### 障碍物检测条件

```json
{
  "type": "obstacle_detection",
  "operator": "==",
  "value": false
}
```

### 系统状态条件

```json
{
  "type": "system_ready",
  "operator": "==",
  "value": true
}
```

## 动作类型

### 基础动作

```json
{
  "type": "action",
  "action": "open",
  "params": { "speed": 1 }
}
```

### 精确控制动作

```json
{
  "type": "action",
  "action": "moveToAngle",
  "params": { "angle": 45, "speed": 0.8 }
}
```

### 等待动作

```json
{
  "type": "wait",
  "duration": 1000
}
```

### 条件等待动作

```json
{
  "type": "wait",
  "condition": {
    "type": "tailgate_angle",
    "operator": ">=",
    "value": 90
  },
  "timeout": 30000
}
```

## 监控配置

### 紧急停止监控

```json
{
  "id": "emergency_speed_monitor",
  "type": "vehicle_speed",
  "operator": ">",
  "value": 10,
  "onTrigger": "emergency_stop"
}
```

### 暂停监控

```json
{
  "id": "obstacle_monitor",
  "type": "obstacle_detection",
  "operator": "==",
  "value": true,
  "onTrigger": "pause"
}
```

### 日志监控

```json
{
  "id": "temperature_monitor",
  "type": "system_temperature",
  "operator": ">",
  "value": 80,
  "onTrigger": "log",
  "logMessage": "系统温度过高"
}
```

## 操作符支持

| 操作符 | 说明 | 适用类型 |
|--------|------|----------|
| `<` | 小于 | 数值类型 |
| `<=` | 小于等于 | 数值类型 |
| `==` | 等于 | 所有类型 |
| `>=` | 大于等于 | 数值类型 |
| `>` | 大于 | 数值类型 |
| `!=` | 不等于 | 所有类型 |
| `in` | 在列表中 | 数组类型 |
| `not_in` | 不在列表中 | 数组类型 |
| `between` | 在范围内 | 数值类型 |

## 使用步骤

### 1. 选择控制模式

在界面右上角点击"配置驱动"按钮，切换到配置驱动控制模式。

### 2. 选择配置分类

从下拉菜单中选择配置分类：
- **基础配置**：简单的动作配置
- **安全配置**：带安全检查的配置
- **智能配置**：智能化的控制配置
- **高级配置**：复杂的动作组合
- **演示配置**：用于演示的配置

### 3. 选择具体配置

从配置列表中选择要执行的配置，系统会显示配置的详细信息。

### 4. 执行配置

点击"执行配置"按钮开始执行，系统会：
1. 检查前置条件
2. 启动监控
3. 按步骤执行动作
4. 显示执行进度和日志

### 5. 监控执行

在执行过程中，您可以：
- 查看当前执行步骤
- 监控执行进度
- 查看执行日志
- 必要时停止执行

## 自定义配置

### 创建新配置

您可以通过以下方式创建自定义配置：

1. **使用配置编辑器**（计划中）
2. **直接编辑JSON**：复制现有配置并修改
3. **导入配置**：从外部文件导入配置

### 配置验证

系统会自动验证配置的有效性：
- 检查必需字段
- 验证条件类型
- 验证动作参数
- 检查操作符兼容性

### 配置管理

- **导出配置**：将配置导出为JSON文件
- **导入配置**：从JSON文件导入配置
- **搜索配置**：通过关键词搜索配置
- **分类管理**：按功能分类管理配置

## 最佳实践

### 1. 安全性优先

```json
{
  "preconditions": [
    {
      "type": "vehicle_speed",
      "operator": "<",
      "value": 5
    },
    {
      "type": "obstacle_detection",
      "operator": "==",
      "value": false
    }
  ]
}
```

### 2. 渐进式动作

```json
{
  "steps": [
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 30, "speed": 0.5 }
    },
    {
      "type": "wait",
      "duration": 500
    },
    {
      "type": "action",
      "action": "moveToAngle",
      "params": { "angle": 60, "speed": 0.5 }
    }
  ]
}
```

### 3. 实时监控

```json
{
  "monitors": [
    {
      "type": "vehicle_speed",
      "operator": ">",
      "value": 10,
      "onTrigger": "emergency_stop"
    }
  ]
}
```

### 4. 状态管理

```json
{
  "postActions": [
    {
      "type": "updateStatus",
      "params": { "state": "completed" }
    }
  ]
}
```

## 故障排除

### 常见问题

1. **配置验证失败**
   - 检查必需字段是否完整
   - 验证条件类型是否正确
   - 确认操作符与数据类型匹配

2. **前置条件检查失败**
   - 检查条件值是否正确
   - 确认系统状态是否满足条件
   - 查看超时设置是否合理

3. **执行中断**
   - 检查监控条件是否触发
   - 查看执行日志了解中断原因
   - 确认系统状态是否异常

4. **动作执行失败**
   - 检查动作参数是否正确
   - 确认尾门服务是否正常
   - 查看错误日志获取详细信息

### 调试技巧

1. **查看执行日志**：了解每个步骤的执行情况
2. **监控系统状态**：实时查看车辆和尾门状态
3. **使用简单配置测试**：先用简单配置验证系统功能
4. **逐步增加复杂度**：逐步添加条件和监控

## 扩展开发

### 添加新的条件类型

1. 在 `ConditionTypes.js` 中定义新条件类型
2. 实现条件值获取逻辑
3. 更新条件评估器

### 添加新的动作类型

1. 在 `ActionTypes.js` 中定义新动作类型
2. 在 `ActionExecutor.js` 中实现动作执行逻辑
3. 更新动作验证器

### 自定义监控处理

1. 在 `MonitorManager.js` 中添加新的触发处理逻辑
2. 实现自定义监控动作
3. 更新监控配置格式

## 总结

配置驱动尾门动作系统提供了一个灵活、可扩展的框架来定义复杂的尾门控制逻辑。通过JSON配置，您可以像搭积木一样构建各种动作序列，实现从简单到复杂的各种控制需求。

系统的核心优势包括：
- **灵活性**：通过配置定义动作，无需修改代码
- **安全性**：内置前置条件和实时监控
- **可扩展性**：支持自定义条件类型和动作类型
- **可视化**：提供直观的配置管理和执行界面
- **事件驱动**：基于事件驱动的架构，支持实时响应

这个系统为尾门控制提供了一个强大的工具，可以满足从基础演示到复杂实际应用的各种需求。 