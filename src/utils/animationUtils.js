// 动画工具函数

/**
 * 计算两点之间的角度
 * @param {number} x1 第一个点的x坐标
 * @param {number} y1 第一个点的y坐标
 * @param {number} x2 第二个点的x坐标
 * @param {number} y2 第二个点的y坐标
 * @returns {number} 角度（度）
 */
export function calculateAngle(x1, y1, x2, y2) {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  return angle;
}

/**
 * 将角度标准化到0-360度范围
 * @param {number} angle 输入角度
 * @returns {number} 标准化后的角度
 */
export function normalizeAngle(angle) {
  let normalized = angle % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

/**
 * 计算两个角度之间的最短距离
 * @param {number} angle1 第一个角度
 * @param {number} angle2 第二个角度
 * @returns {number} 角度差
 */
export function angleDifference(angle1, angle2) {
  const diff = Math.abs(angle1 - angle2);
  return Math.min(diff, 360 - diff);
}

/**
 * 线性插值
 * @param {number} start 起始值
 * @param {number} end 结束值
 * @param {number} t 插值因子 (0-1)
 * @returns {number} 插值结果
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * 角度插值
 * @param {number} startAngle 起始角度
 * @param {number} endAngle 结束角度
 * @param {number} t 插值因子 (0-1)
 * @returns {number} 插值后的角度
 */
export function angleLerp(startAngle, endAngle, t) {
  const diff = endAngle - startAngle;
  const shortest = Math.abs(diff) > 180 ? 
    (diff > 0 ? diff - 360 : diff + 360) : diff;
  return startAngle + shortest * t;
}

/**
 * 缓动函数
 */
export const easing = {
  // 线性
  linear: (t) => t,
  
  // 二次缓动
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  // 三次缓动
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  // 弹性缓动
  easeOutElastic: (t) => {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  },
  
  // 弹跳缓动
  easeOutBounce: (t) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }
};

/**
 * 应用缓动函数
 * @param {number} start 起始值
 * @param {number} end 结束值
 * @param {number} t 时间因子 (0-1)
 * @param {function} easingFn 缓动函数
 * @returns {number} 应用缓动后的值
 */
export function applyEasing(start, end, t, easingFn = easing.linear) {
  const easedT = easingFn(t);
  return lerp(start, end, easedT);
}

/**
 * 计算动画持续时间
 * @param {number} distance 距离
 * @param {number} speed 速度
 * @param {number} baseDuration 基础持续时间
 * @returns {number} 计算后的持续时间
 */
export function calculateDuration(distance, speed = 1, baseDuration = 2) {
  return baseDuration / speed;
}

/**
 * 从DOM元素获取变换矩阵
 * @param {HTMLElement} element DOM元素
 * @returns {DOMMatrix} 变换矩阵
 */
export function getTransformMatrix(element) {
  const transform = window.getComputedStyle(element).transform;
  return new DOMMatrix(transform);
}

/**
 * 从变换矩阵提取旋转角度
 * @param {DOMMatrix} matrix 变换矩阵
 * @returns {number} 旋转角度（度）
 */
export function extractRotationAngle(matrix) {
  return Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
}

/**
 * 从变换矩阵提取缩放值
 * @param {DOMMatrix} matrix 变换矩阵
 * @returns {object} 包含x和y缩放值的对象
 */
export function extractScale(matrix) {
  const scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
  const scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
  return { x: scaleX, y: scaleY };
}

/**
 * 从变换矩阵提取位移值
 * @param {DOMMatrix} matrix 变换矩阵
 * @returns {object} 包含x和y位移值的对象
 */
export function extractTranslation(matrix) {
  return { x: matrix.e, y: matrix.f };
}

/**
 * 创建变换字符串
 * @param {object} transforms 变换对象
 * @returns {string} 变换字符串
 */
export function createTransformString(transforms) {
  const parts = [];
  
  if (transforms.translate) {
    parts.push(`translate(${transforms.translate.x}px, ${transforms.translate.y}px)`);
  }
  
  if (transforms.rotate) {
    parts.push(`rotate(${transforms.rotate}deg)`);
  }
  
  if (transforms.scale) {
    if (typeof transforms.scale === 'number') {
      parts.push(`scale(${transforms.scale})`);
    } else {
      parts.push(`scale(${transforms.scale.x}, ${transforms.scale.y})`);
    }
  }
  
  return parts.join(' ');
}

/**
 * 限制值在指定范围内
 * @param {number} value 输入值
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {number} 限制后的值
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * 将值映射到新范围
 * @param {number} value 输入值
 * @param {number} inMin 输入范围最小值
 * @param {number} inMax 输入范围最大值
 * @param {number} outMin 输出范围最小值
 * @param {number} outMax 输出范围最大值
 * @returns {number} 映射后的值
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * 格式化角度显示
 * @param {number} angle 角度值
 * @param {number} decimals 小数位数
 * @returns {string} 格式化后的角度字符串
 */
export function formatAngle(angle, decimals = 1) {
  return `${angle.toFixed(decimals)}°`;
}

/**
 * 格式化速度显示
 * @param {number} speed 速度值
 * @param {number} decimals 小数位数
 * @returns {string} 格式化后的速度字符串
 */
export function formatSpeed(speed, decimals = 1) {
  return `${speed.toFixed(decimals)}x`;
}

/**
 * 格式化时间显示
 * @param {number} milliseconds 毫秒数
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(milliseconds) {
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`;
  } else {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  }
} 