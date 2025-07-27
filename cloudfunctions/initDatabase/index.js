const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

/**
 * 数据库初始化云函数
 * 创建所需的集合和初始数据
 */
exports.main = async (event, context) => {
  try {
    const results = [];
    
    // 创建用户表
    try {
      await db.createCollection('pet_users');
      results.push('用户表创建成功');
    } catch (e) {
      results.push('用户表已存在');
    }
    
    // 创建宠物表
    try {
      await db.createCollection('pets');
      results.push('宠物表创建成功');
    } catch (e) {
      results.push('宠物表已存在');
    }
    
    // 创建任务定义表
    try {
      await db.createCollection('tasks');
      await initTasksData();
      results.push('任务表创建成功并初始化数据');
    } catch (e) {
      results.push('任务表已存在');
    }
    
    // 创建任务记录表
    try {
      await db.createCollection('task_records');
      results.push('任务记录表创建成功');
    } catch (e) {
      results.push('任务记录表已存在');
    }
    
    // 创建健康数据表
    try {
      await db.createCollection('health_data');
      results.push('健康数据表创建成功');
    } catch (e) {
      results.push('健康数据表已存在');
    }
    
    // 创建聊天上下文表
    try {
      await db.createCollection('chat_context');
      results.push('聊天上下文表创建成功');
    } catch (e) {
      results.push('聊天上下文表已存在');
    }
    
    return {
      success: true,
      data: results
    };
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 初始化任务数据
 */
async function initTasksData() {
  const defaultTasks = [
    {
      name: '每日步行',
      category: 'exercise',
      target_value: 8000,
      unit: '步',
      reward_exp: 20,
      reward_item: null,
      is_active: true,
      description: '每天走8000步，保持身体健康'
    },
    {
      name: '喝水打卡',
      category: 'health',
      target_value: 8,
      unit: '杯',
      reward_exp: 15,
      reward_item: null,
      is_active: true,
      description: '每天喝8杯水，保持身体水分'
    },
    {
      name: '早睡早起',
      category: 'lifestyle',
      target_value: 1,
      unit: '次',
      reward_exp: 25,
      reward_item: null,
      is_active: true,
      description: '23点前睡觉，7点前起床'
    },
    {
      name: '运动锻炼',
      category: 'exercise',
      target_value: 30,
      unit: '分钟',
      reward_exp: 30,
      reward_item: null,
      is_active: true,
      description: '每天运动30分钟'
    },
    {
      name: '健康饮食',
      category: 'diet',
      target_value: 3,
      unit: '餐',
      reward_exp: 20,
      reward_item: null,
      is_active: true,
      description: '一日三餐规律饮食'
    },
    {
      name: '与宠物聊天',
      category: 'interaction',
      target_value: 5,
      unit: '次',
      reward_exp: 10,
      reward_item: null,
      is_active: true,
      description: '与宠物进行5次对话互动'
    },
    {
      name: '冥想放松',
      category: 'mental',
      target_value: 10,
      unit: '分钟',
      reward_exp: 15,
      reward_item: null,
      is_active: true,
      description: '每天冥想10分钟，放松身心'
    },
    {
      name: '阅读学习',
      category: 'mental',
      target_value: 30,
      unit: '分钟',
      reward_exp: 20,
      reward_item: null,
      is_active: true,
      description: '每天阅读30分钟'
    }
  ];
  
  // 检查是否已有任务数据
  const existingTasks = await db.collection('tasks').get();
  
  if (existingTasks.data.length === 0) {
    // 批量插入任务数据
    for (const task of defaultTasks) {
      await db.collection('tasks').add({
        data: task
      });
    }
  }
}