const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

/**
 * 任务管理云函数
 * 处理任务相关的所有操作
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  switch (event.action) {
    case 'getDailyTasks':
      return await getDailyTasks(openid);
    case 'getTasks':
      return await getTasks(openid, event.date);
    case 'completeTask':
      return await completeTask(openid, event.taskId);
    case 'updateTaskProgress':
      return await updateTaskProgress(openid, event.taskId, event.progress);
    case 'getTaskStats':
      return await getTaskStats(openid);
    case 'getTotalExp':
      return await getTotalExp(openid);
    default:
      return {
        success: false,
        error: '未知操作类型'
      };
  }
};

/**
 * 获取每日任务
 */
async function getDailyTasks(userId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 查询今日任务记录
    const taskRecordsQuery = await db.collection('task_records')
      .where({
        user_id: userId,
        date: today
      })
      .get();
    
    // 如果今日没有任务记录，则初始化
    if (taskRecordsQuery.data.length === 0) {
      await initDailyTasks(userId);
      // 重新查询
      const newTaskRecordsQuery = await db.collection('task_records')
        .where({
          user_id: userId,
          date: today
        })
        .get();
      
      return {
        success: true,
        data: await enrichTaskRecords(newTaskRecordsQuery.data)
      };
    }
    
    return {
      success: true,
      data: await enrichTaskRecords(taskRecordsQuery.data)
    };
    
  } catch (error) {
    console.error('获取每日任务失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 完成任务
 */
async function completeTask(userId, taskRecordId) {
  try {
    // 查询任务记录
    const taskRecord = await db.collection('task_records').doc(taskRecordId).get();
    
    if (!taskRecord.data || taskRecord.data.user_id !== userId) {
      return {
        success: false,
        error: '任务记录不存在或无权限'
      };
    }
    
    if (taskRecord.data.status === 'completed') {
      return {
        success: false,
        error: '任务已完成'
      };
    }
    
    // 获取任务定义
    const task = await db.collection('tasks').doc(taskRecord.data.task_id).get();
    
    if (!task.data) {
      return {
        success: false,
        error: '任务定义不存在'
      };
    }
    
    // 标记任务完成
    await db.collection('task_records').doc(taskRecordId).update({
      data: {
        status: 'completed',
        progress: task.data.target_value,
        completed_at: new Date()
      }
    });
    
    // 更新宠物状态
    await updatePetStatus(userId, task.data.reward_exp);
    
    return {
      success: true,
      data: {
        message: '任务完成！',
        reward_exp: task.data.reward_exp
      }
    };
    
  } catch (error) {
    console.error('完成任务失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 更新任务进度
 */
async function updateTaskProgress(userId, taskRecordId, progress) {
  try {
    // 查询任务记录
    const taskRecord = await db.collection('task_records').doc(taskRecordId).get();
    
    if (!taskRecord.data || taskRecord.data.user_id !== userId) {
      return {
        success: false,
        error: '任务记录不存在或无权限'
      };
    }
    
    // 获取任务定义
    const task = await db.collection('tasks').doc(taskRecord.data.task_id).get();
    
    if (!task.data) {
      return {
        success: false,
        error: '任务定义不存在'
      };
    }
    
    const newProgress = Math.min(progress, task.data.target_value);
    const isCompleted = newProgress >= task.data.target_value;
    
    // 更新任务进度
    const updateData = {
      progress: newProgress
    };
    
    if (isCompleted && taskRecord.data.status !== 'completed') {
      updateData.status = 'completed';
      updateData.completed_at = new Date();
      
      // 更新宠物状态
      await updatePetStatus(userId, task.data.reward_exp);
    }
    
    await db.collection('task_records').doc(taskRecordId).update({
      data: updateData
    });
    
    return {
      success: true,
      data: {
        progress: newProgress,
        isCompleted: isCompleted,
        reward_exp: isCompleted ? task.data.reward_exp : 0
      }
    };
    
  } catch (error) {
    console.error('更新任务进度失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取任务统计
 */
async function getTaskStats(userId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 今日任务统计
    const todayTasks = await db.collection('task_records')
      .where({
        user_id: userId,
        date: today
      })
      .get();
    
    const completedToday = todayTasks.data.filter(task => task.status === 'completed').length;
    const totalToday = todayTasks.data.length;
    
    // 本周任务统计
    const weekStart = getWeekStart();
    const weekTasks = await db.collection('task_records')
      .where({
        user_id: userId,
        date: _.gte(weekStart)
      })
      .get();
    
    const completedWeek = weekTasks.data.filter(task => task.status === 'completed').length;
    const totalWeek = weekTasks.data.length;
    
    return {
      success: true,
      data: {
        today: {
          completed: completedToday,
          total: totalToday,
          rate: totalToday > 0 ? (completedToday / totalToday * 100).toFixed(1) : 0
        },
        week: {
          completed: completedWeek,
          total: totalWeek,
          rate: totalWeek > 0 ? (completedWeek / totalWeek * 100).toFixed(1) : 0
        }
      }
    };
    
  } catch (error) {
    console.error('获取任务统计失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 初始化每日任务
 */
async function initDailyTasks(userId) {
  const today = new Date().toISOString().split('T')[0];
  
  // 获取所有活跃任务
  const tasksQuery = await db.collection('tasks').where({
    is_active: true
  }).get();
  
  // 为每个任务创建今日记录，但要检查是否已存在
  for (const task of tasksQuery.data) {
    // 检查是否已存在该任务的今日记录
    const existingRecord = await db.collection('task_records')
      .where({
        user_id: userId,
        date: today,
        task_id: task._id
      })
      .get();
    
    // 只有不存在时才创建新记录
    if (existingRecord.data.length === 0) {
      await db.collection('task_records').add({
        data: {
          user_id: userId,
          date: today,
          task_id: task._id,
          status: 'pending',
          progress: 0,
          target_value: task.target_value
        }
      });
    }
  }
}

/**
 * 丰富任务记录信息
 */
async function enrichTaskRecords(taskRecords) {
  const enrichedTasks = [];
  
  for (const record of taskRecords) {
    const task = await db.collection('tasks').doc(record.task_id).get();
    
    enrichedTasks.push({
      ...record,
      task_info: task.data
    });
  }
  
  return enrichedTasks;
}

/**
 * 更新宠物状态
 */
async function updatePetStatus(userId, expReward) {
  try {
    const petQuery = await db.collection('pets').where({
      user_id: userId
    }).get();
    
    if (petQuery.data.length > 0) {
      const pet = petQuery.data[0];
      const newExp = pet.exp + expReward;
      
      // 计算升级所需经验值
      const expForNextLevel = (pet.level + 1) * 100;
      
      // 更新宠物经验值
      await db.collection('pets').doc(pet._id).update({
        data: {
          exp: newExp,
          last_active: new Date()
        }
      });
      
      // 检查是否需要升级
      if (newExp >= expForNextLevel) {
        // 调用petManager的升级功能
        await cloud.callFunction({
          name: 'petManager',
          data: {
            action: 'petLevelUp',
            userId: userId
          }
        });
      }
    }
  } catch (error) {
    console.error('更新宠物状态失败:', error);
  }
}

/**
 * 获取本周开始日期（周一为一周开始）
 */
function getWeekStart() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=周日, 1=周一, ..., 6=周六
  // 计算到周一的偏移量
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 如果是周日，则偏移-6天；否则偏移到周一
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  return weekStart.toISOString().split('T')[0];
}

/**
 * 获取指定日期的任务
 */
async function getTasks(userId, date) {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // 查询指定日期的任务记录
    const taskRecordsQuery = await db.collection('task_records')
      .where({
        user_id: userId,
        date: targetDate
      })
      .get();
    
    // 如果没有任务记录且是今天，则初始化
    if (taskRecordsQuery.data.length === 0 && targetDate === new Date().toISOString().split('T')[0]) {
      await initDailyTasks(userId);
      // 重新查询
      const newTaskRecordsQuery = await db.collection('task_records')
        .where({
          user_id: userId,
          date: targetDate
        })
        .get();
      
      return {
        success: true,
        data: await enrichTaskRecords(newTaskRecordsQuery.data)
      };
    }
    
    return {
      success: true,
      data: await enrichTaskRecords(taskRecordsQuery.data)
    };
    
  } catch (error) {
    console.error('获取任务失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取用户总经验值
 */
async function getTotalExp(userId) {
  try {
    // 首先尝试从宠物数据获取经验值
    const petQuery = await db.collection('pets').where({
      user_id: userId
    }).get();
    
    if (petQuery.data.length > 0) {
      const pet = petQuery.data[0];
      return {
        success: true,
        data: {
          totalExp: pet.exp || 0
        }
      };
    }
    
    // 如果没有宠物数据，计算已完成任务的经验值
    const completedTasksQuery = await db.collection('task_records')
      .where({
        user_id: userId,
        status: 'completed'
      })
      .get();
    
    let totalExp = 0;
    
    // 计算所有已完成任务的经验值
    for (const taskRecord of completedTasksQuery.data) {
      const task = await db.collection('tasks').doc(taskRecord.task_id).get();
      if (task.data && task.data.reward_exp) {
        totalExp += task.data.reward_exp;
      }
    }
    
    return {
      success: true,
      data: {
        totalExp: totalExp
      }
    };
    
  } catch (error) {
    console.error('获取总经验值失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}