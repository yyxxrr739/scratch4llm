import StateService from '../core/StateService.js';

class TailgateStateService extends StateService {
  constructor() {
    super();
    
    // 初始化尾门状态
    this.initState('tailgate', {
      angle: 0,
      isOpen: false,
      isAnimating: false,
      isPaused: false,
      currentAction: null,
      animationProgress: 0,
      speed: 1,
      targetAngle: 0,
      isEmergencyStopped: false,
      isEmergencyStopInProcess: false,
      lastUpdateTime: Date.now()
    });
  }

  // 更新角度
  updateAngle(angle) {
    this.updateState('tailgate', {
      angle,
      isOpen: angle >= 94, // 95度时认为完全开启
      isClosed: angle <= 1, // 1度时认为完全关闭
      lastUpdateTime: Date.now()
    });
  }

  // 更新动画状态
  updateAnimationState(isAnimating, currentAction = null) {
    this.updateState('tailgate', {
      isAnimating,
      currentAction,
      lastUpdateTime: Date.now()
    });
  }

  // 更新动画进度
  updateAnimationProgress(progress) {
    this.updateState('tailgate', {
      animationProgress: progress,
      lastUpdateTime: Date.now()
    });
  }

  // 更新速度
  updateSpeed(speed) {
    this.updateState('tailgate', {
      speed,
      lastUpdateTime: Date.now()
    });
  }

  // 更新目标角度
  updateTargetAngle(targetAngle) {
    this.updateState('tailgate', {
      targetAngle,
      lastUpdateTime: Date.now()
    });
  }

  // 更新紧急停止状态
  updateEmergencyStop(isEmergencyStopped) {
    this.updateState('tailgate', {
      isEmergencyStopped,
      lastUpdateTime: Date.now()
    });
  }

  // 更新紧急停止过程状态
  updateEmergencyStopProcess(isInProcess) {
    this.updateState('tailgate', {
      isEmergencyStopInProcess: isInProcess,
      lastUpdateTime: Date.now()
    });
  }

  // 更新暂停状态
  updatePausedState(isPaused) {
    this.updateState('tailgate', {
      isPaused,
      lastUpdateTime: Date.now()
    });
  }

  // 获取当前角度
  getCurrentAngle() {
    const state = this.getState('tailgate');
    return state ? state.angle : 0;
  }

  // 获取是否开启
  getIsOpen() {
    const state = this.getState('tailgate');
    return state ? state.isOpen : false;
  }

  // 获取是否关闭
  getIsClosed() {
    const state = this.getState('tailgate');
    return state ? state.isClosed : false;
  }

  // 获取是否正在动画
  getIsAnimating() {
    const state = this.getState('tailgate');
    return state ? state.isAnimating : false;
  }

  // 获取是否暂停
  getIsPaused() {
    const state = this.getState('tailgate');
    return state ? state.isPaused : false;
  }

  // 获取当前动作
  getCurrentAction() {
    const state = this.getState('tailgate');
    return state ? state.currentAction : null;
  }

  // 获取动画进度
  getAnimationProgress() {
    const state = this.getState('tailgate');
    return state ? state.animationProgress : 0;
  }

  // 获取当前速度
  getCurrentSpeed() {
    const state = this.getState('tailgate');
    return state ? state.speed : 1;
  }

  // 获取目标角度
  getTargetAngle() {
    const state = this.getState('tailgate');
    return state ? state.targetAngle : 0;
  }

  // 获取紧急停止状态
  getEmergencyStopStatus() {
    const state = this.getState('tailgate');
    return state ? state.isEmergencyStopped : false;
  }

  // 获取紧急停止过程状态
  getEmergencyStopProcessStatus() {
    const state = this.getState('tailgate');
    return state ? state.isEmergencyStopInProcess : false;
  }

  // 获取完整状态
  getTailgateState() {
    return this.getState('tailgate');
  }

  // 重置尾门状态
  resetTailgateState() {
    this.updateState('tailgate', {
      angle: 0,
      isOpen: false,
      isClosed: true,
      isAnimating: false,
      isPaused: false,
      currentAction: null,
      animationProgress: 0,
      speed: 1,
      targetAngle: 0,
      isEmergencyStopped: false,
      isEmergencyStopInProcess: false,
      lastUpdateTime: Date.now()
    });
  }

  // 获取状态摘要
  getStateSummary() {
    const state = this.getState('tailgate');
    if (!state) return null;

    return {
      position: state.isOpen ? 'open' : state.isClosed ? 'closed' : 'partial',
      angle: state.angle,
      action: state.currentAction,
      isAnimating: state.isAnimating,
      speed: state.speed,
      emergencyStop: state.isEmergencyStopped,
      lastUpdate: new Date(state.lastUpdateTime).toLocaleTimeString()
    };
  }

  // 检查状态是否有效
  isStateValid() {
    const state = this.getState('tailgate');
    if (!state) return false;

    // 检查角度范围
    if (state.angle < 0 || state.angle > 95) return false;
    
    // 检查速度范围
    if (state.speed < 0.1 || state.speed > 3) return false;
    
    // 检查逻辑一致性
    if (state.isOpen && state.isClosed) return false;
    
    return true;
  }

  // 获取状态变化历史
  getStateHistory(limit = 10) {
    return this.getStateHistory('tailgate', limit);
  }

  // 订阅尾门状态变化
  subscribeToTailgateState(callback) {
    return this.subscribe('tailgate', callback);
  }
}

export default TailgateStateService; 