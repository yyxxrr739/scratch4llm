import { useState, useEffect, useRef, useCallback } from 'react';
import TailgateActionService from '../services/tailgate/TailgateActionService.js';
import TailgateStateService from '../services/tailgate/TailgateStateService.js';

export function useTailgateService() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState({});
  const [error, setError] = useState(null);
  
  const actionServiceRef = useRef(null);
  const stateServiceRef = useRef(null);
  const unsubscribeRefs = useRef([]);

  // 初始化服务
  const initialize = useCallback((element) => {
    try {
      if (!element) {
        throw new Error('Element is required for initialization');
      }

      // 创建服务实例
      const actionService = new TailgateActionService();
      const stateService = new TailgateStateService();

      // 初始化动作服务
      actionService.init(element);

      // 订阅事件
      const unsubscribes = [];

      // 订阅动作服务事件
      unsubscribes.push(
        actionService.on('tailgate:initialized', () => {
          setIsInitialized(true);
          setError(null);
        })
      );

      unsubscribes.push(
        actionService.on('tailgate:angleChanged', ({ angle, progress }) => {
          stateService.updateAngle(angle);
          stateService.updateAnimationProgress(progress);
        })
      );

      unsubscribes.push(
        actionService.on('tailgate:opening', ({ speed, targetAngle }) => {
          stateService.updateAnimationState(true, 'opening');
          stateService.updateSpeed(speed);
          stateService.updateTargetAngle(targetAngle);
        })
      );

      unsubscribes.push(
        actionService.on('tailgate:closing', ({ speed, targetAngle }) => {
          stateService.updateAnimationState(true, 'closing');
          stateService.updateSpeed(speed);
          stateService.updateTargetAngle(targetAngle);
        })
      );

      unsubscribes.push(
        actionService.on('tailgate:moving', ({ angle, speed }) => {
          stateService.updateAnimationState(true, 'moving');
          stateService.updateSpeed(speed);
          stateService.updateTargetAngle(angle);
        })
      );

      unsubscribes.push(
        actionService.on('tailgate:animationComplete', ({ angle, isOpen, isClosed }) => {
          stateService.updateAnimationState(false, null);
          stateService.updateAngle(angle);
        })
      );

      unsubscribes.push(
        actionService.on('tailgate:stopped', ({ angle }) => {
          stateService.updateAnimationState(false, null);
          stateService.updateAngle(angle);
        })
      );

      unsubscribes.push(
        actionService.on('tailgate:paused', ({ angle }) => {
          stateService.updateAnimationState(false, 'paused');
          stateService.updateAngle(angle);
        })
      );

      unsubscribes.push(
        actionService.on('tailgate:resumed', ({ angle }) => {
          stateService.updateAnimationState(true, 'resumed');
          stateService.updateAngle(angle);
        })
      );

      unsubscribes.push(
        actionService.on('tailgate:emergencyStop', ({ angle }) => {
          stateService.updateAnimationState(false, null);
          stateService.updateEmergencyStop(true);
          stateService.updateAngle(angle);
        })
      );

      unsubscribes.push(
        actionService.on('tailgate:speedChanged', ({ speed }) => {
          stateService.updateSpeed(speed);
        })
      );

      unsubscribes.push(
        actionService.on('tailgate:error', ({ message }) => {
          setError(message);
        })
      );

      unsubscribes.push(
        actionService.on('tailgate:warning', ({ message }) => {
          console.warn('Tailgate warning:', message);
        })
      );

      // 订阅状态服务事件
      unsubscribes.push(
        stateService.subscribeToTailgateState((newState, oldState) => {
          setStatus(newState);
        })
      );

      // 保存引用
      actionServiceRef.current = actionService;
      stateServiceRef.current = stateService;
      unsubscribeRefs.current = unsubscribes;

      setIsInitialized(true);
      setError(null);

    } catch (err) {
      setError(err.message);
      setIsInitialized(false);
    }
  }, []);

  // 清理资源
  const cleanup = useCallback(() => {
    if (actionServiceRef.current) {
      actionServiceRef.current.destroy();
      actionServiceRef.current = null;
    }

    if (stateServiceRef.current) {
      stateServiceRef.current.resetState('tailgate');
      stateServiceRef.current = null;
    }

    // 取消所有订阅
    unsubscribeRefs.current.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    unsubscribeRefs.current = [];

    setIsInitialized(false);
    setStatus({});
    setError(null);
  }, []);

  // 动作方法
  const actions = {
    // 基础动作
    startOpen: useCallback((speed = 1) => {
      if (actionServiceRef.current) {
        return actionServiceRef.current.startOpen(speed);
      }
      return false;
    }, []),

    startClose: useCallback((speed = 1) => {
      if (actionServiceRef.current) {
        return actionServiceRef.current.startClose(speed);
      }
      return false;
    }, []),

    stop: useCallback(() => {
      if (actionServiceRef.current) {
        return actionServiceRef.current.stop();
      }
      return false;
    }, []),

    pause: useCallback(() => {
      if (actionServiceRef.current) {
        return actionServiceRef.current.pause();
      }
      return false;
    }, []),

    resume: useCallback(() => {
      if (actionServiceRef.current) {
        return actionServiceRef.current.resume();
      }
      return false;
    }, []),

    emergencyStop: useCallback(() => {
      if (actionServiceRef.current) {
        return actionServiceRef.current.emergencyStop();
      }
      return false;
    }, []),

    // 高级动作
    moveToAngle: useCallback((angle, speed = 1) => {
      if (actionServiceRef.current) {
        return actionServiceRef.current.moveToAngle(angle, speed);
      }
      return false;
    }, []),

    moveByAngle: useCallback((deltaAngle, speed = 1) => {
      if (actionServiceRef.current) {
        return actionServiceRef.current.moveByAngle(deltaAngle, speed);
      }
      return false;
    }, []),

    setSpeed: useCallback((speed) => {
      if (actionServiceRef.current) {
        return actionServiceRef.current.setSpeed(speed);
      }
      return false;
    }, []),

    // 状态查询
    getStatus: useCallback(() => {
      if (actionServiceRef.current) {
        return actionServiceRef.current.getStatus();
      }
      return null;
    }, []),

    isOpen: useCallback(() => {
      if (actionServiceRef.current) {
        return actionServiceRef.current.isOpen();
      }
      return false;
    }, []),

    isClosed: useCallback(() => {
      if (actionServiceRef.current) {
        return actionServiceRef.current.isClosed();
      }
      return false;
    }, []),

    isAnimating: useCallback(() => {
      if (actionServiceRef.current) {
        return actionServiceRef.current.isAnimating();
      }
      return false;
    }, []),

    getCurrentAngle: useCallback(() => {
      if (actionServiceRef.current) {
        return actionServiceRef.current.getCurrentAngle();
      }
      return 0;
    }, [])
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // 状态
    isInitialized,
    status,
    error,
    
    // 方法
    initialize,
    cleanup,
    actions,
    
    // 便捷属性
    isOpen: status.isOpen || false,
    isClosed: status.isClosed || false,
    isAnimating: status.isAnimating || false,
    currentAngle: status.angle || 0,
    currentSpeed: status.speed || 1,
    currentAction: status.currentAction || null,
    animationProgress: status.animationProgress || 0,
    isEmergencyStopped: status.isEmergencyStopped || false
  };
} 