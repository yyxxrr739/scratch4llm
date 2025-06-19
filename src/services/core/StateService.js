class StateService {
  constructor() {
    this.state = {};
    this.subscribers = new Map();
    this.stateHistory = [];
    this.maxHistoryLength = 50;
  }

  // 初始化状态
  initState(componentId, initialState) {
    this.state[componentId] = { ...initialState };
    this.subscribers.set(componentId, new Set());
  }

  // 更新状态
  updateState(componentId, newState) {
    if (!this.state[componentId]) {
      this.initState(componentId, newState);
      return;
    }

    const oldState = { ...this.state[componentId] };
    this.state[componentId] = { ...this.state[componentId], ...newState };
    
    // 保存状态历史
    this.saveStateHistory(componentId, oldState, this.state[componentId]);
    
    // 通知订阅者
    this.notifySubscribers(componentId, this.state[componentId], oldState);
  }

  // 获取状态
  getState(componentId) {
    return this.state[componentId] ? { ...this.state[componentId] } : null;
  }

  // 订阅状态变化
  subscribe(componentId, callback) {
    if (!this.subscribers.has(componentId)) {
      this.subscribers.set(componentId, new Set());
    }
    this.subscribers.get(componentId).add(callback);
    
    // 返回取消订阅函数
    return () => {
      const componentSubscribers = this.subscribers.get(componentId);
      if (componentSubscribers) {
        componentSubscribers.delete(callback);
      }
    };
  }

  // 通知订阅者
  notifySubscribers(componentId, newState, oldState) {
    const componentSubscribers = this.subscribers.get(componentId);
    if (componentSubscribers) {
      componentSubscribers.forEach(callback => {
        try {
          callback(newState, oldState);
        } catch (error) {
          console.error('State subscriber error:', error);
        }
      });
    }
  }

  // 保存状态历史
  saveStateHistory(componentId, oldState, newState) {
    this.stateHistory.push({
      componentId,
      timestamp: Date.now(),
      oldState,
      newState
    });

    // 限制历史记录数量
    if (this.stateHistory.length > this.maxHistoryLength) {
      this.stateHistory.shift();
    }
  }

  // 获取状态历史
  getStateHistory(componentId, limit = 10) {
    return this.stateHistory
      .filter(entry => entry.componentId === componentId)
      .slice(-limit);
  }

  // 重置状态
  resetState(componentId) {
    if (this.state[componentId]) {
      delete this.state[componentId];
    }
    if (this.subscribers.has(componentId)) {
      this.subscribers.delete(componentId);
    }
  }

  // 获取所有状态
  getAllStates() {
    return { ...this.state };
  }
}

export default StateService; 