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
  const [showDetails, setShowDetails] = useState(false);

  const scenarioCategories = getScenariosByCategory();
  const allScenarios = getScenarioList();

  const handleScenarioSelect = (scenarioId) => {
    setSelectedScenario(scenarioId);
    setShowDetails(true);
  };

  const handleExecuteScenario = () => {
    if (selectedScenario) {
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
        <h3 className="section-title">场景控制</h3>
        
        {/* 场景分类选择 */}
        <div className="control-group">
          <label className="control-label">场景分类</label>
          <div className="category-selector">
            {Object.keys(scenarioCategories).map(categoryKey => (
              <button
                key={categoryKey}
                onClick={() => setSelectedCategory(categoryKey)}
                className={`category-btn ${selectedCategory === categoryKey ? 'active' : ''}`}
              >
                {scenarioCategories[categoryKey].name}
              </button>
            ))}
          </div>
        </div>

        {/* 场景选择 */}
        <div className="control-group">
          <label className="control-label">选择场景</label>
          <div className="scenario-list">
            {scenarioCategories[selectedCategory]?.scenarios.map(scenario => (
              <div
                key={scenario.id}
                className={`scenario-item ${selectedScenario === scenario.id ? 'selected' : ''}`}
                onClick={() => handleScenarioSelect(scenario.id)}
              >
                <div className="scenario-header">
                  <span className="scenario-name">{scenario.name}</span>
                  <span className="scenario-action-count">
                    {scenario.sequence.length} 个动作
                  </span>
                </div>
                <div className="scenario-description">
                  {scenario.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 场景详情 */}
        {showDetails && selectedScenarioDetails && (
          <div className="control-group">
            <label className="control-label">场景详情</label>
            <div className="scenario-details">
              <div className="detail-item">
                <span className="detail-label">名称:</span>
                <span className="detail-value">{selectedScenarioDetails.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">描述:</span>
                <span className="detail-value">{selectedScenarioDetails.description}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">动作数量:</span>
                <span className="detail-value">{selectedScenarioDetails.sequence.length}</span>
              </div>
              {selectedScenarioDetails.loop && (
                <div className="detail-item">
                  <span className="detail-label">循环次数:</span>
                  <span className="detail-value">{selectedScenarioDetails.maxLoops || '无限'}</span>
                </div>
              )}
              
              <div className="action-sequence">
                <span className="detail-label">动作序列:</span>
                <div className="sequence-list">
                  {selectedScenarioDetails.sequence.map((action, index) => (
                    <div key={index} className="sequence-item">
                      <span className="sequence-index">{index + 1}.</span>
                      <span className="sequence-action">
                        {action.action ? `${action.action}${action.params ? ` (${JSON.stringify(action.params)})` : ''}` : 
                         action.wait ? `等待 ${action.wait.value}ms` : '未知动作'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 执行控制 */}
      <div className="control-section">
        <h3 className="section-title">执行控制</h3>
        
        <div className="execution-controls">
          <button
            onClick={handleExecuteScenario}
            disabled={isExecuting || !selectedScenario}
            className="control-btn primary large"
          >
            <span className="btn-icon">▶️</span>
            执行场景
          </button>
          
          <div className="control-buttons">
            <button
              onClick={onPause}
              disabled={!isExecuting || isPaused}
              className="control-btn warning"
            >
              <span className="btn-icon">⏸️</span>
              暂停
            </button>
            
            <button
              onClick={onResume}
              disabled={!isExecuting || !isPaused}
              className="control-btn success"
            >
              <span className="btn-icon">▶️</span>
              恢复
            </button>
            
            <button
              onClick={onStop}
              disabled={!isExecuting}
              className="control-btn secondary"
            >
              <span className="btn-icon">⏹️</span>
              停止
            </button>
            
            <button
              onClick={onClear}
              className="control-btn reset"
            >
              <span className="btn-icon">🗑️</span>
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