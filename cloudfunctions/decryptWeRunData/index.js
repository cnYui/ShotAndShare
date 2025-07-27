const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 解密微信运动数据云函数
 * @param {Object} event - 云函数参数
 * @param {string} event.encryptedData - 加密的运动数据
 * @param {string} event.iv - 初始向量
 * @param {string} event.sessionKey - 会话密钥（可选，如果没有则从数据库获取）
 * @returns {Object} 解密后的运动数据
 */
exports.main = async (event, context) => {
  console.log('解密微信运动数据请求:', event);
  
  try {
    const { encryptedData, iv, sessionKey, weRunData } = event;
    const { OPENID } = cloud.getWXContext();
    
    let stepInfoList = [];
    
    // 优先使用CloudID方式（推荐）
    if (weRunData) {
      console.log('使用CloudID方式获取微信运动数据');
      console.log('weRunData结构:', JSON.stringify(weRunData, null, 2));
      
      // 检查CloudID解密是否成功
      if (weRunData.errCode && weRunData.errCode !== 0) {
        throw new Error(`微信运动数据获取失败: ${weRunData.errMsg || '未知错误'}`);
      }
      
      // 直接使用解密后的数据
      if (weRunData.data && weRunData.data.stepInfoList) {
        stepInfoList = weRunData.data.stepInfoList;
      } else if (weRunData.stepInfoList) {
        // 有些情况下数据可能直接在根级别
        stepInfoList = weRunData.stepInfoList;
      } else {
        console.warn('CloudID数据中未找到stepInfoList，使用空数组');
        stepInfoList = [];
      }
      
      console.log('CloudID解密成功，获取到', stepInfoList.length, '天的步数数据');
      
    } else if (encryptedData && iv) {
      console.log('使用传统方式解密微信运动数据');
      
      let actualSessionKey = sessionKey;
      
      // 如果没有提供sessionKey，从数据库获取
      if (!actualSessionKey) {
        console.log('从数据库获取session_key，用户OPENID:', OPENID);
        
        const userResult = await db.collection('pet_users').where({
          user_id: OPENID
        }).get();
        
        console.log('数据库查询结果:', userResult.data.length, '条记录');
        
        if (userResult.data.length === 0) {
          throw new Error('用户不存在，请先登录');
        }
        
        const userData = userResult.data[0];
        actualSessionKey = userData.session_key;
        
        console.log('用户数据:', {
          user_id: userData.user_id,
          session_key_exists: !!userData.session_key,
          session_key_length: userData.session_key ? userData.session_key.length : 0,
          last_login: userData.last_login
        });
        
        if (!actualSessionKey) {
          throw new Error('用户session_key不存在，请重新登录');
        }
      }
      
      // 解密运动数据
      const decryptedData = cloud.CloudSDK.wxDecrypt({
        encryptedData,
        iv,
        sessionKey: actualSessionKey
      });
      
      console.log('传统方式解密成功:', decryptedData);
      
      // 解析步数数据
      stepInfoList = JSON.parse(decryptedData).stepInfoList || [];
      
    } else {
      throw new Error('缺少必要的参数：需要weRunData或者encryptedData+iv');
    }
    
    // 获取今日步数
    const today = new Date();
    const todayTimestamp = Math.floor(today.getTime() / 1000);
    const yesterdayTimestamp = todayTimestamp - 24 * 60 * 60;
    
    let todaySteps = 0;
    let weeklySteps = [];
    
    // 处理步数数据
    stepInfoList.forEach(stepInfo => {
      const stepTimestamp = stepInfo.timestamp;
      const steps = stepInfo.step;
      
      // 今日步数
      if (stepTimestamp >= yesterdayTimestamp && stepTimestamp < todayTimestamp) {
        todaySteps = steps;
      }
      
      // 最近7天步数
      const sevenDaysAgo = todayTimestamp - 7 * 24 * 60 * 60;
      if (stepTimestamp >= sevenDaysAgo) {
        weeklySteps.push({
          date: new Date(stepTimestamp * 1000).toISOString().split('T')[0],
          steps: steps,
          timestamp: stepTimestamp
        });
      }
    });
    
    // 按日期排序
    weeklySteps.sort((a, b) => a.timestamp - b.timestamp);
    
    // 保存到数据库（可选）
    try {
      await db.collection('health_data').add({
        data: {
          user_id: OPENID,
          date: today.toISOString().split('T')[0],
          steps: todaySteps,
          weekly_steps: weeklySteps,
          source: 'wechat_werun',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    } catch (dbError) {
      console.warn('保存步数数据到数据库失败:', dbError);
      // 不影响主要功能，继续执行
    }
    
    return {
      success: true,
      data: {
        todaySteps,
        weeklySteps,
        totalDays: stepInfoList.length
      }
    };
    
  } catch (error) {
    console.error('解密微信运动数据失败:', error);
    return {
      success: false,
      error: error.message || '解密失败',
      data: {
        todaySteps: 0,
        weeklySteps: [],
        totalDays: 0
      }
    };
  }
};