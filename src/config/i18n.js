// 国际化配置文件
export const i18n = {
  zh: {
    // 标题和描述
    title: "汽车尾门动画系统",
    subtitle: "可视化您的想法",
    
    // 帮助按钮
    helpButton: "查看帮助说明",
    
    // 状态信息
    statusInfo: "状态信息",
    speed: "车速",
    speedSafety: "车速安全",
    safe: "安全",
    unsafe: "不安全",
    tailgateStatus: "尾门状态",
    open: "已开启",
    closed: "已关闭",
    currentAngle: "当前角度",
    runningStatus: "运行状态",
    running: "运行中",
    idle: "空闲",
    emergencyStop: "紧急停止激活",
    
    // 控制面板
    basicControls: "基础控制",
    tailgateOperation: "尾门操作",
    openTailgate: "开启尾门",
    closeTailgate: "关闭尾门",
    tailgateAlreadyOpen: "尾门已经处于开启状态",
    tailgateAlreadyClosed: "尾门已经处于关闭状态",
    safetyControl: "安全控制",
    stop: "停止",
    stopCurrentAction: "停止当前动作",
    statusInfo: "状态信息",
    currentAngle: "当前角度",
    tailgateStatus: "尾门状态",
    runningStatus: "运行状态",
    safetyStatus: "安全状态",
    
    // 模式切换
    normalMode: "正常模式",
    demoMode: "演示模式",
    switchToNormalMode: "切换到正常模式",
    switchToDemoMode: "切换到演示模式",
    executingOperation: "当前正在执行操作，请等待完成后再切换模式",
    executingOperationCannotSwitch: "正在执行操作，无法切换模式",
    
    // 帮助模态框
    helpTitle: "帮助说明",
    speedControl: "车速控制",
    speedControlUp: "按住上键：加速，最高30km/h",
    speedControlDown: "按住下键：减速",
    speedControlRelease: "松开按键：自然减速",
    tailgateControl: "尾门控制",
    tailgateControlOpen: "开启尾门",
    tailgateControlClose: "关闭尾门",
    systemDescription: "系统说明",
    systemDescriptionText: "这是一个基于原子服务的2D可视化动画系统，展示汽车尾门的复杂动作编排。系统使用物理引擎模拟真实的车辆运动，包括加速、减速和自然减速等效果。",
    features: "功能特性",
    realTimePhysics: "实时物理模拟",
    smoothAnimation: "平滑的动画效果",
    realTimeStatus: "状态实时显示",
    emergencyStop: "紧急停止功能",
    
    // 需求面板
    requirements: "需求规范",
    waitingForAction: "等待动作执行...",
    clickToViewDetails: "点击查看详细描述",
    
    // 配置控制
    configurableControls: "配置控制",
    executeConfig: "执行配置",
    executing: "执行中...",
    stopExecution: "停止执行",
    
    // 动作类型
    opening: "开门中",
    closing: "关门中",
    moving: "移动中",
    paused: "已暂停",
    resuming: "恢复中",
    
    // 语言切换
    language: "语言",
    chinese: "中文",
    english: "English",
    switchLanguage: "切换语言"
  },
  
  en: {
    // 标题和描述
    title: "Vehicle Tailgate Animation System",
    subtitle: "Visualize Your Idea",
    
    // 帮助按钮
    helpButton: "View Help",
    
    // 状态信息
    statusInfo: "Status Information",
    speed: "Speed",
    speedSafety: "Speed Safety",
    safe: "Safe",
    unsafe: "Unsafe",
    tailgateStatus: "Tailgate Status",
    open: "Open",
    closed: "Closed",
    currentAngle: "Current Angle",
    runningStatus: "Running Status",
    running: "Running",
    idle: "Idle",
    emergencyStop: "Emergency Stop Active",
    
    // 控制面板
    basicControls: "Basic Controls",
    tailgateOperation: "Tailgate Operation",
    openTailgate: "Open Tailgate",
    closeTailgate: "Close Tailgate",
    tailgateAlreadyOpen: "Tailgate is already open",
    tailgateAlreadyClosed: "Tailgate is already closed",
    safetyControl: "Safety Control",
    stop: "Stop",
    stopCurrentAction: "Stop current action",
    statusInfo: "Status Information",
    currentAngle: "Current Angle",
    tailgateStatus: "Tailgate Status",
    runningStatus: "Running Status",
    safetyStatus: "Safety Status",
    
    // 模式切换
    normalMode: "Normal Mode",
    demoMode: "Demo Mode",
    switchToNormalMode: "Switch to normal mode",
    switchToDemoMode: "Switch to demo mode",
    executingOperation: "Currently executing operation, please wait for completion before switching modes",
    executingOperationCannotSwitch: "Executing operation, cannot switch modes",
    
    // 帮助模态框
    helpTitle: "Help",
    speedControl: "Speed Control",
    speedControlUp: "Hold up key: Accelerate, max 30km/h",
    speedControlDown: "Hold down key: Decelerate",
    speedControlRelease: "Release key: Natural deceleration",
    tailgateControl: "Tailgate Control",
    tailgateControlOpen: "Open tailgate",
    tailgateControlClose: "Close tailgate",
    systemDescription: "System Description",
    systemDescriptionText: "This is a 2D visualization animation system based on atomic services, demonstrating complex action orchestration of vehicle tailgate. The system uses physics engine to simulate real vehicle movement, including acceleration, deceleration and natural deceleration effects.",
    features: "Features",
    realTimePhysics: "Real-time physics simulation",
    smoothAnimation: "Smooth animation effects",
    realTimeStatus: "Real-time status display",
    emergencyStop: "Emergency stop function",
    
    // 需求面板
    requirements: "Requirements",
    waitingForAction: "Waiting for action execution...",
    clickToViewDetails: "Click to view details",
    
    // 配置控制
    configurableControls: "Configurable Controls",
    executeConfig: "Execute Configuration",
    executing: "Executing...",
    stopExecution: "Stop Execution",
    
    // 动作类型
    opening: "Opening",
    closing: "Closing",
    moving: "Moving",
    paused: "Paused",
    resuming: "Resuming",
    
    // 语言切换
    language: "Language",
    chinese: "中文",
    english: "English",
    switchLanguage: "Switch Language"
  }
};

// 获取当前语言
export const getCurrentLanguage = () => {
  return localStorage.getItem('language') || 'zh';
};

// 设置语言
export const setLanguage = (language) => {
  localStorage.setItem('language', language);
};

// 获取翻译文本
export const t = (key) => {
  const currentLang = getCurrentLanguage();
  return i18n[currentLang]?.[key] || key;
}; 