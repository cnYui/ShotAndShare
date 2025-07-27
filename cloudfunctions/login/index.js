const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

/**
 * 用户登录云函数
 * 处理用户首次登录和返回用户登录
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  let sessionKey = wxContext.SESSION_KEY;
  
  console.log('登录云函数调用，openid:', openid, 'sessionKey存在:', !!sessionKey);
  console.log('event参数:', { hasUserInfo: !!event.userInfo, hasCode: !!event.code });
  
  // 如果有code参数，使用code2Session获取session_key
  if (event.code && !sessionKey) {
    try {
      const codeResult = await cloud.openapi.sns.jscode2session({
        jsCode: event.code
      });
      sessionKey = codeResult.sessionKey;
      console.log('通过code2session获取sessionKey:', !!sessionKey);
    } catch (codeError) {
      console.error('code2session失败:', codeError);
    }
  }
  
  try {
    // 查询用户是否已存在
    const userQuery = await db.collection('pet_users').where({
      user_id: openid
    }).get();
    
    let user;
    let isNewUser = false;
    
    if (userQuery.data.length === 0) {
      // 新用户，创建用户记录
      isNewUser = true;
      const now = new Date();
      
      // 创建用户记录
      const userResult = await db.collection('pet_users').add({
        data: {
          user_id: openid,
          session_key: sessionKey,
          nickname: event.userInfo?.nickName || '新用户',
          avatar_url: event.userInfo?.avatarUrl || '',
          gender: event.userInfo?.gender || 0,
          city: event.userInfo?.city || '',
          join_date: now
        }
      });
      
      // 创建默认宠物
      const petResult = await db.collection('pets').add({
        data: {
          user_id: openid,
          pet_name: '小绿',
          species: 'cat', // 默认猫咪
          level: 1,
          exp: 0,
          health: 0,
          vitality: 0,
          intimacy: 0,
          last_active: now,
          // 添加互动数据
          feed_count: 0,
          play_count: 0,
          last_feed_time: null,
          last_play_time: null
        }
      });
      
      // 初始化今日任务记录
      await initDailyTasks(openid);
      
      user = {
        _id: userResult._id,
        user_id: openid,
        nickname: event.userInfo?.nickName || '新用户',
        avatar_url: event.userInfo?.avatarUrl || '',
        gender: event.userInfo?.gender || 0,
        city: event.userInfo?.city || '',
        join_date: now
      };
    } else {
      // 老用户，更新最后登录时间和session_key
      user = userQuery.data[0];
      await db.collection('pet_users').doc(user._id).update({
        data: {
          session_key: sessionKey,
          last_login: new Date()
        }
      });
    }
    
    // 清空用户的聊天历史记录
    await clearChatHistory(openid);
    
    // 获取宠物信息
    const petQuery = await db.collection('pets').where({
      user_id: openid
    }).get();
    
    const pet = petQuery.data[0] || null;
    
    // 获取今日任务完成情况
    const today = new Date().toISOString().split('T')[0];
    const taskQuery = await db.collection('task_records').where({
      user_id: openid,
      date: today
    }).get();
    
    return {
      success: true,
      data: {
        user,
        pet,
        isNewUser,
        todayTasks: taskQuery.data
      }
    };
    
  } catch (error) {
    console.error('登录失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 清空用户聊天历史记录
 */
async function clearChatHistory(userId) {
  try {
    // 查询该用户的所有聊天记录
    const chatQuery = await db.collection('chat_context').where({
      user_id: userId
    }).get();
    
    // 批量删除聊天记录
    if (chatQuery.data.length > 0) {
      const deletePromises = chatQuery.data.map(record => 
        db.collection('chat_context').doc(record._id).remove()
      );
      await Promise.all(deletePromises);
      console.log(`已清空用户 ${userId} 的 ${chatQuery.data.length} 条聊天记录`);
    }
  } catch (error) {
    console.error('清空聊天历史记录失败:', error);
    // 不抛出错误，避免影响登录流程
  }
}

/**
 * 初始化用户每日任务
 */
async function initDailyTasks(userId) {
  const today = new Date().toISOString().split('T')[0];
  
  // 获取所有活跃任务
  const tasksQuery = await db.collection('tasks').where({
    is_active: true
  }).get();
  
  // 为每个任务创建今日记录
  const taskRecords = tasksQuery.data.map(task => ({
    user_id: userId,
    date: today,
    task_id: task._id,
    status: 'pending', // pending, completed
    progress: 0,
    target_value: task.target_value
  }));
  
  // 批量插入任务记录
  if (taskRecords.length > 0) {
    for (const record of taskRecords) {
      await db.collection('task_records').add({
        data: record
      });
    }
  }
}