import ConditionEvaluator from './ConditionEvaluator.js';

class MonitorManager {
  constructor() {
    this.activeMonitors = new Map();
    this.conditionEvaluator = new ConditionEvaluator();
    this.eventService = null;
    this.monitorInterval = 100; // 监控检查间隔(ms)
  }
  
  // 设置事件服务
  setEventService(eventService) {
    this.eventService = eventService;
  }
  
  // 启动监控
  startMonitors(monitors, eventService) {
    console.log('MonitorManager: 启动监控', monitors);
    
    this.eventService = eventService;
    
    // 停止现有监控
    this.stopMonitors();
    
    // 启动新监控
    monitors.forEach(monitor => {
      this.startMonitor(monitor);
    });
  }
  
  // 启动单个监控
  startMonitor(monitor) {
    if (!monitor.id) {
      console.warn('MonitorManager: 监控缺少ID，跳过', monitor);
      return;
    }
    
    console.log('MonitorManager: 启动监控', monitor.id, monitor);
    
    const intervalId = setInterval(async () => {
      try {
        const result = await this.evaluateMonitor(monitor);
        if (result.triggered) {
          this.handleMonitorTrigger(monitor, result);
        }
      } catch (error) {
        console.error('MonitorManager: 监控评估错误', monitor.id, error);
        this.eventService?.emit('monitor:error', { 
          monitor, 
          error: error.message 
        });
      }
    }, this.monitorInterval);
    
    this.activeMonitors.set(monitor.id, {
      monitor,
      intervalId,
      startTime: Date.now()
    });
    
    this.eventService?.emit('monitor:started', { monitor });
  }
  
  // 停止监控
  stopMonitors() {
    console.log('MonitorManager: 停止所有监控');
    
    this.activeMonitors.forEach((monitorInfo, monitorId) => {
      clearInterval(monitorInfo.intervalId);
      this.eventService?.emit('monitor:stopped', { 
        monitor: monitorInfo.monitor 
      });
    });
    
    this.activeMonitors.clear();
  }
  
  // 停止单个监控
  stopMonitor(monitorId) {
    const monitorInfo = this.activeMonitors.get(monitorId);
    if (monitorInfo) {
      clearInterval(monitorInfo.intervalId);
      this.activeMonitors.delete(monitorId);
      this.eventService?.emit('monitor:stopped', { 
        monitor: monitorInfo.monitor 
      });
      console.log('MonitorManager: 停止监控', monitorId);
    }
  }
  
  // 评估监控条件
  async evaluateMonitor(monitor) {
    const result = await this.conditionEvaluator.evaluate(monitor);
    
    return {
      triggered: result.success,
      monitor,
      result,
      timestamp: Date.now()
    };
  }
  
  // 处理监控触发
  handleMonitorTrigger(monitor, result) {
    console.log('MonitorManager: 监控触发', monitor.id, result);
    
    this.eventService?.emit('monitor:triggered', { 
      monitor, 
      result,
      timestamp: Date.now()
    });
    
    // 根据配置执行触发动作
    switch (monitor.onTrigger) {
      case 'emergency_stop':
        this.executeEmergencyStop(monitor, result);
        break;
      case 'pause':
        this.executePause(monitor, result);
        break;
      case 'abort':
        this.executeAbort(monitor, result);
        break;
      case 'log':
        this.executeLog(monitor, result);
        break;
      case 'custom':
        this.executeCustomAction(monitor, result);
        break;
      default:
        console.warn('MonitorManager: 未知的监控触发动作', monitor.onTrigger);
    }
  }
  
  // 执行紧急停止
  executeEmergencyStop(monitor, result) {
    console.log('MonitorManager: 执行紧急停止', monitor.id);
    
    this.eventService?.emit('monitor:emergencyStop', {
      monitor,
      result,
      timestamp: Date.now()
    });
    
    // 这里可以调用实际的紧急停止逻辑
    // 例如：window.emergencyStopActive = true;
  }
  
  // 执行暂停
  executePause(monitor, result) {
    console.log('MonitorManager: 执行暂停', monitor.id);
    
    this.eventService?.emit('monitor:pause', {
      monitor,
      result,
      timestamp: Date.now()
    });
  }
  
  // 执行中止
  executeAbort(monitor, result) {
    console.log('MonitorManager: 执行中止', monitor.id);
    
    this.eventService?.emit('monitor:abort', {
      monitor,
      result,
      timestamp: Date.now()
    });
  }
  
  // 执行日志记录
  executeLog(monitor, result) {
    console.log('MonitorManager: 执行日志记录', monitor.id);
    
    const logMessage = monitor.logMessage || `监控${monitor.id}触发`;
    
    this.eventService?.emit('monitor:log', {
      monitor,
      result,
      message: logMessage,
      timestamp: Date.now()
    });
  }
  
  // 执行自定义动作
  executeCustomAction(monitor, result) {
    console.log('MonitorManager: 执行自定义动作', monitor.id);
    
    if (monitor.customAction && typeof window[monitor.customAction] === 'function') {
      try {
        window[monitor.customAction](monitor, result);
      } catch (error) {
        console.error('MonitorManager: 自定义动作执行失败', error);
      }
    }
    
    this.eventService?.emit('monitor:customAction', {
      monitor,
      result,
      timestamp: Date.now()
    });
  }
  
  // 获取活跃监控列表
  getActiveMonitors() {
    return Array.from(this.activeMonitors.values()).map(info => ({
      id: info.monitor.id,
      monitor: info.monitor,
      startTime: info.startTime,
      duration: Date.now() - info.startTime
    }));
  }
  
  // 获取监控状态
  getMonitorStatus(monitorId) {
    const monitorInfo = this.activeMonitors.get(monitorId);
    if (!monitorInfo) {
      return null;
    }
    
    return {
      id: monitorId,
      active: true,
      startTime: monitorInfo.startTime,
      duration: Date.now() - monitorInfo.startTime,
      monitor: monitorInfo.monitor
    };
  }
  
  // 设置监控间隔
  setMonitorInterval(interval) {
    if (interval < 10 || interval > 10000) {
      throw new Error('监控间隔必须在10-10000ms之间');
    }
    
    this.monitorInterval = interval;
    
    // 如果当前有活跃监控，重新启动它们
    if (this.activeMonitors.size > 0) {
      const monitors = Array.from(this.activeMonitors.values()).map(info => info.monitor);
      this.stopMonitors();
      this.startMonitors(monitors, this.eventService);
    }
  }
  
  // 验证监控配置
  validateMonitor(monitor) {
    if (!monitor || typeof monitor !== 'object') {
      return { valid: false, error: '监控配置必须是对象' };
    }
    
    if (!monitor.id) {
      return { valid: false, error: '监控必须包含id字段' };
    }
    
    if (!monitor.type) {
      return { valid: false, error: '监控必须包含type字段' };
    }
    
    if (!monitor.operator) {
      return { valid: false, error: '监控必须包含operator字段' };
    }
    
    if (monitor.value === undefined || monitor.value === null) {
      return { valid: false, error: '监控必须包含value字段' };
    }
    
    if (!monitor.onTrigger) {
      return { valid: false, error: '监控必须包含onTrigger字段' };
    }
    
    // 验证条件
    const conditionValidation = this.conditionEvaluator.validateCondition(monitor);
    if (!conditionValidation.valid) {
      return { valid: false, error: `条件验证失败: ${conditionValidation.error}` };
    }
    
    return { valid: true };
  }
  
  // 清理资源
  destroy() {
    this.stopMonitors();
    this.eventService = null;
  }
}

export default MonitorManager; 