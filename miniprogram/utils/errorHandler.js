/**
 * 错误处理工具类
 * 用于统一处理应用中的错误并记录到云端
 */
class ErrorHandler {
  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @param {Object} context - 错误上下文信息
   */
  static handleError(error, context = {}) {
    console.error('应用错误:', error);
    
    // 记录错误到云端
    this.logError({
      error_type: context.type || 'runtime',
      error_message: error.message || '未知错误',
      stack_trace: error.stack || '',
      page_path: context.page || this.getCurrentPage(),
      function_name: context.function || '',
      user_agent: this.getUserAgent(),
      additional_info: {
        ...context,
        timestamp: new Date().toISOString()
      }
    });
    
    // 显示用户友好的错误提示
    this.showUserFriendlyError(error, context);
  }
  
  /**
   * 记录错误到云端
   * @param {Object} errorInfo - 错误信息
   */
  static async logError(errorInfo) {
    try {
      await wx.cloud.callFunction({
        name: 'logError',
        data: errorInfo
      });
    } catch (logError) {
      console.error('记录错误日志失败:', logError);
    }
  }
  
  /**
   * 显示用户友好的错误提示
   * @param {Error} error - 错误对象
   * @param {Object} context - 错误上下文
   */
  static showUserFriendlyError(error, context) {
    let message = '操作失败，请稍后重试';
    
    // 根据错误类型显示不同的提示
    if (context.type === 'network') {
      message = '网络连接异常，请检查网络后重试';
    } else if (context.type === 'auth') {
      message = '登录状态异常，请重新登录';
    } else if (context.type === 'validation') {
      message = error.message || '输入信息有误，请检查后重试';
    } else if (context.type === 'permission') {
      message = '权限不足，无法执行此操作';
    }
    
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    });
  }
  
  /**
   * 获取当前页面路径
   */
  static getCurrentPage() {
    try {
      const pages = getCurrentPages();
      if (pages.length > 0) {
        return pages[pages.length - 1].route;
      }
    } catch (e) {
      console.warn('获取当前页面失败:', e);
    }
    return 'unknown';
  }
  
  /**
   * 获取用户代理信息
   */
  static getUserAgent() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      return `${systemInfo.platform} ${systemInfo.system} WeChat/${systemInfo.version}`;
    } catch (e) {
      console.warn('获取系统信息失败:', e);
      return 'unknown';
    }
  }
  
  /**
   * 包装异步函数，自动处理错误
   * @param {Function} asyncFn - 异步函数
   * @param {Object} context - 错误上下文
   */
  static wrapAsync(asyncFn, context = {}) {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        this.handleError(error, context);
        throw error;
      }
    };
  }
  
  /**
   * 包装云函数调用
   * @param {string} functionName - 云函数名称
   * @param {Object} data - 调用参数
   * @param {Object} options - 选项
   */
  static async callCloudFunction(functionName, data = {}, options = {}) {
    try {
      const result = await wx.cloud.callFunction({
        name: functionName,
        data
      });
      
      if (result.result && !result.result.success) {
        throw new Error(result.result.error || '云函数调用失败');
      }
      
      return result.result;
    } catch (error) {
      this.handleError(error, {
        type: 'cloud_function',
        function: functionName,
        data: data,
        ...options.context
      });
      throw error;
    }
  }
  
  /**
   * 网络请求错误处理
   * @param {Error} error - 网络错误
   * @param {Object} context - 请求上下文
   */
  static handleNetworkError(error, context = {}) {
    this.handleError(error, {
      type: 'network',
      ...context
    });
  }
  
  /**
   * 验证错误处理
   * @param {string} message - 验证错误信息
   * @param {Object} context - 验证上下文
   */
  static handleValidationError(message, context = {}) {
    const error = new Error(message);
    this.handleError(error, {
      type: 'validation',
      ...context
    });
  }
}

module.exports = ErrorHandler;