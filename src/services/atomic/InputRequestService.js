import EventService from '../core/EventService.js';

class InputRequestService {
  constructor() {
    this.eventService = new EventService();
    
    // 输入状态
    this.inputState = {
      keyPresses: new Set(),
      buttonPresses: new Set(),
      vehicleSpeed: 0,
      lastRequestTime: Date.now()
    };
    
    // 请求历史
    this.requestHistory = [];
    this.maxHistorySize = 50;
    
    // 初始化键盘监听
    this.initKeyboardListeners();
  }

  // 初始化键盘监听器
  initKeyboardListeners() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  // 处理键盘按下
  handleKeyDown(event) {
    const key = event.code;
    this.inputState.keyPresses.add(key);
    
    // 检测按键请求
    this.detectKeyRequest(key, 'press');
    
    this.eventService.emit('input:keyDown', { key, timestamp: Date.now() });
  }

  // 处理键盘释放
  handleKeyUp(event) {
    const key = event.code;
    this.inputState.keyPresses.delete(key);
    
    // 检测按键请求
    this.detectKeyRequest(key, 'release');
    
    this.eventService.emit('input:keyUp', { key, timestamp: Date.now() });
  }

  // 检测按键请求
  detectKeyRequest(key, action) {
    let requestType = null;
    
    switch (key) {
      case 'KeyO':
        requestType = action === 'press' ? 'open_request' : 'open_release';
        break;
      case 'KeyC':
        requestType = action === 'press' ? 'close_request' : 'close_release';
        break;
      case 'ArrowUp':
        requestType = action === 'press' ? 'accelerate_request' : 'accelerate_release';
        break;
      case 'ArrowDown':
        requestType = action === 'press' ? 'decelerate_request' : 'decelerate_release';
        break;
      case 'Space':
        requestType = action === 'press' ? 'emergency_stop_request' : null;
        break;
      default:
        return;
    }
    
    if (requestType) {
      this.createRequest(requestType, { key, action });
    }
  }

  // 处理按钮按下
  handleButtonPress(buttonId) {
    this.inputState.buttonPresses.add(buttonId);
    
    // 检测按钮请求
    this.detectButtonRequest(buttonId, 'press');
    
    this.eventService.emit('input:buttonPress', { buttonId, timestamp: Date.now() });
  }

  // 处理按钮释放
  handleButtonRelease(buttonId) {
    this.inputState.buttonPresses.delete(buttonId);
    
    // 检测按钮请求
    this.detectButtonRequest(buttonId, 'release');
    
    this.eventService.emit('input:buttonRelease', { buttonId, timestamp: Date.now() });
  }

  // 检测按钮请求
  detectButtonRequest(buttonId, action) {
    let requestType = null;
    
    switch (buttonId) {
      case 'open_button':
        requestType = action === 'press' ? 'open_request' : 'open_release';
        break;
      case 'close_button':
        requestType = action === 'press' ? 'close_request' : 'close_release';
        break;
      case 'emergency_stop_button':
        requestType = action === 'press' ? 'emergency_stop_request' : null;
        break;
      case 'reset_emergency_button':
        requestType = action === 'press' ? 'reset_emergency_request' : null;
        break;
      default:
        return;
    }
    
    if (requestType) {
      this.createRequest(requestType, { buttonId, action });
    }
  }

  // 创建请求
  createRequest(type, data) {
    const request = {
      id: this.generateRequestId(),
      type,
      data,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    // 添加到历史记录
    this.addToHistory(request);
    
    // 检测请求跳变
    this.detectRequestTransition(request);
    
    // 发出请求事件
    this.eventService.emit('input:request', request);
    
    return request;
  }

  // 检测请求跳变
  detectRequestTransition(request) {
    const recentRequests = this.requestHistory
      .filter(r => r.type === request.type)
      .slice(-2);
    
    if (recentRequests.length >= 2) {
      const timeDiff = request.timestamp - recentRequests[0].timestamp;
      
      // 如果两次相同请求间隔小于100ms，认为是跳变
      if (timeDiff < 100) {
        this.eventService.emit('input:requestTransition', {
          type: request.type,
          frequency: 1000 / timeDiff,
          timestamp: request.timestamp
        });
      }
    }
  }

  // 设置车速
  setVehicleSpeed(speed) {
    const oldSpeed = this.inputState.vehicleSpeed;
    this.inputState.vehicleSpeed = Math.max(0, Math.min(30, speed)); // 限制在0-30km/h
    
    if (oldSpeed !== this.inputState.vehicleSpeed) {
      this.eventService.emit('input:speedChanged', {
        oldSpeed,
        newSpeed: this.inputState.vehicleSpeed,
        timestamp: Date.now()
      });
    }
  }

  // 获取车速
  getVehicleSpeed() {
    return this.inputState.vehicleSpeed;
  }

  // 获取当前输入状态
  getInputState() {
    return {
      ...this.inputState,
      activeKeys: Array.from(this.inputState.keyPresses),
      activeButtons: Array.from(this.inputState.buttonPresses)
    };
  }

  // 获取请求历史
  getRequestHistory(limit = 10) {
    return this.requestHistory.slice(-limit);
  }

  // 添加请求到历史记录
  addToHistory(request) {
    this.requestHistory.push(request);
    
    // 限制历史记录大小
    if (this.requestHistory.length > this.maxHistorySize) {
      this.requestHistory.shift();
    }
  }

  // 生成请求ID
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 清除历史记录
  clearHistory() {
    this.requestHistory = [];
  }

  // 事件监听
  on(eventName, callback) {
    return this.eventService.on(eventName, callback);
  }

  // 销毁服务
  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.eventService.destroy();
  }
}

export default InputRequestService; 