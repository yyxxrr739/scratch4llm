class EventService {
  constructor() {
    this.events = new Map();
    this.globalSubscribers = new Set();
  }

  // 发布事件
  emit(eventName, data = {}) {
    const subscribers = this.events.get(eventName) || new Set();
    
    // 通知特定事件订阅者
    subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Event subscriber error for ${eventName}:`, error);
      }
    });

    // 通知全局订阅者
    this.globalSubscribers.forEach(callback => {
      try {
        callback(eventName, data);
      } catch (error) {
        console.error('Global event subscriber error:', error);
      }
    });
  }

  // 订阅事件
  on(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName).add(callback);
    
    // 返回取消订阅函数
    return () => {
      const subscribers = this.events.get(eventName);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.events.delete(eventName);
        }
      }
    };
  }

  // 取消订阅事件
  off(eventName, callback) {
    const subscribers = this.events.get(eventName);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.events.delete(eventName);
      }
    }
  }

  // 订阅所有事件（全局订阅者）
  onAll(callback) {
    this.globalSubscribers.add(callback);
    
    // 返回取消订阅函数
    return () => {
      this.globalSubscribers.delete(callback);
    };
  }

  // 取消全局订阅
  offAll(callback) {
    this.globalSubscribers.delete(callback);
  }

  // 一次性订阅事件
  once(eventName, callback) {
    const wrappedCallback = (data) => {
      callback(data);
      this.off(eventName, wrappedCallback);
    };
    this.on(eventName, wrappedCallback);
  }

  // 获取事件订阅者数量
  getSubscriberCount(eventName) {
    const subscribers = this.events.get(eventName);
    return subscribers ? subscribers.size : 0;
  }

  // 获取所有事件名称
  getEventNames() {
    return Array.from(this.events.keys());
  }

  // 清理所有事件
  clear() {
    this.events.clear();
    this.globalSubscribers.clear();
  }

  // 清理特定事件
  clearEvent(eventName) {
    this.events.delete(eventName);
  }
}

export default EventService; 