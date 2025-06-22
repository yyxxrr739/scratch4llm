import EventService from '../core/EventService.js';

class StateMachineManager {
  constructor() {
    this.eventService = new EventService();
    
    // 当前状态
    this.currentState = 'idle';
    
    // 状态定义
    this.states = {
      idle: {
        name: '空闲',
        description: '尾门处于空闲状态，等待指令',
        allowedTransitions: ['opening', 'closing', 'emergency_stop']
      },
      opening: {
        name: '开启中',
        description: '尾门正在开启',
        allowedTransitions: ['open', 'closing', 'emergency_stop', 'paused']
      },
      closing: {
        name: '关闭中',
        description: '尾门正在关闭',
        allowedTransitions: ['closed', 'opening', 'emergency_stop', 'paused']
      },
      open: {
        name: '已开启',
        description: '尾门已完全开启',
        allowedTransitions: ['closing', 'emergency_stop']
      },
      closed: {
        name: '已关闭',
        description: '尾门已完全关闭',
        allowedTransitions: ['opening', 'emergency_stop']
      },
      paused: {
        name: '已暂停',
        description: '尾门运动已暂停',
        allowedTransitions: ['opening', 'closing', 'emergency_stop']
      },
      emergency_stop: {
        name: '紧急停止',
        description: '系统处于紧急停止状态',
        allowedTransitions: ['idle']
      }
    };
    
    // 状态转换历史
    this.transitionHistory = [];
    this.maxHistorySize = 50;
    
    // 状态进入/退出处理器
    this.stateHandlers = new Map();
    
    // 初始化状态处理器
    this.initStateHandlers();
  }

  // 初始化状态处理器
  initStateHandlers() {
    // 空闲状态处理器
    this.stateHandlers.set('idle', {
      onEnter: () => this.handleIdleEnter(),
      onExit: () => this.handleIdleExit()
    });
    
    // 开启中状态处理器
    this.stateHandlers.set('opening', {
      onEnter: () => this.handleOpeningEnter(),
      onExit: () => this.handleOpeningExit()
    });
    
    // 关闭中状态处理器
    this.stateHandlers.set('closing', {
      onEnter: () => this.handleClosingEnter(),
      onExit: () => this.handleClosingExit()
    });
    
    // 已开启状态处理器
    this.stateHandlers.set('open', {
      onEnter: () => this.handleOpenEnter(),
      onExit: () => this.handleOpenExit()
    });
    
    // 已关闭状态处理器
    this.stateHandlers.set('closed', {
      onEnter: () => this.handleClosedEnter(),
      onExit: () => this.handleClosedExit()
    });
    
    // 已暂停状态处理器
    this.stateHandlers.set('paused', {
      onEnter: () => this.handlePausedEnter(),
      onExit: () => this.handlePausedExit()
    });
    
    // 紧急停止状态处理器
    this.stateHandlers.set('emergency_stop', {
      onEnter: () => this.handleEmergencyStopEnter(),
      onExit: () => this.handleEmergencyStopExit()
    });
  }

  // 状态转换
  transition(newState, reason = 'manual') {
    const oldState = this.currentState;
    
    // 检查状态是否存在
    if (!this.states[newState]) {
      this.eventService.emit('statemachine:error', {
        message: `未知状态: ${newState}`,
        oldState,
        attemptedState: newState
      });
      return false;
    }
    
    // 检查转换是否允许
    if (!this.isTransitionAllowed(oldState, newState)) {
      this.eventService.emit('statemachine:error', {
        message: `不允许的状态转换: ${oldState} -> ${newState}`,
        oldState,
        attemptedState: newState,
        allowedTransitions: this.states[oldState].allowedTransitions
      });
      return false;
    }
    
    // 执行状态退出处理
    const oldHandler = this.stateHandlers.get(oldState);
    if (oldHandler && oldHandler.onExit) {
      oldHandler.onExit();
    }
    
    // 更新当前状态
    this.currentState = newState;
    
    // 执行状态进入处理
    const newHandler = this.stateHandlers.get(newState);
    if (newHandler && newHandler.onEnter) {
      newHandler.onEnter();
    }
    
    // 记录转换历史
    const transition = this.createTransitionRecord(oldState, newState, reason);
    this.addToHistory(transition);
    
    // 发出状态转换事件
    this.eventService.emit('statemachine:stateChanged', transition);
    
    return true;
  }

  // 检查转换是否允许
  isTransitionAllowed(fromState, toState) {
    const state = this.states[fromState];
    return state && state.allowedTransitions.includes(toState);
  }

  // 获取当前状态信息
  getCurrentState() {
    const state = this.states[this.currentState];
    return {
      name: this.currentState,
      displayName: state.name,
      description: state.description,
      allowedTransitions: state.allowedTransitions
    };
  }

  // 获取所有状态
  getAllStates() {
    return Object.keys(this.states).map(key => ({
      name: key,
      displayName: this.states[key].name,
      description: this.states[key].description,
      allowedTransitions: this.states[key].allowedTransitions
    }));
  }

  // 获取转换历史
  getTransitionHistory(limit = 20) {
    return this.transitionHistory.slice(-limit);
  }

  // 创建转换记录
  createTransitionRecord(fromState, toState, reason) {
    return {
      id: this.generateTransitionId(),
      fromState,
      toState,
      reason,
      timestamp: Date.now(),
      duration: this.calculateStateDuration(fromState)
    };
  }

  // 计算状态持续时间
  calculateStateDuration(stateName) {
    const lastTransition = this.transitionHistory
      .filter(t => t.toState === stateName)
      .pop();
    
    if (lastTransition) {
      return Date.now() - lastTransition.timestamp;
    }
    
    return 0;
  }

  // 添加转换到历史记录
  addToHistory(transition) {
    this.transitionHistory.push(transition);
    
    // 限制历史记录大小
    if (this.transitionHistory.length > this.maxHistorySize) {
      this.transitionHistory.shift();
    }
  }

  // 生成转换ID
  generateTransitionId() {
    return `transition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 清除历史记录
  clearHistory() {
    this.transitionHistory = [];
  }

  // 状态处理器方法

  // 空闲状态处理器
  handleIdleEnter() {
    this.eventService.emit('statemachine:idleEntered', {
      timestamp: Date.now()
    });
  }

  handleIdleExit() {
    this.eventService.emit('statemachine:idleExited', {
      timestamp: Date.now()
    });
  }

  // 开启中状态处理器
  handleOpeningEnter() {
    this.eventService.emit('statemachine:openingEntered', {
      timestamp: Date.now()
    });
  }

  handleOpeningExit() {
    this.eventService.emit('statemachine:openingExited', {
      timestamp: Date.now()
    });
  }

  // 关闭中状态处理器
  handleClosingEnter() {
    this.eventService.emit('statemachine:closingEntered', {
      timestamp: Date.now()
    });
  }

  handleClosingExit() {
    this.eventService.emit('statemachine:closingExited', {
      timestamp: Date.now()
    });
  }

  // 已开启状态处理器
  handleOpenEnter() {
    this.eventService.emit('statemachine:openEntered', {
      timestamp: Date.now()
    });
  }

  handleOpenExit() {
    this.eventService.emit('statemachine:openExited', {
      timestamp: Date.now()
    });
  }

  // 已关闭状态处理器
  handleClosedEnter() {
    this.eventService.emit('statemachine:closedEntered', {
      timestamp: Date.now()
    });
  }

  handleClosedExit() {
    this.eventService.emit('statemachine:closedExited', {
      timestamp: Date.now()
    });
  }

  // 已暂停状态处理器
  handlePausedEnter() {
    this.eventService.emit('statemachine:pausedEntered', {
      timestamp: Date.now()
    });
  }

  handlePausedExit() {
    this.eventService.emit('statemachine:pausedExited', {
      timestamp: Date.now()
    });
  }

  // 紧急停止状态处理器
  handleEmergencyStopEnter() {
    this.eventService.emit('statemachine:emergencyStopEntered', {
      timestamp: Date.now()
    });
  }

  handleEmergencyStopExit() {
    this.eventService.emit('statemachine:emergencyStopExited', {
      timestamp: Date.now()
    });
  }

  // 便捷转换方法

  // 开始开启
  startOpening() {
    return this.transition('opening', 'open_request');
  }

  // 开始关闭
  startClosing() {
    return this.transition('closing', 'close_request');
  }

  // 完成开启
  completeOpening() {
    return this.transition('open', 'opening_complete');
  }

  // 完成关闭
  completeClosing() {
    return this.transition('closed', 'closing_complete');
  }

  // 暂停运动
  pauseMotion() {
    if (this.currentState === 'opening' || this.currentState === 'closing') {
      return this.transition('paused', 'pause_request');
    }
    return false;
  }

  // 恢复运动
  resumeMotion() {
    if (this.currentState === 'paused') {
      // 根据之前的状态决定恢复方向
      const lastTransition = this.transitionHistory
        .filter(t => t.toState === 'paused')
        .pop();
      
      if (lastTransition && lastTransition.fromState === 'opening') {
        return this.transition('opening', 'resume_opening');
      } else if (lastTransition && lastTransition.fromState === 'closing') {
        return this.transition('closing', 'resume_closing');
      }
    }
    return false;
  }

  // 紧急停止
  emergencyStop() {
    return this.transition('emergency_stop', 'emergency_stop_request');
  }

  // 重置紧急停止
  resetEmergencyStop() {
    if (this.currentState === 'emergency_stop') {
      return this.transition('idle', 'emergency_stop_reset');
    }
    return false;
  }

  // 检查状态
  isInState(stateName) {
    return this.currentState === stateName;
  }

  isMoving() {
    return this.currentState === 'opening' || this.currentState === 'closing';
  }

  isStopped() {
    return this.currentState === 'idle' || 
           this.currentState === 'open' || 
           this.currentState === 'closed' ||
           this.currentState === 'emergency_stop';
  }

  isEmergencyStopped() {
    return this.currentState === 'emergency_stop';
  }

  // 事件监听
  on(eventName, callback) {
    return this.eventService.on(eventName, callback);
  }

  // 销毁管理器
  destroy() {
    this.eventService.destroy();
  }
}

export default StateMachineManager; 