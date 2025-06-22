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
    
    // 演示场景
    this.demoScenarios = {
      basicOpenClose: {
        id: 'basicOpenClose',
        name: '基础开启关闭演示',
        description: '演示基本的尾门开启和关闭功能',
        sequence: [
          { action: 'open', params: { speed: 1 } },
          { wait: { type: 'duration', value: 3000 } },
          { action: 'close', params: { speed: 1 } }
        ],
        loop: false,
        maxLoops: 1
      },
      
      safetyDemo: {
        id: 'safetyDemo',
        name: '安全功能演示',
        description: '演示障碍物检测和紧急停止功能',
        sequence: [
          { action: 'open', params: { speed: 1 } },
          { wait: { type: 'duration', value: 1000 } },
          { action: 'simulateObstacle', params: { distance: 30 } },
          { wait: { type: 'duration', value: 2000 } },
          { action: 'emergencyStop', params: {} },
          { wait: { type: 'duration', value: 1000 } },
          { action: 'close', params: { speed: 1 } }
        ],
        loop: false,
        maxLoops: 1
      },
      
      faultDemo: {
        id: 'faultDemo',
        name: '故障处理演示',
        description: '演示硬件故障和电机故障的处理',
        sequence: [
          { action: 'open', params: { speed: 1 } },
          { wait: { type: 'duration', value: 1000 } },
          { action: 'simulateHardwareFault', params: { faultType: 'COMMUNICATION' } },
          { wait: { type: 'duration', value: 2000 } },
          { action: 'emergencyStop', params: {} },
          { wait: { type: 'duration', value: 1000 } },
          { action: 'close', params: { speed: 1 } }
        ],
        loop: false,
        maxLoops: 1
      },
      
      speedDemo: {
        id: 'speedDemo',
        name: '速度控制演示',
        description: '演示不同速度下的运动效果',
        sequence: [
          { action: 'open', params: { speed: 0.5 } },
          { wait: { type: 'duration', value: 2000 } },
          { action: 'close', params: { speed: 0.5 } },
          { wait: { type: 'duration', value: 1000 } },
          { action: 'open', params: { speed: 1.5 } },
          { wait: { type: 'duration', value: 2000 } },
          { action: 'close', params: { speed: 1.5 } }
        ],
        loop: false,
        maxLoops: 1
      },
      
      precisionDemo: {
        id: 'precisionDemo',
        name: '精确控制演示',
        description: '演示精确角度控制功能',
        sequence: [
          { action: 'moveToAngle', params: { angle: 30, speed: 0.8 } },
          { wait: { type: 'duration', value: 1500 } },
          { action: 'moveToAngle', params: { angle: 60, speed: 0.8 } },
          { wait: { type: 'duration', value: 1500 } },
          { action: 'moveToAngle', params: { angle: 90, speed: 0.8 } },
          { wait: { type: 'duration', value: 1500 } },
          { action: 'close', params: { speed: 1 } }
        ],
        loop: false,
        maxLoops: 1
      },
      
      stressTest: {
        id: 'stressTest',
        name: '压力测试演示',
        description: '演示连续操作和故障恢复',
        sequence: [
          { action: 'open', params: { speed: 1 } },
          { wait: { type: 'duration', value: 500 } },
          { action: 'close', params: { speed: 1 } },
          { wait: { type: 'duration', value: 500 } },
          { action: 'open', params: { speed: 1 } },
          { wait: { type: 'duration', value: 500 } },
          { action: 'simulateObstacle', params: { distance: 20 } },
          { wait: { type: 'duration', value: 1000 } },
          { action: 'emergencyStop', params: {} },
          { wait: { type: 'duration', value: 1000 } },
          { action: 'close', params: { speed: 1 } }
        ],
        loop: false,
        maxLoops: 1
      }
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

  // 获取场景
  getScenario(scenarioId) {
    return this.demoScenarios[scenarioId] || null;
  }

  // 获取所有场景
  getAllScenarios() {
    return Object.values(this.demoScenarios);
  }

  // 获取场景列表
  getScenarioList() {
    return Object.values(this.demoScenarios).map(scenario => ({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description
    }));
  }

  // 创建自定义场景
  createCustomScenario(scenarioData) {
    const { id, name, description, sequence, loop = false, maxLoops = 1 } = scenarioData;
    
    if (!id || !name || !sequence) {
      this.eventService.emit('dummy:error', {
        message: '场景数据不完整',
        scenarioData
      });
      return false;
    }
    
    if (this.demoScenarios[id]) {
      this.eventService.emit('dummy:warning', {
        message: `场景ID已存在: ${id}`,
        scenarioData
      });
      return false;
    }
    
    this.demoScenarios[id] = {
      id,
      name,
      description: description || '',
      sequence,
      loop,
      maxLoops
    };
    
    this.eventService.emit('dummy:scenarioCreated', {
      scenario: this.demoScenarios[id],
      timestamp: Date.now()
    });
    
    return true;
  }

  // 更新场景
  updateScenario(scenarioId, updates) {
    if (!this.demoScenarios[scenarioId]) {
      this.eventService.emit('dummy:error', {
        message: `场景不存在: ${scenarioId}`,
        updates
      });
      return false;
    }
    
    const oldScenario = { ...this.demoScenarios[scenarioId] };
    this.demoScenarios[scenarioId] = {
      ...this.demoScenarios[scenarioId],
      ...updates
    };
    
    this.eventService.emit('dummy:scenarioUpdated', {
      oldScenario,
      newScenario: this.demoScenarios[scenarioId],
      timestamp: Date.now()
    });
    
    return true;
  }

  // 删除场景
  deleteScenario(scenarioId) {
    if (!this.demoScenarios[scenarioId]) {
      this.eventService.emit('dummy:error', {
        message: `场景不存在: ${scenarioId}`
      });
      return false;
    }
    
    const deletedScenario = this.demoScenarios[scenarioId];
    delete this.demoScenarios[scenarioId];
    
    this.eventService.emit('dummy:scenarioDeleted', {
      scenario: deletedScenario,
      timestamp: Date.now()
    });
    
    return true;
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