// 状态工具函数

/**
 * 深度克隆对象
 * @param {any} obj 要克隆的对象
 * @returns {any} 克隆后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
}

/**
 * 合并对象（深度合并）
 * @param {object} target 目标对象
 * @param {...object} sources 源对象
 * @returns {object} 合并后的对象
 */
export function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  
  const source = sources.shift();
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

/**
 * 检查是否为对象
 * @param {any} item 要检查的项目
 * @returns {boolean} 是否为对象
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 获取对象的嵌套属性值
 * @param {object} obj 对象
 * @param {string} path 属性路径（用点分隔）
 * @param {any} defaultValue 默认值
 * @returns {any} 属性值
 */
export function getNestedValue(obj, path, defaultValue = undefined) {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }
  
  return result;
}

/**
 * 设置对象的嵌套属性值
 * @param {object} obj 对象
 * @param {string} path 属性路径（用点分隔）
 * @param {any} value 要设置的值
 * @returns {object} 更新后的对象
 */
export function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const result = deepClone(obj);
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || !isObject(current[key])) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
}

/**
 * 验证状态对象
 * @param {object} state 状态对象
 * @param {object} schema 验证模式
 * @returns {object} 验证结果
 */
export function validateState(state, schema) {
  const errors = [];
  const warnings = [];
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = state[key];
    
    // 检查必需字段
    if (rules.required && (value === undefined || value === null)) {
      errors.push(`字段 '${key}' 是必需的`);
      continue;
    }
    
    // 检查类型
    if (rules.type && value !== undefined && value !== null) {
      if (typeof value !== rules.type) {
        errors.push(`字段 '${key}' 必须是 ${rules.type} 类型`);
      }
    }
    
    // 检查范围
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`字段 '${key}' 不能小于 ${rules.min}`);
    }
    
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`字段 '${key}' 不能大于 ${rules.max}`);
    }
    
    // 检查枚举值
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`字段 '${key}' 必须是以下值之一: ${rules.enum.join(', ')}`);
    }
    
    // 检查自定义验证函数
    if (rules.validate && typeof rules.validate === 'function') {
      const validationResult = rules.validate(value, state);
      if (validationResult !== true) {
        if (typeof validationResult === 'string') {
          errors.push(validationResult);
        } else if (validationResult.error) {
          errors.push(validationResult.error);
        } else if (validationResult.warning) {
          warnings.push(validationResult.warning);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 创建状态验证模式
 * @param {object} schema 验证模式定义
 * @returns {object} 验证模式对象
 */
export function createStateSchema(schema) {
  return schema;
}

/**
 * 状态比较器
 * @param {object} oldState 旧状态
 * @param {object} newState 新状态
 * @returns {object} 比较结果
 */
export function compareStates(oldState, newState) {
  const changes = {
    added: {},
    modified: {},
    removed: {},
    unchanged: {}
  };
  
  const allKeys = new Set([
    ...Object.keys(oldState || {}),
    ...Object.keys(newState || {})
  ]);
  
  for (const key of allKeys) {
    const oldValue = oldState?.[key];
    const newValue = newState?.[key];
    
    if (!(key in (oldState || {}))) {
      changes.added[key] = newValue;
    } else if (!(key in (newState || {}))) {
      changes.removed[key] = oldValue;
    } else if (oldValue !== newValue) {
      changes.modified[key] = {
        old: oldValue,
        new: newValue
      };
    } else {
      changes.unchanged[key] = oldValue;
    }
  }
  
  return changes;
}

/**
 * 创建状态快照
 * @param {object} state 当前状态
 * @param {string} description 快照描述
 * @returns {object} 状态快照
 */
export function createStateSnapshot(state, description = '') {
  return {
    timestamp: Date.now(),
    description,
    state: deepClone(state),
    id: generateSnapshotId()
  };
}

/**
 * 生成快照ID
 * @returns {string} 快照ID
 */
function generateSnapshotId() {
  return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 状态历史管理器
 */
export class StateHistoryManager {
  constructor(maxHistory = 50) {
    this.history = [];
    this.maxHistory = maxHistory;
    this.currentIndex = -1;
  }
  
  /**
   * 添加状态到历史
   * @param {object} state 状态
   * @param {string} description 描述
   */
  addState(state, description = '') {
    // 移除当前位置之后的历史记录
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // 添加新状态
    this.history.push(createStateSnapshot(state, description));
    
    // 限制历史记录数量
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }
  
  /**
   * 撤销
   * @returns {object|null} 上一个状态
   */
  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }
  
  /**
   * 重做
   * @returns {object|null} 下一个状态
   */
  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }
  
  /**
   * 获取当前状态
   * @returns {object|null} 当前状态
   */
  getCurrentState() {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }
  
  /**
   * 清空历史
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
  
  /**
   * 获取历史信息
   * @returns {object} 历史信息
   */
  getHistoryInfo() {
    return {
      total: this.history.length,
      current: this.currentIndex + 1,
      canUndo: this.currentIndex > 0,
      canRedo: this.currentIndex < this.history.length - 1
    };
  }
}

/**
 * 状态观察器
 */
export class StateObserver {
  constructor() {
    this.subscribers = new Map();
    this.state = {};
  }
  
  /**
   * 订阅状态变化
   * @param {string} key 状态键
   * @param {function} callback 回调函数
   * @returns {function} 取消订阅函数
   */
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key).add(callback);
    
    return () => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }
  
  /**
   * 更新状态
   * @param {string} key 状态键
   * @param {any} value 新值
   */
  update(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    
    // 通知订阅者
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(value, oldValue, this.state);
        } catch (error) {
          // 状态观察器回调错误处理
        }
      });
    }
  }
  
  /**
   * 获取状态
   * @param {string} key 状态键
   * @returns {any} 状态值
   */
  get(key) {
    return this.state[key];
  }
  
  /**
   * 获取所有状态
   * @returns {object} 所有状态
   */
  getAll() {
    return { ...this.state };
  }
} 