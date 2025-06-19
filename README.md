# 汽车部件动画演示系统

一个基于React和GSAP的汽车部件动画演示系统，提供逼真的2D可视化动画效果。

## 🚗 功能特性

- **逼真的2D动画**: 使用GSAP实现流畅的动画效果
- **交互式控制**: 直观的按钮控制动画播放
- **桌面端优化**: 专为桌面端设计的界面布局
- **可扩展架构**: 易于添加新的汽车部件动画
- **现代化UI**: 使用毛玻璃效果和渐变背景

## 🛠️ 技术栈

- **React 18**: 现代化的React框架
- **GSAP 3**: 高性能动画库
- **Vite**: 快速的构建工具
- **CSS3**: 现代CSS特性

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

## 🎮 使用方法

1. 打开应用后，你会看到汽车部件动画演示系统的主界面
2. 在左侧边栏选择要演示的汽车部件（目前支持电动尾门）
3. 点击"打开尾门"按钮开始动画
4. 动画过程中可以查看进度条和状态指示器
5. 动画完成后可以点击"关闭尾门"或"重置"按钮

## 🏗️ 项目结构

```
src/
├── components/
│   ├── AnimationManager.jsx      # 主管理器组件
│   ├── AnimationManager.css      # 管理器样式
│   ├── TailgateAnimation.jsx     # 尾门动画组件
│   └── TailgateAnimation.css     # 尾门动画样式
├── App.jsx                       # 主应用组件
├── main.jsx                      # 应用入口
└── index.css                     # 全局样式
static/
└── images/
    ├── body.png                  # 汽车车身图片
    └── liftgate.png              # 电动尾门图片
```

## 🔧 扩展新组件

要添加新的汽车部件动画，请按以下步骤操作：

1. **创建新的动画组件**
   ```jsx
   // src/components/HoodAnimation.jsx
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

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

**注意**: 确保在 `static/images/` 目录中放置相应的PNG图片文件，图片命名应与代码中的路径一致。 