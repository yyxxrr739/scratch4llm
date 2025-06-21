import React, { useState } from 'react';
import { getScenariosByCategory, getScenarioList } from '../../services/orchestrator/scenarios/TailgateScenarios.js';
import './ActionControls.css';

const ScenarioControls = ({
  isExecuting,
  isPaused,
  currentAction,
  actionProgress,
  loopInfo,
  onExecuteScenario,
  onPause,
  onResume,
  onStop,
  onClear
}) => {
  const [selectedCategory, setSelectedCategory] = useState('basic');
  const [selectedScenario, setSelectedScenario] = useState('');

  const scenarioCategories = getScenariosByCategory();
  const allScenarios = getScenarioList();

  const handleCategoryChange = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setSelectedScenario(''); // 重置场景选择
  };

  const handleScenarioChange = (scenarioId) => {
    setSelectedScenario(scenarioId);
  };

  const handleExecuteScenario = () => {
    if (selectedScenario) {
      onExecuteScenario(selectedScenario);
    }
  };

  const handleRunResume = () => {
    if (isExecuting && isPaused) {
      // 如果正在执行且已暂停，则恢复
      onResume();
    } else if (selectedScenario) {
      // 否则执行场景
      onExecuteScenario(selectedScenario);
    }
  };

  const getSelectedScenarioDetails = () => {
    return allScenarios.find(s => s.id === selectedScenario);
  };

  const selectedScenarioDetails = getSelectedScenarioDetails();

  return (
    <div className="scenario-controls">
      <div className="control-section">
        {/* 第一行：场景分类和选择场景 */}
        <div className="scenario-header-row">
          {/* 场景分类选择 */}
          <div className="control-group">
            <label className="control-label">场景分类</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="scenario-select"
            >
              {Object.keys(scenarioCategories).map(categoryKey => (
                <option key={categoryKey} value={categoryKey}>
                  {scenarioCategories[categoryKey].name}
                </option>
              ))}
            </select>
          </div>

          {/* 场景选择 */}
          <div className="control-group">
            <label className="control-label">选择场景</label>
            <select 
              value={selectedScenario} 
              onChange={(e) => handleScenarioChange(e.target.value)}
              className="scenario-select"
            >
              <option value="">请选择场景</option>
              {scenarioCategories[selectedCategory]?.scenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name} ({scenario.sequence.length} 个动作)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 动作序列 */}
        {selectedScenarioDetails && (
          <div className="control-group">
            <label className="control-label">动作序列</label>
            <div className="sequence-list compact">
              {selectedScenarioDetails.sequence.map((action, index) => (
                <div key={index} className="sequence-item compact">
                  <span className="sequence-index compact">{index + 1}.</span>
                  <span className="sequence-action compact">
                    {action.action ? `${action.action}${action.params ? ` (${JSON.stringify(action.params)})` : ''}` : 
                     action.wait ? `等待 ${action.wait.value}ms` : '未知动作'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 执行控制 */}
      <div className="control-section">
        <div className="execution-controls">
          <div className="control-buttons">
            <button
              onClick={handleRunResume}
              disabled={!selectedScenario}
              className="control-btn primary small"
            >
              {isExecuting && isPaused ? '恢复' : '运行'}
            </button>
            
            <button
              onClick={onPause}
              disabled={!isExecuting || isPaused}
              className="control-btn warning small"
            >
              暂停
            </button>
            
            <button
              onClick={onStop}
              disabled={!isExecuting}
              className="control-btn secondary small"
            >
              停止
            </button>
            
            <button
              onClick={onClear}
              className="control-btn reset small"
            >
              清空
            </button>
          </div>
        </div>
      </div>

      {/* 执行状态 */}
      {isExecuting && (
        <div className="status-section">
          <h3 className="section-title">执行状态</h3>
          
          <div className="execution-status">
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${actionProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">{Math.round(actionProgress)}%</span>
            </div>
            
            <div className="status-display">
              <div className="status-item">
                <span className="status-label">当前动作:</span>
                <span className="status-value">
                  {currentAction ? 
                    `${currentAction.action}${currentAction.params ? ` (${JSON.stringify(currentAction.params)})` : ''}` : 
                    '无'
                  }
                </span>
              </div>
              
              {loopInfo.max > 0 && (
                <div className="status-item">
                  <span className="status-label">循环进度:</span>
                  <span className="status-value">
                    {loopInfo.current} / {loopInfo.max}
                  </span>
                </div>
              )}
              
              <div className="status-item">
                <span className="status-label">执行状态:</span>
                <span className={`status-indicator ${isPaused ? 'paused' : 'executing'}`}>
                  <span className="status-dot"></span>
                  {isPaused ? '已暂停' : '执行中'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioControls; 