const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

/**
 * 用户管理云函数
 * 处理用户相关的所有操作
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  switch (event.action) {
    case 'getUserStats':
      return await getUserStats(openid);
    case 'updateUserInfo':
      return await updateUserInfo(openid, event.nickname, event.signature);
    default:
      return {
        success: false,
        error: '未知操作类型'
      };
  }
};

/**
 * 获取用户统计数据
 */
async function getUserStats(userId) {
  try {
    // 查询用户信息
    const userQuery = await db.collection('pet_users')
      .where({ user_id: userId })
      .get();
    
    if (userQuery.data.length === 0) {
      return {
        success: false,
        error: '用户不存在'
      };
    }
    
    const user = userQuery.data[0];
    
    // 计算总任务完成数
    const taskRecordsQuery = await db.collection('task_records')
      .where({
        user_id: userId,
        status: 'completed'
      })
      .count();
    
    const totalTasks = taskRecordsQuery.total;
    
    // 计算使用天数（从注册日期到现在）
    const registrationDate = new Date(user.created_at);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - registrationDate.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return {
      success: true,
      data: {
        total_days: totalDays,
        total_tasks: totalTasks,
        total_exp: user.total_exp || 0,
        level: user.level || 1
      }
    };
    
  } catch (error) {
    console.error('获取用户统计失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 更新用户信息
 */
async function updateUserInfo(userId, nickname, signature) {
  try {
    // 验证输入
    if (!nickname || nickname.trim().length === 0) {
      return {
        success: false,
        error: '昵称不能为空'
      };
    }
    
    if (nickname.length > 20) {
      return {
        success: false,
        error: '昵称长度不能超过20个字符'
      };
    }
    
    if (signature && signature.length > 100) {
      return {
        success: false,
        error: '个性签名长度不能超过100个字符'
      };
    }
    
    // 查询用户
    const userQuery = await db.collection('pet_users')
      .where({ user_id: userId })
      .get();
    
    if (userQuery.data.length === 0) {
      return {
        success: false,
        error: '用户不存在'
      };
    }
    
    const user = userQuery.data[0];
    
    // 更新用户信息
    await db.collection('pet_users')
      .doc(user._id)
      .update({
        data: {
          nickname: nickname.trim(),
          signature: signature ? signature.trim() : '',
          updated_at: new Date()
        }
      });
    
    return {
      success: true,
      data: {
        nickname: nickname.trim(),
        signature: signature ? signature.trim() : ''
      }
    };
    
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}