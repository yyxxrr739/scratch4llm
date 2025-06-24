import { useState, useEffect, useRef, useCallback } from 'react';
import ActionOrchestrator from '../app/orchestrator/ActionOrchestrator.js';
import { getScenarioConfig, validateScenario } from '../app/orchestrator/scenarios/TailgateScenarios.js';

export function useActionOrchestrator() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [actionProgress, setActionProgress] = useState(0);
  const [queueLength, setQueueLength] = useState(0);
  const [loopInfo, setLoopInfo] = useState({ current: 0, max: 0 });
  const [error, setError] = useState(null);
  
  const orchestratorRef = useRef(null);

  // 初始化编排器
  const initialize = useCallback(() => {
    if (orchestratorRef.current) {
      orchestratorRef.current.destroy();
    }

    const orchestrator = new ActionOrchestrator();
    
    // 订阅编排器事件
    const unsubscribes = [];

    unsubscribes.push(
      orchestrator.on('orchestrator:sequenceStarted', ({ queueLength }) => {
        setIsExecuting(true);
        setIsPaused(false);
        setQueueLength(queueLength);
        setActionProgress(0);
        setError(null);
      })
    );

    unsubscribes.push(
      orchestrator.on('orchestrator:actionStarted', ({ action, index, total }) => {
        setCurrentAction(action);
        setActionProgress((index / total) * 100);
      })
    );

    unsubscribes.push(
      orchestrator.on('orchestrator:actionCompleted', ({ index, total }) => {
        setActionProgress(((index + 1) / total) * 100);
      })
    );

    unsubscribes.push(
      orchestrator.on('orchestrator:sequenceCompleted', () => {
        setIsExecuting(false);
        setIsPaused(false);
        setCurrentAction(null);
        setActionProgress(100);
        setQueueLength(0);
        setLoopInfo({ current: 0, max: 0 });
      })
    );

    unsubscribes.push(
      orchestrator.on('orchestrator:sequenceStopped', () => {
        setIsExecuting(false);
        setIsPaused(false);
        setCurrentAction(null);
        setActionProgress(0);
        setQueueLength(0);
        setLoopInfo({ current: 0, max: 0 });
      })
    );

    unsubscribes.push(
      orchestrator.on('orchestrator:sequencePaused', () => {
        setIsPaused(true);
      })
    );

    unsubscribes.push(
      orchestrator.on('orchestrator:sequenceResumed', () => {
        setIsPaused(false);
      })
    );

    unsubscribes.push(
      orchestrator.on('orchestrator:loopStarted', ({ times }) => {
        setLoopInfo({ current: 0, max: times });
      })
    );

    unsubscribes.push(
      orchestrator.on('orchestrator:loopCompleted', ({ currentLoop, maxLoops }) => {
        setLoopInfo({ current: currentLoop, max: maxLoops });
      })
    );

    unsubscribes.push(
      orchestrator.on('orchestrator:error', ({ message }) => {
        setError(message);
        setIsExecuting(false);
        setIsPaused(false);
      })
    );

    unsubscribes.push(
      orchestrator.on('orchestrator:warning', ({ message }) => {
        // 警告信息处理
      })
    );

    orchestratorRef.current = orchestrator;
    
    return () => {
      unsubscribes.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, []);

  // 执行预设场景
  const executeScenario = useCallback(async (scenarioId, service) => {
    
    if (!orchestratorRef.current) {
      setError('Orchestrator not initialized');
      return false;
    }

    const scenario = getScenarioConfig(scenarioId);
    if (!scenario) {
      setError(`Scenario not found: ${scenarioId}`);
      return false;
    }

    const validation = validateScenario(scenario);
    if (!validation.valid) {
      setError(`Invalid scenario: ${validation.error}`);
      return false;
    }

    // 清空队列并添加场景动作
    orchestratorRef.current.clearQueue();
    orchestratorRef.current.addActions(scenario.sequence);

    // 设置循环
    if (scenario.loop && scenario.maxLoops) {
      // 这里需要在编排器中支持循环设置
      // 暂时通过重复添加动作来实现
      for (let i = 1; i < scenario.maxLoops; i++) {
        orchestratorRef.current.addActions(scenario.sequence);
      }
    }

    // 执行序列
    return await orchestratorRef.current.executeSequence(service);
  }, []);

  // 执行自定义动作序列
  const executeCustomSequence = useCallback(async (actions, service) => {
    if (!orchestratorRef.current) {
      setError('Orchestrator not initialized');
      return false;
    }

    if (!Array.isArray(actions) || actions.length === 0) {
      setError('Invalid actions array');
      return false;
    }

    // 验证动作
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      if (!action.action && !action.wait) {
        setError(`Invalid action at index ${i}`);
        return false;
      }
    }

    // 清空队列并添加动作
    orchestratorRef.current.clearQueue();
    orchestratorRef.current.addActions(actions);

    // 执行序列
    return await orchestratorRef.current.executeSequence(service);
  }, []);

  // 添加单个动作
  const addAction = useCallback((action) => {
    if (!orchestratorRef.current) {
      setError('Orchestrator not initialized');
      return false;
    }

    return orchestratorRef.current.addAction(action);
  }, []);

  // 添加多个动作
  const addActions = useCallback((actions) => {
    if (!orchestratorRef.current) {
      setError('Orchestrator not initialized');
      return false;
    }

    return orchestratorRef.current.addActions(actions);
  }, []);

  // 执行当前队列
  const executeQueue = useCallback(async (service) => {
    if (!orchestratorRef.current) {
      setError('Orchestrator not initialized');
      return false;
    }

    return await orchestratorRef.current.executeSequence(service);
  }, []);

  // 控制方法
  const controls = {
    stop: useCallback(() => {
      if (orchestratorRef.current) {
        orchestratorRef.current.stopSequence();
      }
    }, []),

    pause: useCallback(() => {
      if (orchestratorRef.current) {
        orchestratorRef.current.pauseSequence();
      }
    }, []),

    resume: useCallback(() => {
      if (orchestratorRef.current) {
        orchestratorRef.current.resumeSequence();
      }
    }, []),

    clear: useCallback(() => {
      if (orchestratorRef.current) {
        orchestratorRef.current.clearQueue();
        setQueueLength(0);
        setActionProgress(0);
        setCurrentAction(null);
      }
    }, [])
  };

  // 获取状态
  const getStatus = useCallback(() => {
    if (!orchestratorRef.current) {
      return null;
    }

    return orchestratorRef.current.getStatus();
  }, []);

  // 获取动作队列
  const getActionQueue = useCallback(() => {
    if (!orchestratorRef.current) {
      return [];
    }

    return orchestratorRef.current.getActionQueue();
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    const cleanup = initialize();
    return () => {
      if (cleanup) cleanup();
      if (orchestratorRef.current) {
        orchestratorRef.current.destroy();
        orchestratorRef.current = null;
      }
    };
  }, [initialize]);

  return {
    // 状态
    isExecuting,
    isPaused,
    currentAction,
    actionProgress,
    queueLength,
    loopInfo,
    error,
    
    // 方法
    executeScenario,
    executeCustomSequence,
    addAction,
    addActions,
    executeQueue,
    controls,
    getStatus,
    getActionQueue,
    
    // 便捷属性
    canExecute: !isExecuting && queueLength > 0,
    canPause: isExecuting && !isPaused,
    canResume: isExecuting && isPaused,
    canStop: isExecuting,
    progress: actionProgress,
    isInLoop: loopInfo.max > 0
  };
} 