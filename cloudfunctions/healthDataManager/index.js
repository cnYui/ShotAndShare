const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

/**
 * 健康数据管理云函数
 * 处理健康数据相关的所有操作
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  switch (event.action) {
    case 'syncWeRunData':
      return await syncWeRunData(openid, event.encryptedData, event.iv);
    case 'getHealthData':
      return await getHealthData(openid, event.startDate, event.endDate);
    case 'inputHealthData':
      return await inputHealthData(openid, event.healthData);
    case 'getHealthStats':
      return await getHealthStats(openid, event.range);
    case 'cleanDuplicateData':
      return await cleanDuplicateHealthData(openid, event.date);
    case 'cleanAllDuplicates':
      return await cleanAllDuplicatesForUser(openid);
    default:
      return {
        success: false,
        error: '未知操作类型'
      };
  }
};

/**
 * 同步微信运动数据
 */
async function syncWeRunData(userId, encryptedData, iv) {
  try {
    // 解密微信运动数据
    const wxContext = cloud.getWXContext();
    const sessionKey = wxContext.SESSION_KEY;
    
    if (!sessionKey) {
      return {
        success: false,
        error: '用户未登录或session过期'
      };
    }
    
    // 这里需要实现数据解密逻辑
    // 由于微信云开发环境限制，这里模拟步数数据
    const today = new Date().toISOString().split('T')[0];
    const mockSteps = Math.floor(Math.random() * 5000) + 3000; // 模拟3000-8000步
    
    // 使用upsert操作确保每天只有一条记录
    await upsertHealthData(userId, today, {
      steps: mockSteps,
      calories: Math.floor(mockSteps * 0.04), // 估算卡路里
      source: 'wechat_werun'
    });
    
    // 更新相关任务进度
    await updateStepTask(userId, mockSteps);
    
    return {
      success: true,
      data: {
        steps: mockSteps,
        calories: Math.floor(mockSteps * 0.04)
      }
    };
    
  } catch (error) {
    console.error('同步微信运动数据失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取健康数据
 */
async function getHealthData(userId, startDate, endDate) {
  try {
    const query = {
      user_id: userId
    };
    
    if (startDate && endDate) {
      query.date = _.gte(startDate).and(_.lte(endDate));
    } else if (startDate) {
      query.date = _.gte(startDate);
    } else if (endDate) {
      query.date = _.lte(endDate);
    }
    
    const healthData = await db.collection('health_data')
      .where(query)
      .orderBy('date', 'desc')
      .get();
    
    return {
      success: true,
      data: healthData.data
    };
    
  } catch (error) {
    console.error('获取健康数据失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 手动录入健康数据
 */
async function inputHealthData(userId, healthData) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 使用upsert操作确保每天只有一条记录
    await upsertHealthData(userId, today, healthData);
    
    // 更新相关任务进度
    if (healthData.exercise_minutes) {
      await updateExerciseTask(userId, healthData.exercise_minutes);
    }
    
    return {
      success: true,
      data: {
        user_id: userId,
        date: today,
        steps: healthData.steps || 0,
        water_ml: healthData.water_ml || 0,
        sleep_hours: healthData.sleep_hours || 0,
        exercise_minutes: healthData.exercise_minutes || 0,
        calories: healthData.calories || 0,
        weight: healthData.weight || 0,
        updated_at: new Date()
      }
    };
    
  } catch (error) {
    console.error('录入健康数据失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取健康统计
 */
async function getHealthStats(userId, range = 'day') {
  try {
    // 首先清理重复数据
    await cleanAllDuplicatesForUser(userId);
    
    const today = new Date();
    let startDate;
    
    // 根据范围确定开始日期
    switch (range) {
      case 'day':
        startDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000); // 最近7天（包括今天）
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000); // 最近30天（包括今天）
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      default:
        startDate = today.toISOString().split('T')[0];
    }
    
    // 获取指定范围的数据
    const query = {
      user_id: userId
    };
    
    if (range === 'day') {
      // 只获取今天的数据
      query.date = startDate;
    } else {
      // 获取范围内的数据
      query.date = _.gte(startDate);
    }
    
    const healthData = await db.collection('health_data')
      .where(query)
      .orderBy('date', 'desc')
      .get();
    
    // 过滤和验证数据，确保数值合理
    const validData = healthData.data.map(item => ({
      ...item,
      steps: Math.max(0, parseInt(item.steps) || 0),
      water_ml: Math.max(0, parseInt(item.water_ml) || 0),
      sleep_hours: Math.max(0, Math.min(24, parseFloat(item.sleep_hours) || 0)),
      exercise_minutes: Math.max(0, parseInt(item.exercise_minutes) || 0),
      calories: Math.max(0, parseInt(item.calories) || 0),
      weight: Math.max(0, parseFloat(item.weight) || 0)
    }));
    
    return {
      success: true,
      data: validData
    };
    
  } catch (error) {
    console.error('获取健康统计失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 更新步数任务进度
 */
async function updateStepTask(userId, steps) {
  const today = new Date().toISOString().split('T')[0];
  
  // 查找步数任务
  const stepTask = await db.collection('tasks')
    .where({
      category: 'exercise',
      name: '每日步行'
    })
    .get();
  
  if (stepTask.data.length > 0) {
    const taskId = stepTask.data[0]._id;
    
    // 查找今日任务记录
    const taskRecord = await db.collection('task_records')
      .where({
        user_id: userId,
        date: today,
        task_id: taskId
      })
      .get();
    
    if (taskRecord.data.length > 0) {
      const record = taskRecord.data[0];
      const isCompleted = steps >= stepTask.data[0].target_value;
      
      const updateData = {
        progress: steps
      };
      
      if (isCompleted && record.status !== 'completed') {
        updateData.status = 'completed';
        updateData.completed_at = new Date();
        
        // 更新宠物状态
        await updatePetStatus(userId, stepTask.data[0].reward_exp);
      }
      
      await db.collection('task_records').doc(record._id).update({
        data: updateData
      });
    }
  }
}

/**
 * 更新运动任务进度
 */
async function updateExerciseTask(userId, minutes) {
  const today = new Date().toISOString().split('T')[0];
  
  // 查找运动任务
  const exerciseTask = await db.collection('tasks')
    .where({
      category: 'exercise',
      name: '运动锻炼'
    })
    .get();
  
  if (exerciseTask.data.length > 0) {
    const taskId = exerciseTask.data[0]._id;
    
    // 查找今日任务记录
    const taskRecord = await db.collection('task_records')
      .where({
        user_id: userId,
        date: today,
        task_id: taskId
      })
      .get();
    
    if (taskRecord.data.length > 0) {
      const record = taskRecord.data[0];
      const newProgress = Math.min(record.progress + minutes, exerciseTask.data[0].target_value);
      const isCompleted = newProgress >= exerciseTask.data[0].target_value;
      
      const updateData = {
        progress: newProgress
      };
      
      if (isCompleted && record.status !== 'completed') {
        updateData.status = 'completed';
        updateData.completed_at = new Date();
        
        // 更新宠物状态
        await updatePetStatus(userId, exerciseTask.data[0].reward_exp);
      }
      
      await db.collection('task_records').doc(record._id).update({
        data: updateData
      });
    }
  }
}

/**
 * Upsert健康数据 - 确保每天只有一条记录
 */
async function upsertHealthData(userId, date, healthData) {
  try {
    // 先查询是否存在该用户该日期的记录
    const existingData = await db.collection('health_data')
      .where({
        user_id: userId,
        date: date
      })
      .limit(1)
      .get();
    
    const now = new Date();
    
    if (existingData.data.length > 0) {
      // 如果存在记录，则更新
      const existingRecord = existingData.data[0];
      const updateData = {
        steps: Math.max(0, parseInt(healthData.steps) || existingRecord.steps || 0),
        water_ml: Math.max(0, parseInt(healthData.water_ml) || existingRecord.water_ml || 0),
        sleep_hours: Math.max(0, parseFloat(healthData.sleep_hours) || existingRecord.sleep_hours || 0),
        exercise_minutes: Math.max(0, parseInt(healthData.exercise_minutes) || existingRecord.exercise_minutes || 0),
        calories: Math.max(0, parseInt(healthData.calories) || existingRecord.calories || 0),
        weight: Math.max(0, parseFloat(healthData.weight) || existingRecord.weight || 0),
        updated_at: now
      };
      
      await db.collection('health_data').doc(existingRecord._id).update({
        data: updateData
      });
      
      console.log(`更新健康数据: 用户${userId}, 日期${date}`);
    } else {
      // 如果不存在记录，则创建新记录
      const newData = {
        user_id: userId,
        date: date,
        steps: Math.max(0, parseInt(healthData.steps) || 0),
        water_ml: Math.max(0, parseInt(healthData.water_ml) || 0),
        sleep_hours: Math.max(0, parseFloat(healthData.sleep_hours) || 0),
        exercise_minutes: Math.max(0, parseInt(healthData.exercise_minutes) || 0),
        calories: Math.max(0, parseInt(healthData.calories) || 0),
        weight: Math.max(0, parseFloat(healthData.weight) || 0),
        source: healthData.source || 'manual',
        created_at: now,
        updated_at: now
      };
      
      await db.collection('health_data').add({
        data: newData
      });
      
      console.log(`创建健康数据: 用户${userId}, 日期${date}`);
    }
    
  } catch (error) {
    console.error('Upsert健康数据失败:', error);
    throw error;
  }
}

/**
  * 清理重复数据 - 删除同一用户同一天的重复记录，只保留最新的一条
  */
 async function cleanDuplicateHealthData(userId, date) {
   try {
     const duplicateData = await db.collection('health_data')
       .where({
         user_id: userId,
         date: date
       })
       .orderBy('updated_at', 'desc')
       .get();
     
     if (duplicateData.data.length > 1) {
       // 保留第一条（最新的），删除其余的
       const recordsToDelete = duplicateData.data.slice(1);
       
       for (const record of recordsToDelete) {
         await db.collection('health_data').doc(record._id).remove();
         console.log(`删除重复记录: ${record._id}`);
       }
       
       console.log(`清理完成: 用户${userId}, 日期${date}, 删除了${recordsToDelete.length}条重复记录`);
       
       return {
         success: true,
         message: `清理完成，删除了${recordsToDelete.length}条重复记录`,
         deletedCount: recordsToDelete.length
       };
     } else {
       return {
         success: true,
         message: '没有发现重复记录',
         deletedCount: 0
       };
     }
     
   } catch (error) {
     console.error('清理重复数据失败:', error);
     return {
       success: false,
       error: error.message
     };
   }
 }
 
 /**
  * 清理用户所有重复数据
  */
 async function cleanAllDuplicatesForUser(userId) {
   try {
     // 获取用户所有健康数据，按日期分组
     const allData = await db.collection('health_data')
       .where({
         user_id: userId
       })
       .orderBy('date', 'asc')
       .orderBy('updated_at', 'desc')
       .get();
     
     // 按日期分组
     const dataByDate = {};
     allData.data.forEach(record => {
       if (!dataByDate[record.date]) {
         dataByDate[record.date] = [];
       }
       dataByDate[record.date].push(record);
     });
     
     let totalDeleted = 0;
     const cleanedDates = [];
     
     // 清理每个日期的重复数据
     for (const [date, records] of Object.entries(dataByDate)) {
       if (records.length > 1) {
         // 保留第一条（最新的），删除其余的
         const recordsToDelete = records.slice(1);
         
         for (const record of recordsToDelete) {
           await db.collection('health_data').doc(record._id).remove();
           console.log(`删除重复记录: ${record._id}, 日期: ${date}`);
         }
         
         totalDeleted += recordsToDelete.length;
         cleanedDates.push(date);
       }
     }
     
     console.log(`用户${userId}清理完成，总共删除了${totalDeleted}条重复记录`);
     
     return {
       success: true,
       message: `清理完成，总共删除了${totalDeleted}条重复记录`,
       totalDeleted,
       cleanedDates
     };
     
   } catch (error) {
     console.error('清理用户所有重复数据失败:', error);
     return {
       success: false,
       error: error.message
     };
   }
 }

/**
 * 计算统计数据
 */
function calculateStats(data) {
  if (data.length === 0) {
    return {
      avgSteps: 0,
      totalSteps: 0,
      avgCalories: 0,
      totalCalories: 0,
      avgExercise: 0,
      totalExercise: 0
    };
  }
  
  // 确保步数不为负数
  const totalSteps = Math.max(0, data.reduce((sum, item) => {
    const steps = parseInt(item.steps) || 0;
    return sum + Math.max(0, steps); // 确保每个值都不为负
  }, 0));
  
  // 确保卡路里不为负数
  const totalCalories = Math.max(0, data.reduce((sum, item) => {
    const calories = parseInt(item.calories) || 0;
    return sum + Math.max(0, calories);
  }, 0));
  
  // 确保运动时间不为负数
  const totalExercise = Math.max(0, data.reduce((sum, item) => {
    const exercise = parseInt(item.exercise_minutes) || 0;
    return sum + Math.max(0, exercise);
  }, 0));
  
  return {
    avgSteps: Math.round(totalSteps / data.length),
    totalSteps,
    avgCalories: Math.round(totalCalories / data.length),
    totalCalories,
    avgExercise: Math.round(totalExercise / data.length),
    totalExercise
  };
}

/**
 * 更新宠物状态
 */
async function updatePetStatus(userId, expReward) {
  const petQuery = await db.collection('pets').where({
    user_id: userId
  }).get();
  
  if (petQuery.data.length > 0) {
    const pet = petQuery.data[0];
    const newExp = pet.exp + expReward;
    const newLevel = Math.floor(newExp / 100) + 1;
    
    await db.collection('pets').doc(pet._id).update({
      data: {
        exp: newExp,
        level: newLevel,
        health: Math.min(pet.health + 5, 100),
        vitality: Math.min(pet.vitality + 3, 100),
        last_active: new Date()
      }
    });
  }
}