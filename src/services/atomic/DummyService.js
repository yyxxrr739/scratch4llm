import EventService from '../core/EventService.js';

class DummyService {
  constructor() {
    this.eventService = new EventService();
    
    // 模拟数据状态
    this.dummyState = {
      vehicleSpeed: 0,
      obstacleDistance: 100,
      temperature: 25,
      humidity: 50,
      batteryLevel: 85,
      signalStrength: 90
    };
    
    // 模拟数据更新间隔
    this.updateInterval = null;
    this.updateFrequency = 1000; // 1秒
    
    // 开始模拟数据更新
    this.startDataSimulation();
  }

  // 开始数据模拟
  startDataSimulation() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = setInterval(() => {
      this.updateDummyData();
    }, this.updateFrequency);
  }

  // 停止数据模拟
  stopDataSimulation() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // 更新模拟数据
  updateDummyData() {
    // 模拟车速变化
    this.dummyState.vehicleSpeed = Math.max(0, Math.min(30, 
      this.dummyState.vehicleSpeed + (Math.random() - 0.5) * 2
    ));
    
    // 模拟障碍物距离变化
    this.dummyState.obstacleDistance = Math.max(0, Math.min(200,
      this.dummyState.obstacleDistance + (Math.random() - 0.5) * 10
    ));
    
    // 模拟温度变化
    this.dummyState.temperature = Math.max(15, Math.min(35,
      this.dummyState.temperature + (Math.random() - 0.5) * 1
    ));
    
    // 模拟湿度变化
    this.dummyState.humidity = Math.max(30, Math.min(70,
      this.dummyState.humidity + (Math.random() - 0.5) * 2
    ));
    
    // 模拟电池电量变化
    this.dummyState.batteryLevel = Math.max(0, Math.min(100,
      this.dummyState.batteryLevel - Math.random() * 0.1
    ));
    
    // 模拟信号强度变化
    this.dummyState.signalStrength = Math.max(50, Math.min(100,
      this.dummyState.signalStrength + (Math.random() - 0.5) * 5
    ));
    
    // 发出数据更新事件
    this.eventService.emit('dummy:dataUpdated', {
      data: { ...this.dummyState },
      timestamp: Date.now()
    });
  }

  // 模拟输入请求
  simulateInputRequest(requestType, data = {}) {
    const request = {
      id: this.generateRequestId(),
      type: requestType,
      data: {
        ...data,
        simulated: true,
        timestamp: Date.now()
      }
    };
    
    this.eventService.emit('dummy:inputRequestSimulated', {
      request,
      timestamp: Date.now()
    });
    
    return request;
  }

  // 模拟故障事件
  simulateFaultEvent(faultType, details = {}) {
    const fault = {
      id: this.generateFaultId(),
      type: faultType,
      details: {
        ...details,
        simulated: true,
        timestamp: Date.now()
      }
    };
    
    this.eventService.emit('dummy:faultEventSimulated', {
      fault,
      timestamp: Date.now()
    });
    
    return fault;
  }

  // 模拟状态变化
  simulateStateChange(component, property, value) {
    const stateChange = {
      id: this.generateStateChangeId(),
      component,
      property,
      oldValue: this.dummyState[property],
      newValue: value,
      timestamp: Date.now()
    };
    
    this.dummyState[property] = value;
    
    this.eventService.emit('dummy:stateChangeSimulated', {
      stateChange,
      timestamp: Date.now()
    });
    
    return stateChange;
  }

  // 获取模拟数据
  getDummyData() {
    return { ...this.dummyState };
  }

  // 设置模拟数据
  setDummyData(data) {
    const oldData = { ...this.dummyState };
    this.dummyState = { ...this.dummyState, ...data };
    
    this.eventService.emit('dummy:dataSet', {
      oldData,
      newData: this.dummyState,
      timestamp: Date.now()
    });
  }

  // 重置模拟数据
  resetDummyData() {
    const oldData = { ...this.dummyState };
    this.dummyState = {
      vehicleSpeed: 0,
      obstacleDistance: 100,
      temperature: 25,
      humidity: 50,
      batteryLevel: 85,
      signalStrength: 90
    };
    
    this.eventService.emit('dummy:dataReset', {
      oldData,
      newData: this.dummyState,
      timestamp: Date.now()
    });
  }

  // 生成请求ID
  generateRequestId() {
    return `dummy_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 生成故障ID
  generateFaultId() {
    return `dummy_fault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 生成状态变化ID
  generateStateChangeId() {
    return `dummy_state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 事件监听
  on(eventName, callback) {
    return this.eventService.on(eventName, callback);
  }

  // 销毁服务
  destroy() {
    this.stopDataSimulation();
    this.eventService.destroy();
  }
}

export default DummyService; 