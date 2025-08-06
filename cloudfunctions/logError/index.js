const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

/**
 * 错误日志记录云函数
 * 用于记录应用中的错误信息
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  try {
    const {
      error_type,
      error_message,
      stack_trace,
      user_agent,
      page_path,
      function_name,
      additional_info
    } = event;
    
    // 验证必需字段
    if (!error_type || !error_message) {
      return {
        success: false,
        error: '错误类型和错误信息是必需的'
      };
    }
    
    // 创建错误日志记录
    const errorLog = {
      user_id: openid,
      error_type: error_type,
      error_message: error_message,
      stack_trace: stack_trace || '',
      user_agent: user_agent || '',
      page_path: page_path || '',
      function_name: function_name || '',
      additional_info: additional_info || {},
      timestamp: new Date(),
      environment: cloud.DYNAMIC_CURRENT_ENV,
      resolved: false
    };
    
    // 保存到数据库
    const result = await db.collection('error_logs').add({
      data: errorLog
    });
    
    // 如果是严重错误，可以在这里添加额外的处理逻辑
    // 比如发送通知给开发者
    if (error_type === 'critical' || error_type === 'fatal') {
      console.error('严重错误记录:', errorLog);
      // 这里可以添加发送邮件或其他通知机制
    }
    
    return {
      success: true,
      data: {
        log_id: result._id,
        timestamp: errorLog.timestamp
      }
    };
    
  } catch (error) {
    console.error('记录错误日志失败:', error);
    return {
      success: false,
      error: '记录错误日志失败: ' + error.message
    };
  }
};