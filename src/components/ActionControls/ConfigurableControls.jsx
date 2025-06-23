import React, { useState, useEffect } from 'react';
import { useConfigurableActionEngine } from '../../hooks/useConfigurableActionEngine.js';
import { useTailgateService } from '../../hooks/useTailgateService.js';
import './ActionControls.css';

const ConfigurableControls = () => {
  const [selectedCategory, setSelectedCategory] = useState('basic');
  const [selectedConfig, setSelectedConfig] = useState('');
  const [showConfigDetails, setShowConfigDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 使用尾门服务
  const tailgateService = useTailgateService();
  
  // 使用配置驱动引擎
  const {
    isExecuting,
    currentConfig,
    executionProgress,
    currentStep,
    error,
    executionLog,
    canExecute,
    canStop,
    progress,
    hasError,
    
    // 方法
    executeConfigById,
    stopExecution,
    getAllConfigs,
    getConfigsByCategory,
    getCategories,
    getConfig,
    searchConfigs,
    clearError,
    clearExecutionLog
  } = useConfigurableActionEngine(tailgateService.actionServiceRef?.current);

  const categories = getCategories();
  const configs = getConfigsByCategory(selectedCategory);
  const selectedConfigData = selectedConfig ? getConfig(selectedConfig) : null;
  const searchResults = searchQuery ? searchConfigs(searchQuery) : [];

  const handleCategoryChange = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setSelectedConfig('');
    setShowConfigDetails(false);
  };

  const handleConfigSelect = (configId) => {
    setSelectedConfig(configId);
    setShowConfigDetails(true);
  };

  const handleExecuteConfig = async () => {
    if (selectedConfig) {
      await executeConfigById(selectedConfig);
    }
  };

  const handleStopExecution = () => {
    stopExecution();
  };

  const handleClearError = () => {
    clearError();
  };

  const handleClearLog = () => {
    clearExecutionLog();
  };

  const renderStepInfo = (step) => {
    if (!step) return null;
    
    const { step: stepData, index, total } = step;
    
    return (
      <div className="step-info">
        <div className="step-header">
          <span className="step-index">步骤 {index + 1} / {total}</span>
          <span className="step-type">{stepData.type}</span>
        </div>
        <div className="step-details">
          {stepData.type === 'action' && (
            <div>
              <strong>动作:</strong> {stepData.action}
              {stepData.params && (
                <div className="step-params">
                  <strong>参数:</strong> {JSON.stringify(stepData.params)}
                </div>
              )}
            </div>
          )}
          {stepData.type === 'wait' && (
            <div>
              <strong>等待:</strong> {stepData.duration ? `${stepData.duration}ms` : '条件满足'}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderConfigDetails = (config) => {
    if (!config) return null;

    return (
      <div className="config-details">
        <div className="config-header">
          <h3>{config.name}</h3>
          <span className="config-category">{config.category}</span>
        </div>
        <p className="config-description">{config.description}</p>
        
        {/* 前置条件 */}
        {config.preconditions && config.preconditions.length > 0 && (
          <div className="config-section">
            <h4>前置条件</h4>
            <div className="condition-list">
              {config.preconditions.map((condition, index) => (
                <div key={index} className="condition-item">
                  <span className="condition-id">{condition.id}</span>
                  <span className="condition-type">{condition.type}</span>
                  <span className="condition-operator">{condition.operator}</span>
                  <span className="condition-value">{condition.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 执行步骤 */}
        <div className="config-section">
          <h4>执行步骤 ({config.steps.length})</h4>
          <div className="step-list">
            {config.steps.map((step, index) => (
              <div key={index} className="step-item">
                <span className="step-number">{index + 1}.</span>
                <span className="step-type">{step.type}</span>
                {step.type === 'action' && (
                  <span className="step-action">{step.action}</span>
                )}
                {step.params && (
                  <span className="step-params">{JSON.stringify(step.params)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* 监控条件 */}
        {config.monitors && config.monitors.length > 0 && (
          <div className="config-section">
            <h4>监控条件</h4>
            <div className="monitor-list">
              {config.monitors.map((monitor, index) => (
                <div key={index} className="monitor-item">
                  <span className="monitor-id">{monitor.id}</span>
                  <span className="monitor-type">{monitor.type}</span>
                  <span className="monitor-operator">{monitor.operator}</span>
                  <span className="monitor-value">{monitor.value}</span>
                  <span className="monitor-trigger">→ {monitor.onTrigger}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExecutionLog = () => {
    if (executionLog.length === 0) return null;

    return (
      <div className="execution-log">
        <div className="log-header">
          <h4>执行日志 ({executionLog.length})</h4>
          <button onClick={handleClearLog} className="clear-btn">清空</button>
        </div>
        <div className="log-content">
          {executionLog.slice(-10).map((log, index) => (
            <div key={index} className={`log-item log-${log.type}`}>
              <span className="log-time">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="log-type">{log.type}</span>
              {log.step && (
                <span className="log-step">
                  {log.step.type === 'action' ? log.step.action : log.step.type}
                </span>
              )}
              {log.error && (
                <span className="log-error">{log.error}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="configurable-controls">
      {/* 搜索栏 */}
      <div className="search-section">
        <input
          type="text"
          placeholder="搜索配置..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(config => (
              <div
                key={config.id}
                className="search-result-item"
                onClick={() => {
                  setSelectedConfig(config.id);
                  setShowConfigDetails(true);
                  setSearchQuery('');
                }}
              >
                <span className="result-name">{config.name}</span>
                <span className="result-category">{config.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 分类和配置选择 */}
      <div className="selection-section">
        <div className="category-selector">
          <label>配置分类:</label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category.name} value={category.name}>
                {category.name} ({category.configs?.length || 0})
              </option>
            ))}
          </select>
        </div>

        <div className="config-selector">
          <label>选择配置:</label>
          <select
            value={selectedConfig}
            onChange={(e) => handleConfigSelect(e.target.value)}
            className="config-select"
          >
            <option value="">请选择配置</option>
            {configs.map(config => (
              <option key={config.id} value={config.id}>
                {config.name} ({config.steps.length} 步骤)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 配置详情 */}
      {showConfigDetails && selectedConfigData && (
        <div className="config-details-section">
          {renderConfigDetails(selectedConfigData)}
        </div>
      )}

      {/* 执行控制 */}
      <div className="execution-controls">
        <div className="control-buttons">
          <button
            onClick={handleExecuteConfig}
            disabled={!canExecute || !selectedConfig}
            className="control-btn primary"
          >
            {isExecuting ? '执行中...' : '执行配置'}
          </button>
          
          {canStop && (
            <button
              onClick={handleStopExecution}
              className="control-btn stop"
            >
              停止执行
            </button>
          )}
        </div>

        {/* 执行进度 */}
        {isExecuting && (
          <div className="execution-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        )}

        {/* 当前步骤 */}
        {currentStep && (
          <div className="current-step">
            {renderStepInfo(currentStep)}
          </div>
        )}

        {/* 错误信息 */}
        {hasError && (
          <div className="error-message">
            <span className="error-text">{error}</span>
            <button onClick={handleClearError} className="error-clear">×</button>
          </div>
        )}
      </div>

      {/* 执行日志 */}
      {renderExecutionLog()}
    </div>
  );
};

export default ConfigurableControls; 