/**
 * 通用工具函数
 */

/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @param {string} format 格式字符串，如 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return format
    .replace('YYYY', year)
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('HH', hour.toString().padStart(2, '0'))
    .replace('mm', minute.toString().padStart(2, '0'))
    .replace('ss', second.toString().padStart(2, '0'));
}

/**
 * 获取今天的日期字符串
 * @returns {string} YYYY-MM-DD 格式的日期
 */
function getToday() {
  return formatTime(new Date(), 'YYYY-MM-DD');
}

/**
 * 获取本周的开始和结束日期
 * @returns {object} {start: string, end: string}
 */
function getThisWeek() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return {
    start: formatTime(start, 'YYYY-MM-DD'),
    end: formatTime(end, 'YYYY-MM-DD')
  };
}

/**
 * 计算两个日期之间的天数差
 * @param {string} date1 日期1 (YYYY-MM-DD)
 * @param {string} date2 日期2 (YYYY-MM-DD)
 * @returns {number} 天数差
 */
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} wait 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} limit 时间间隔（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 深拷贝对象
 * @param {any} obj 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
function deepClone(obj) {
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
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 生成随机ID
 * @param {number} length ID长度
 * @returns {string} 随机ID
 */
function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 数组去重
 * @param {Array} arr 要去重的数组
 * @param {string} key 去重的键名（对象数组时使用）
 * @returns {Array} 去重后的数组
 */
function uniqueArray(arr, key) {
  if (!key) {
    return [...new Set(arr)];
  }
  
  const seen = new Set();
  return arr.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * 数字格式化
 * @param {number} num 数字
 * @param {number} decimals 小数位数
 * @returns {string} 格式化后的数字
 */
function formatNumber(num, decimals = 0) {
  if (isNaN(num)) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  
  return num.toFixed(decimals);
}

/**
 * 计算百分比
 * @param {number} current 当前值
 * @param {number} total 总值
 * @param {number} decimals 小数位数
 * @returns {number} 百分比
 */
function calculatePercentage(current, total, decimals = 0) {
  if (total === 0) return 0;
  return Number(((current / total) * 100).toFixed(decimals));
}

/**
 * 验证手机号
 * @param {string} phone 手机号
 * @returns {boolean} 是否有效
 */
function validatePhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证邮箱
 * @param {string} email 邮箱
 * @returns {boolean} 是否有效
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 获取文件扩展名
 * @param {string} filename 文件名
 * @returns {string} 扩展名
 */
function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * 字节转换为可读格式
 * @param {number} bytes 字节数
 * @param {number} decimals 小数位数
 * @returns {string} 可读格式
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 获取URL参数
 * @param {string} url URL字符串
 * @returns {object} 参数对象
 */
function getUrlParams(url) {
  const params = {};
  const urlObj = new URL(url);
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

module.exports = {
  formatTime,
  getToday,
  getThisWeek,
  daysBetween,
  debounce,
  throttle,
  deepClone,
  generateId,
  uniqueArray,
  formatNumber,
  calculatePercentage,
  validatePhone,
  validateEmail,
  getFileExtension,
  formatBytes,
  getUrlParams
};