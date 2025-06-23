import { useState, useEffect, useRef, useCallback } from 'react';
import ConfigurableActionEngine from '../services/core/ConfigurableActionEngine.js';
import ActionConfigLibrary from '../services/config/ActionConfigLibrary.js';

export function useConfigurableActionEngine(tailgateService) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(null);
  const [error, setError] = useState(null);
  const [executionLog, setExecutionLog] = useState([]);
  
  const engineRef = useRef(null);
  const configLibraryRef = useRef(null);
  const unsubscribeRefs = useRef([]);

  // 初始化引擎
  const initialize = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.destroy();
    }

    const engine = new ConfigurableActionEngine();
    const configLibrary = new ActionConfigLibrary();
    
    // 设置依赖服务
    if (tailgateService) {
      engine.actionExecutor.setServices(engine.eventService, tailgateService);
    }
    
    // 订阅引擎事件
    const unsubscribes = [];

    unsubscribes.push(
      engine.on('config:executionStarted', ({ config, context }) => {
        setIsExecuting(true);
        setCurrentConfig(config);
        setExecutionProgress(0);
        setCurrentStep(null);
        setError(null);
        setExecutionLog([]);
        
        console.log('useConfigurableActionEngine: 配置执行开始', config.name);
      })
    );

    unsubscribes.push(
      engine.on('config:stepStarted', ({ step, index, total }) => {
        setCurrentStep({ step, index, total });
        setExecutionProgress((index / total) * 100);
        
        setExecutionLog(prev => [...prev, {
          type: 'step_started',
          step: step,
          index: index,
          total: total,
          timestamp: Date.now()
        }]);
      })
    );

    unsubscribes.push(
      engine.on('config:stepCompleted', ({ step, index }) => {
        setExecutionProgress(((index + 1) / (currentStep?.total || 1)) * 100);
        
        setExecutionLog(prev => [...prev, {
          type: 'step_completed',
          step: step,
          index: index,
          timestamp: Date.now()
        }]);
      })
    );

    unsubscribes.push(
      engine.on('config:executionCompleted', ({ config, result, context }) => {
        setIsExecuting(false);
        setCurrentConfig(null);
        setExecutionProgress(100);
        setCurrentStep(null);
        
        setExecutionLog(prev => [...prev, {
          type: 'execution_completed',
          config: config,
          result: result,
          timestamp: Date.now()
        }]);
        
        console.log('useConfigurableActionEngine: 配置执行完成', config.name);
      })
    );

    unsubscribes.push(
      engine.on('config:executionError', ({ config, error, context }) => {
        setIsExecuting(false);
        setCurrentConfig(null);
        setError(error);
        
        setExecutionLog(prev => [...prev, {
          type: 'execution_error',
          config: config,
          error: error,
          timestamp: Date.now()
        }]);
        
        console.error('useConfigurableActionEngine: 配置执行错误', error);
      })
    );

    unsubscribes.push(
      engine.on('config:preconditionFailed', ({ failedCondition, error, actualValue, expectedValue }) => {
        setError(`前置条件失败: ${error}`);
        
        setExecutionLog(prev => [...prev, {
          type: 'precondition_failed',
          failedCondition: failedCondition,
          error: error,
          actualValue: actualValue,
          expectedValue: expectedValue,
          timestamp: Date.now()
        }]);
      })
    );

    unsubscribes.push(
      engine.on('monitor:triggered', ({ monitor, result, timestamp }) => {
        setExecutionLog(prev => [...prev, {
          type: 'monitor_triggered',
          monitor: monitor,
          result: result,
          timestamp: timestamp
        }]);
        
        console.log('useConfigurableActionEngine: 监控触发', monitor.id);
      })
    );

    // 保存引用
    engineRef.current = engine;
    configLibraryRef.current = configLibrary;
    unsubscribeRefs.current = unsubscribes;

    return () => {
      unsubscribes.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [tailgateService]);

  // 执行配置
  const executeConfig = useCallback(async (config, context = {}) => {
    if (!engineRef.current) {
      setError('引擎未初始化');
      return false;
    }

    try {
      console.log('useConfigurableActionEngine: 执行配置', config.id);
      const result = await engineRef.current.executeConfig(config, context);
      return result;
    } catch (error) {
      setError(error.message);
      return false;
    }
  }, []);

  // 执行配置ID
  const executeConfigById = useCallback(async (configId, context = {}) => {
    if (!configLibraryRef.current) {
      setError('配置库未初始化');
      return false;
    }

    const config = configLibraryRef.current.getConfig(configId);
    if (!config) {
      setError(`配置不存在: ${configId}`);
      return false;
    }

    return await executeConfig(config, context);
  }, [executeConfig]);

  // 停止执行
  const stopExecution = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
  }, []);

  // 暂停执行
  const pauseExecution = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pause();
    }
  }, []);

  // 恢复执行
  const resumeExecution = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resume();
    }
  }, []);

  // 获取配置
  const getConfig = useCallback((configId) => {
    return configLibraryRef.current?.getConfig(configId);
  }, []);

  // 获取所有配置
  const getAllConfigs = useCallback(() => {
    return configLibraryRef.current?.getAllConfigs() || [];
  }, []);

  // 获取分类配置
  const getConfigsByCategory = useCallback((category) => {
    return configLibraryRef.current?.getConfigsByCategory(category) || [];
  }, []);

  // 获取所有分类
  const getCategories = useCallback(() => {
    return configLibraryRef.current?.getCategories() || [];
  }, []);

  // 添加配置
  const addConfig = useCallback((config) => {
    try {
      configLibraryRef.current?.addConfig(config);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // 更新配置
  const updateConfig = useCallback((configId, updates) => {
    try {
      const updatedConfig = configLibraryRef.current?.updateConfig(configId, updates);
      return { success: true, config: updatedConfig };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // 删除配置
  const removeConfig = useCallback((configId) => {
    const success = configLibraryRef.current?.removeConfig(configId);
    return { success };
  }, []);

  // 导出配置
  const exportConfig = useCallback((configId) => {
    try {
      const configJson = configLibraryRef.current?.exportConfig(configId);
      return { success: true, configJson };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // 导入配置
  const importConfig = useCallback((configJson) => {
    return configLibraryRef.current?.importConfig(configJson) || { success: false, error: '配置库未初始化' };
  }, []);

  // 搜索配置
  const searchConfigs = useCallback((query) => {
    return configLibraryRef.current?.searchConfigs(query) || [];
  }, []);

  // 获取执行状态
  const getExecutionStatus = useCallback(() => {
    return engineRef.current?.getStatus();
  }, []);

  // 获取配置统计
  const getConfigStats = useCallback(() => {
    return configLibraryRef.current?.getStats();
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 清除执行日志
  const clearExecutionLog = useCallback(() => {
    setExecutionLog([]);
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    const cleanup = initialize();
    return () => {
      if (cleanup) cleanup();
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [initialize]);

  return {
    // 状态
    isExecuting,
    currentConfig,
    executionProgress,
    currentStep,
    error,
    executionLog,
    
    // 执行方法
    executeConfig,
    executeConfigById,
    stopExecution,
    pauseExecution,
    resumeExecution,
    
    // 配置管理方法
    getConfig,
    getAllConfigs,
    getConfigsByCategory,
    getCategories,
    addConfig,
    updateConfig,
    removeConfig,
    exportConfig,
    importConfig,
    searchConfigs,
    
    // 状态查询方法
    getExecutionStatus,
    getConfigStats,
    
    // 工具方法
    clearError,
    clearExecutionLog,
    
    // 便捷属性
    canExecute: !isExecuting,
    canStop: isExecuting,
    canPause: isExecuting,
    canResume: false, // 暂时不支持恢复
    progress: executionProgress,
    hasError: !!error,
    logCount: executionLog.length
  };
} 