const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { action, timeRange = 7 } = event;
  
  try {
    switch (action) {
      case 'getUserStats':
        return await getUserStats(timeRange);
      case 'getTaskStats':
        return await getTaskStats(timeRange);
      case 'getPetStats':
        return await getPetStats(timeRange);
      default:
        return { success: false, error: '无效的分析类型' };
    }
  } catch (error) {
    console.error('数据分析失败:', error);
    return { success: false, error: error.message };
  }
};

// 用户统计
async function getUserStats(days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // 活跃用户统计
  const activeUsers = await db.collection('pet_users')
    .where({
      last_login: db.command.gte(startDate)
    })
    .count();
  
  // 新用户统计
  const newUsers = await db.collection('pet_users')
    .where({
      created_at: db.command.gte(startDate)
    })
    .count();
  
  // 总用户数
  const totalUsers = await db.collection('pet_users').count();
  
  return {
    success: true,
    data: {
      activeUsers: activeUsers.total,
      newUsers: newUsers.total,
      totalUsers: totalUsers.total,
      timeRange: days
    }
  };
}

// 任务统计
async function getTaskStats(days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  // 任务完成统计
  const completedTasks = await db.collection('task_records')
    .where({
      date: db.command.gte(startDateStr),
      status: 'completed'
    })
    .count();
  
  // 总任务记录数
  const totalTaskRecords = await db.collection('task_records')
    .where({
      date: db.command.gte(startDateStr)
    })
    .count();
  
  // 计算完成率
  const completionRate = totalTaskRecords.total > 0 
    ? (completedTasks.total / totalTaskRecords.total * 100).toFixed(2)
    : 0;
  
  // 按类别统计（简化版本，因为聚合查询可能较复杂）
  const tasksByType = await db.collection('task_records')
    .where({
      date: db.command.gte(startDateStr),
      status: 'completed'
    })
    .get();
  
  // 统计不同类型任务的完成情况
  const typeStats = {};
  for (const record of tasksByType.data) {
    // 根据task_id获取任务类型（这里简化处理）
    const taskType = record.task_type || 'unknown';
    typeStats[taskType] = (typeStats[taskType] || 0) + 1;
  }
  
  return {
    success: true,
    data: {
      totalCompleted: completedTasks.total,
      totalRecords: totalTaskRecords.total,
      completionRate: parseFloat(completionRate),
      byType: typeStats,
      timeRange: days
    }
  };
}

// 宠物统计
async function getPetStats(days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // 宠物互动统计
  const interactions = await db.collection('pet_interactions')
    .where({
      timestamp: db.command.gte(startDate)
    })
    .count();
  
  // 获取所有宠物的平均统计
  const allPets = await db.collection('pets').get();
  
  let totalLevel = 0;
  let totalHealth = 0;
  let totalIntimacy = 0;
  let totalExp = 0;
  const petCount = allPets.data.length;
  
  for (const pet of allPets.data) {
    totalLevel += pet.level || 1;
    totalHealth += pet.health || 100;
    totalIntimacy += pet.intimacy || 50;
    totalExp += pet.exp || 0;
  }
  
  const averageStats = petCount > 0 ? {
    avgLevel: (totalLevel / petCount).toFixed(2),
    avgHealth: (totalHealth / petCount).toFixed(2),
    avgIntimacy: (totalIntimacy / petCount).toFixed(2),
    avgExp: (totalExp / petCount).toFixed(2)
  } : {
    avgLevel: 0,
    avgHealth: 0,
    avgIntimacy: 0,
    avgExp: 0
  };
  
  // 互动类型统计
  const interactionsByType = await db.collection('pet_interactions')
    .where({
      timestamp: db.command.gte(startDate)
    })
    .get();
  
  const interactionTypeStats = {};
  for (const interaction of interactionsByType.data) {
    const type = interaction.interaction_type || 'unknown';
    interactionTypeStats[type] = (interactionTypeStats[type] || 0) + 1;
  }
  
  return {
    success: true,
    data: {
      totalInteractions: interactions.total,
      totalPets: petCount,
      averageStats: averageStats,
      interactionsByType: interactionTypeStats,
      timeRange: days
    }
  };
}