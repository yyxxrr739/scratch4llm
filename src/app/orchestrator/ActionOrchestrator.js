import EventService from '../../services/core/EventService.js';

class ActionOrchestrator {
  constructor() {
    this.eventService = new EventService();
    this.actionQueue = [];
    this.isExecuting = false;
    this.currentSequence = null;
    this.loopCount = 0;
    this.maxLoopCount = 0;
    this.paused = false;
    
    // 支持的等待类型
    this.waitTypes = {
      duration: 'duration',
      condition: 'condition',
      event: 'event'
    };
  }

  // 添加动作到序列
  addAction(action) {
    if (!action || !action.action) {
      this.eventService.emit('orchestrator:error', { message: 'Invalid action' });
      return false;
    }

    this.actionQueue.push(action);
    this.eventService.emit('orchestrator:actionAdded', { action, queueLength: this.actionQueue.length });
    return true;
  }

  // 添加多个动作
  addActions(actions) {
    if (!Array.isArray(actions)) {
      this.eventService.emit('orchestrator:error', { message: 'Actions must be an array' });
      return false;
    }

    actions.forEach(action => this.addAction(action));
    return true;
  }

  // 清空动作队列
  clearQueue() {
    this.actionQueue = [];
    this.eventService.emit('orchestrator:queueCleared');
  }

  // 执行动作序列
  async executeSequence(service, options = {}) {
    
    if (this.isExecuting) {
      this.eventService.emit('orchestrator:error', { message: 'Sequence already executing' });
      return false;
    }

    if (this.actionQueue.length === 0) {
      this.eventService.emit('orchestrator:warning', { message: 'No actions in queue' });
      return false;
    }

    this.isExecuting = true;
    this.currentSequence = {
      service,
      options,
      startTime: Date.now()
    };

    this.eventService.emit('orchestrator:sequenceStarted', {
      queueLength: this.actionQueue.length,
      options
    });

    try {
      await this.executeActions(service);
    } catch (error) {
      console.error('ActionOrchestrator: Sequence execution error', error);
      this.eventService.emit('orchestrator:error', { message: error.message });
    } finally {
      this.isExecuting = false;
      this.currentSequence = null;
      this.eventService.emit('orchestrator:sequenceCompleted');
    }

    return true;
  }

  // 执行动作队列
  async executeActions(service) {
    for (let i = 0; i < this.actionQueue.length; i++) {
      if (!this.isExecuting || this.paused) {
        break;
      }

      const action = this.actionQueue[i];
      
      this.eventService.emit('orchestrator:actionStarted', {
        action,
        index: i,
        total: this.actionQueue.length
      });

      try {
        await this.executeAction(service, action);
      } catch (error) {
        this.eventService.emit('orchestrator:actionError', {
          action,
          error: error.message
        });
        throw error;
      }

      this.eventService.emit('orchestrator:actionCompleted', {
        action,
        index: i
      });
    }

    // 处理循环
    if (this.maxLoopCount > 0 && this.loopCount < this.maxLoopCount) {
      this.loopCount++;
      this.eventService.emit('orchestrator:loopCompleted', {
        currentLoop: this.loopCount,
        maxLoops: this.maxLoopCount
      });
      
      if (this.loopCount < this.maxLoopCount) {
        await this.executeActions(service);
      }
    }
  }

  // 执行单个动作
  async executeAction(service, action) {
    const { action: actionType, params = {}, wait } = action;
    

    // 执行动作
    if (service && typeof service.start === 'function') {
      const result = service.start({ action: actionType, ...params });
      
      if (!result) {
        throw new Error(`Failed to execute action: ${actionType}`);
      }

      // 对于紧急停止动作，不等待动画完成，因为它会自己处理停止
      if (actionType !== 'emergencyStop') {
        // 等待动画完成
        await this.waitForAnimationComplete(service);
      }
    } else {
      console.error('ActionOrchestrator: Service not available or missing start method', { service });
      throw new Error('Service not available or missing start method');
    }

    // 处理等待
    if (wait) {
      await this.handleWait(wait, service);
    }
  }

  // 等待动画完成
  waitForAnimationComplete(service) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Animation completion timeout'));
      }, 30000); // 30秒超时

      const checkAnimationComplete = () => {
        if (!this.isExecuting) {
          clearTimeout(timeout);
          reject(new Error('Sequence stopped'));
          return;
        }

        try {
          // 检查服务是否还在动画中
          if (service && typeof service.getStatus === 'function') {
            const status = service.getStatus();
            
            if (!status.isAnimating) {
              clearTimeout(timeout);
              resolve();
              return;
            }
          } else if (service && typeof service.isAnimating === 'function') {
            if (!service.isAnimating()) {
              clearTimeout(timeout);
              resolve();
              return;
            }
          } else {
            // 如果没有状态检查方法，等待一段时间后继续
            clearTimeout(timeout);
            resolve();
            return;
          }

          // 继续检查
          setTimeout(checkAnimationComplete, 100);
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };

      // 开始检查
      setTimeout(checkAnimationComplete, 100);
    });
  }

  // 处理等待
  async handleWait(wait, service) {
    const { type, value } = wait;

    switch (type) {
      case this.waitTypes.duration:
        await this.waitForDuration(value);
        break;
      
      case this.waitTypes.condition:
        await this.waitForCondition(value, service);
        break;
      
      case this.waitTypes.event:
        await this.waitForEvent(value);
        break;
      
      default:
        throw new Error(`Unknown wait type: ${type}`);
    }
  }

  // 等待指定时间
  waitForDuration(duration) {
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  // 等待条件满足
  waitForCondition(condition, service) {
    return new Promise((resolve, reject) => {
      const checkCondition = () => {
        if (!this.isExecuting) {
          reject(new Error('Sequence stopped'));
          return;
        }

        try {
          if (typeof condition === 'function') {
            if (condition(service)) {
              resolve();
            } else {
              setTimeout(checkCondition, 50);
            }
          } else {
            resolve();
          }
        } catch (error) {
          reject(error);
        }
      };

      checkCondition();
    });
  }

  // 等待事件
  waitForEvent(eventName) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Event timeout: ${eventName}`));
      }, 30000); // 30秒超时

      const unsubscribe = this.eventService.once(eventName, () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  // 并行执行多个动作
  async executeParallel(service, actions) {
    if (!Array.isArray(actions)) {
      throw new Error('Actions must be an array');
    }

    this.eventService.emit('orchestrator:parallelStarted', { actionCount: actions.length });

    const promises = actions.map(action => this.executeAction(service, action));
    
    try {
      await Promise.all(promises);
      this.eventService.emit('orchestrator:parallelCompleted');
    } catch (error) {
      this.eventService.emit('orchestrator:parallelError', { error: error.message });
      throw error;
    }
  }

  // 条件执行
  async executeIf(condition, action, service) {
    if (typeof condition === 'function') {
      if (condition(service)) {
        return await this.executeAction(service, action);
      }
    } else if (condition) {
      return await this.executeAction(service, action);
    }
  }

  // 循环执行
  async executeLoop(action, times, service) {
    this.maxLoopCount = times;
    this.loopCount = 0;
    
    this.eventService.emit('orchestrator:loopStarted', { times });

    for (let i = 0; i < times; i++) {
      if (!this.isExecuting) break;
      
      await this.executeAction(service, action);
      this.loopCount = i + 1;
    }

    this.eventService.emit('orchestrator:loopCompleted', { completed: true });
  }

  // 延迟执行
  async executeAfter(delay, action, service) {
    await this.waitForDuration(delay);
    return await this.executeAction(service, action);
  }

  // 停止当前序列
  stopSequence() {
    this.isExecuting = false;
    this.paused = false;
    this.loopCount = 0;
    this.maxLoopCount = 0;
    
    this.eventService.emit('orchestrator:sequenceStopped');
  }

  // 暂停序列
  pauseSequence() {
    if (this.isExecuting && !this.paused) {
      this.paused = true;
      this.eventService.emit('orchestrator:sequencePaused');
    }
  }

  // 恢复序列
  resumeSequence() {
    if (this.isExecuting && this.paused) {
      this.paused = false;
      this.eventService.emit('orchestrator:sequenceResumed');
    }
  }

  // 获取当前状态
  getStatus() {
    return {
      isExecuting: this.isExecuting,
      isPaused: this.paused,
      queueLength: this.actionQueue.length,
      currentSequence: this.currentSequence,
      loopCount: this.loopCount,
      maxLoopCount: this.maxLoopCount
    };
  }

  // 获取动作队列
  getActionQueue() {
    return [...this.actionQueue];
  }

  // 事件订阅
  on(eventName, callback) {
    return this.eventService.on(eventName, callback);
  }

  // 清理资源
  destroy() {
    this.stopSequence();
    this.clearQueue();
    this.eventService.clear();
  }
}

export default ActionOrchestrator; 