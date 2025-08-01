/**
 * 网络请求工具
 */

// 基础配置
const config = {
  baseURL: 'https://api.healthyparaflow.com', // 替换为实际的API地址
  timeout: 10000,
  header: {
    'Content-Type': 'application/json'
  }
};

/**
 * 请求拦截器
 * @param {object} options 请求选项
 * @returns {object} 处理后的请求选项
 */
function requestInterceptor(options) {
  // 添加基础URL
  if (!options.url.startsWith('http')) {
    options.url = config.baseURL + options.url;
  }
  
  // 添加默认header
  options.header = {
    ...config.header,
    ...options.header
  };
  
  // 添加token
  const token = wx.getStorageSync('token');
  if (token) {
    options.header.Authorization = `Bearer ${token}`;
  }
  
  // 添加用户ID
  const userInfo = wx.getStorageSync('userInfo');
  if (userInfo && userInfo.id) {
    options.header['X-User-ID'] = userInfo.id;
  }
  
  // 设置超时时间
  options.timeout = options.timeout || config.timeout;
  
  console.log('请求发送:', options);
  return options;
}

/**
 * 响应拦截器
 * @param {object} response 响应对象
 * @returns {Promise} 处理后的响应
 */
function responseInterceptor(response) {
  console.log('响应接收:', response);
  
  const { statusCode, data } = response;
  
  // HTTP状态码检查
  if (statusCode >= 200 && statusCode < 300) {
    // 业务状态码检查
    if (data.code === 0 || data.success) {
      return Promise.resolve(data.data || data);
    } else {
      // 业务错误
      const error = new Error(data.message || '请求失败');
      error.code = data.code;
      error.data = data;
      return Promise.reject(error);
    }
  } else {
    // HTTP错误
    let message = '网络请求失败';
    
    switch (statusCode) {
      case 401:
        message = '未授权，请重新登录';
        // 清除token并跳转到登录页
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo');
        break;
      case 403:
        message = '拒绝访问';
        break;
      case 404:
        message = '请求的资源不存在';
        break;
      case 500:
        message = '服务器内部错误';
        break;
      case 502:
        message = '网关错误';
        break;
      case 503:
        message = '服务不可用';
        break;
      case 504:
        message = '网关超时';
        break;
    }
    
    const error = new Error(message);
    error.statusCode = statusCode;
    error.data = data;
    return Promise.reject(error);
  }
}

/**
 * 基础请求方法
 * @param {object} options 请求选项
 * @returns {Promise} 请求Promise
 */
function request(options) {
  return new Promise((resolve, reject) => {
    // 请求拦截
    const processedOptions = requestInterceptor(options);
    
    wx.request({
      ...processedOptions,
      success: (response) => {
        responseInterceptor(response)
          .then(resolve)
          .catch(reject);
      },
      fail: (error) => {
        console.error('请求失败:', error);
        
        let message = '网络连接失败';
        if (error.errMsg) {
          if (error.errMsg.includes('timeout')) {
            message = '请求超时，请检查网络连接';
          } else if (error.errMsg.includes('fail')) {
            message = '网络请求失败，请检查网络连接';
          }
        }
        
        const requestError = new Error(message);
        requestError.originalError = error;
        reject(requestError);
      }
    });
  });
}

/**
 * GET请求
 * @param {string} url 请求地址
 * @param {object} data 请求参数
 * @param {object} options 其他选项
 * @returns {Promise} 请求Promise
 */
function get(url, data = {}, options = {}) {
  // 将参数拼接到URL中
  const params = new URLSearchParams(data).toString();
  const fullUrl = params ? `${url}?${params}` : url;
  
  return request({
    url: fullUrl,
    method: 'GET',
    ...options
  });
}

/**
 * POST请求
 * @param {string} url 请求地址
 * @param {object} data 请求数据
 * @param {object} options 其他选项
 * @returns {Promise} 请求Promise
 */
function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
}

/**
 * PUT请求
 * @param {string} url 请求地址
 * @param {object} data 请求数据
 * @param {object} options 其他选项
 * @returns {Promise} 请求Promise
 */
function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

/**
 * DELETE请求
 * @param {string} url 请求地址
 * @param {object} data 请求参数
 * @param {object} options 其他选项
 * @returns {Promise} 请求Promise
 */
function del(url, data = {}, options = {}) {
  const params = new URLSearchParams(data).toString();
  const fullUrl = params ? `${url}?${params}` : url;
  
  return request({
    url: fullUrl,
    method: 'DELETE',
    ...options
  });
}

/**
 * 文件上传
 * @param {string} url 上传地址
 * @param {string} filePath 文件路径
 * @param {string} name 文件字段名
 * @param {object} formData 额外的表单数据
 * @param {object} options 其他选项
 * @returns {Promise} 上传Promise
 */
function upload(url, filePath, name = 'file', formData = {}, options = {}) {
  return new Promise((resolve, reject) => {
    // 添加基础URL
    if (!url.startsWith('http')) {
      url = config.baseURL + url;
    }
    
    // 添加token到header
    const header = { ...options.header };
    const token = wx.getStorageSync('token');
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }
    
    wx.uploadFile({
      url,
      filePath,
      name,
      formData,
      header,
      success: (response) => {
        try {
          const data = JSON.parse(response.data);
          if (data.code === 0 || data.success) {
            resolve(data.data || data);
          } else {
            reject(new Error(data.message || '上传失败'));
          }
        } catch (error) {
          reject(new Error('响应数据解析失败'));
        }
      },
      fail: (error) => {
        console.error('上传失败:', error);
        reject(new Error('文件上传失败'));
      }
    });
  });
}

/**
 * 文件下载
 * @param {string} url 下载地址
 * @param {object} options 其他选项
 * @returns {Promise} 下载Promise
 */
function download(url, options = {}) {
  return new Promise((resolve, reject) => {
    // 添加基础URL
    if (!url.startsWith('http')) {
      url = config.baseURL + url;
    }
    
    // 添加token到header
    const header = { ...options.header };
    const token = wx.getStorageSync('token');
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }
    
    wx.downloadFile({
      url,
      header,
      success: (response) => {
        if (response.statusCode === 200) {
          resolve(response.tempFilePath);
        } else {
          reject(new Error('下载失败'));
        }
      },
      fail: (error) => {
        console.error('下载失败:', error);
        reject(new Error('文件下载失败'));
      }
    });
  });
}

/**
 * 设置基础配置
 * @param {object} newConfig 新配置
 */
function setConfig(newConfig) {
  Object.assign(config, newConfig);
}

/**
 * 获取当前配置
 * @returns {object} 当前配置
 */
function getConfig() {
  return { ...config };
}

module.exports = {
  request,
  get,
  post,
  put,
  delete: del,
  upload,
  download,
  setConfig,
  getConfig
};