# 汽车部件动画演示系统

一个基于React和GSAP的汽车部件动画演示系统，提供逼真的2D可视化动画效果。系统采用原子服务架构，支持复杂的服务编排和条件控制。

## 🚗 功能特性

- **逼真的2D动画**: 使用GSAP实现流畅的动画效果
- **交互式控制**: 直观的按钮控制动画播放
- **原子服务架构**: 支持复杂的服务编排和条件控制
- **外部状态监控**: 集成车速监控、障碍物检测等外部状态
- **智能场景编排**: 支持基于条件的智能控制场景
- **桌面端优化**: 专为桌面端设计的界面布局
- **可扩展架构**: 易于添加新的汽车部件动画
- **现代化UI**: 使用毛玻璃效果和渐变背景

## 🏗️ 系统架构

系统采用分层架构设计，包含以下核心层次：

- **动作服务层**: 提供原子动作接口（开启、关闭、精确控制等）
- **状态服务层**: 管理尾门状态和外部状态监控
- **编排服务层**: 支持复杂的动作序列编排和条件控制
- **事件系统**: 提供完整的事件通知机制

### 原子服务能力

系统支持以下核心能力：

#### 原子动作
- **基础动作**: 开启、关闭、精确角度控制
- **安全控制**: 紧急停止、状态重置
- **速度控制**: 可调节的运动速度（0.1-3.0倍）

#### 等待条件
- **时间等待**: 固定时长等待
- **状态等待**: 基于系统状态的等待
- **事件等待**: 基于事件的等待
- **外部条件**: 基于车速、障碍物检测等外部状态

#### 外部状态监控
- **车速监控**: 0-30 km/h实时监控
- **障碍物检测**: 实时障碍物检测状态
- **距离传感器**: 0-100 cm距离监控
- **车辆状态**: 发动机状态、档位状态等

## 📚 文档体系

### 核心文档

- **[原子服务文档](docs/TAILGATE_ATOMIC_SERVICES.md)** - 完整的原子服务接口文档
- **[外部状态集成指南](docs/EXTERNAL_STATE_INTEGRATION.md)** - 外部状态监控和条件控制
- **[原子服务文档体系总览](docs/README-ATOMIC_SERVICES.md)** - 文档体系总览和使用指南

### 辅助文档

- **[架构文档](docs/ARCHITECTURE.md)** - 系统整体架构设计
- **[场景示例](docs/TAILGATE_SEQUENCE_EXPLANATION.md)** - 详细的服务编排场景示例

## 🎮 使用方法

### 基础使用

1. 打开应用后，你会看到汽车部件动画演示系统的主界面
2. 在左侧边栏选择要演示的汽车部件（目前支持电动尾门）
3. 点击"打开尾门"按钮开始动画
4. 动画过程中可以查看进度条和状态指示器
5. 动画完成后可以点击"关闭尾门"或"重置"按钮

### 高级功能

#### 场景编排
系统支持预设场景和自定义场景编排：

1. 在"场景控制"标签页中选择预设场景
2. 点击"执行场景"开始自动演示
3. 场景执行过程中可以暂停、恢复或停止

#### 外部状态控制
系统支持基于外部状态的智能控制：

- **车速控制**: 当车速低于5km/h时允许开启尾门
- **障碍物检测**: 检测到障碍物时自动紧急停止
- **安全距离**: 基于距离传感器的安全控制

#### 条件控制示例

```javascript
// 智能停车场景：车辆停车后自动开启尾门
const sequence = [
  { wait: { type: "condition", value: (service) => getVehicleSpeed() === 0 } },
  { action: "open", params: { speed: 1 } },
  { wait: { type: "duration", value: 3000 } },
  { action: "close", params: { speed: 1 } }
];
```

## 🛠️ 技术栈

- **React 18**: 现代化的React框架
- **GSAP 3**: 高性能动画库
- **Vite**: 快速的构建工具
- **CSS3**: 现代CSS特性
- **原子服务架构**: 服务编排和条件控制

## 📦 安装和运行

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **构建生产版本**
   ```bash
   npm run build
   ```

4. **预览生产版本**
   ```bash
   npm run preview
   ```

## 🏗️ 项目结构

```
src/
├── components/
│   ├── AnimationManager.jsx      # 主管理器组件
│   ├── AnimationManager.css      # 管理器样式
│   ├── animations/
│   │   ├── TailgateAnimation.jsx # 尾门动画组件
│   │   └── TailgateAnimation.css # 尾门动画样式
│   └── ActionControls/           # 动作控制组件
├── services/
│   ├── core/                     # 核心服务
│   ├── tailgate/                 # 尾门服务
│   └── orchestrator/             # 编排服务
├── hooks/                        # 自定义Hooks
├── utils/                        # 工具函数
├── App.jsx                       # 主应用组件
├── main.jsx                      # 应用入口
└── index.css                     # 全局样式
docs/
├── TAILGATE_ATOMIC_SERVICES.md   # 原子服务文档
├── EXTERNAL_STATE_INTEGRATION.md # 外部状态集成指南
├── README-ATOMIC_SERVICES.md     # 文档体系总览
└── ARCHITECTURE.md               # 架构文档
static/
└── images/
    ├── body.png                  # 汽车车身图片
    └── liftgate.png              # 电动尾门图片
```

## 🔧 扩展新组件

要添加新的汽车部件动画，请按以下步骤操作：

1. **创建新的动画组件**
   ```jsx
   // src/components/animations/HoodAnimation.jsx
   import { useRef, useEffect, useState } from "react";
   import { gsap } from "gsap";
   import "./HoodAnimation.css";

   const HoodAnimation = () => {
     // 实现引擎盖动画逻辑
     return (
       <div className="hood-animation">
         {/* 动画内容 */}
       </div>
     );
   };

   export default HoodAnimation;
   ```

2. **在AnimationManager中注册**
   ```jsx
   const components = [
     {
       id: "tailgate",
       name: "电动尾门",
       description: "展示电动尾门的开启和关闭动画",
       icon: "🚗",
       component: TailgateAnimation
     },
     {
       id: "hood",
       name: "引擎盖",
       description: "展示引擎盖的开启和关闭动画",
       icon: "🔧",
       component: HoodAnimation
     }
   ];
   ```

3. **添加对应的CSS样式文件**

## 🎨 自定义样式

系统使用CSS变量和模块化样式，你可以轻松自定义：

- 修改 `src/index.css` 中的全局变量
- 编辑各组件对应的CSS文件
- 调整动画参数和效果

## 🖥️ 桌面端优化

系统专为桌面端设计：

- **固定布局**: 侧边栏和动画区域的固定布局
- **大屏幕适配**: 优化的字体大小和间距
- **鼠标交互**: 优化的悬停和点击效果

## 🚀 性能优化

- 使用GSAP的高性能动画引擎
- 图片懒加载和优化
- CSS3硬件加速
- 组件级别的状态管理
- 原子服务架构的模块化设计

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

**注意**: 确保在 `static/images/` 目录中放置相应的PNG图片文件，图片命名应与代码中的路径一致。 