/**
 * 调试陪伴天数和总经验值显示问题
 * 检查数据库中的实际数据
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: 'healthypet-3gt0b8hc6e23c7c5', // 请替换为你的环境ID
});

const db = cloud.database();

async function debugCompanionStats() {
  try {
    console.log('🔍 开始调试陪伴天数和总经验值问题...');
    
    // 1. 检查pets集合中的数据
    console.log('\n📊 检查pets集合数据:');
    const petsQuery = await db.collection('pets').get();
    
    if (petsQuery.data.length === 0) {
      console.log('❌ pets集合中没有数据');
      return;
    }
    
    petsQuery.data.forEach((pet, index) => {
      console.log(`\n宠物 ${index + 1}:`);
      console.log('- user_id:', pet.user_id);
      console.log('- pet_name:', pet.pet_name);
      console.log('- created_at:', pet.created_at);
      console.log('- _createTime:', pet._createTime);
      console.log('- level:', pet.level);
      console.log('- exp:', pet.exp);
      
      // 计算陪伴天数
      const createTime = pet.created_at || pet._createTime;
      if (createTime) {
        const now = new Date();
        const created = new Date(createTime);
        const timeDiff = now.getTime() - created.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const companionDays = Math.max(daysDiff, 0);
        console.log('- 计算的陪伴天数:', companionDays);
      } else {
        console.log('- ❌ 缺少创建时间字段');
      }
    });
    
    // 2. 检查task_records集合中的数据
    console.log('\n📋 检查task_records集合数据:');
    const taskRecordsQuery = await db.collection('task_records').get();
    
    if (taskRecordsQuery.data.length === 0) {
      console.log('❌ task_records集合中没有数据');
    } else {
      console.log(`✅ 找到 ${taskRecordsQuery.data.length} 条任务记录`);
      
      // 按用户分组统计
      const userStats = {};
      taskRecordsQuery.data.forEach(record => {
        const userId = record.user_id;
        if (!userStats[userId]) {
          userStats[userId] = {
            total: 0,
            completed: 0,
            totalExp: 0
          };
        }
        
        userStats[userId].total++;
        if (record.status === 'completed') {
          userStats[userId].completed++;
          if (record.task_info && record.task_info.reward_exp) {
            userStats[userId].totalExp += record.task_info.reward_exp;
          }
        }
      });
      
      console.log('\n用户任务统计:');
      Object.keys(userStats).forEach(userId => {
        const stats = userStats[userId];
        console.log(`\n用户 ${userId}:`);
        console.log('- 总任务数:', stats.total);
        console.log('- 已完成:', stats.completed);
        console.log('- 总经验值:', stats.totalExp);
      });
    }
    
    // 3. 测试云函数调用
    console.log('\n🧪 测试云函数调用:');
    if (petsQuery.data.length > 0) {
      const testUserId = petsQuery.data[0].user_id;
      console.log('测试用户ID:', testUserId);
      
      // 模拟调用getPetStatus
      try {
        const result = await testGetPetStatus(testUserId);
        console.log('\n云函数返回结果:');
        console.log('- success:', result.success);
        if (result.success) {
          console.log('- companionDays:', result.data.companionDays);
          console.log('- totalExp:', result.data.totalExp);
          console.log('- created_at:', result.data.created_at);
          console.log('- _createTime:', result.data._createTime);
        } else {
          console.log('- error:', result.error);
        }
      } catch (error) {
        console.error('❌ 云函数调用失败:', error);
      }
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出错:', error);
  }
}

// 模拟getPetStatus函数
async function testGetPetStatus(userId) {
  try {
    const petQuery = await db.collection('pets').where({
      user_id: userId
    }).get();
    
    if (petQuery.data.length === 0) {
      return {
        success: false,
        error: '宠物不存在'
      };
    }
    
    const pet = petQuery.data[0];
    
    // 计算陪伴天数
    const companionDays = calculateCompanionDays(pet.created_at || pet._createTime);
    
    // 计算总经验值
    const totalExp = await calculateTotalExp(userId);
    
    return {
      success: true,
      data: {
        ...pet,
        companionDays: companionDays,
        totalExp: totalExp
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// 计算陪伴天数
function calculateCompanionDays(createTime) {
  if (!createTime) {
    console.log('⚠️ createTime为空');
    return 0;
  }
  
  const now = new Date();
  const created = new Date(createTime);
  const timeDiff = now.getTime() - created.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  console.log('陪伴天数计算详情:', {
    createTime,
    now: now.toISOString(),
    created: created.toISOString(),
    timeDiff,
    daysDiff
  });
  
  return Math.max(daysDiff, 0);
}

// 计算总经验值
async function calculateTotalExp(userId) {
  try {
    const taskRecords = await db.collection('task_records')
      .where({
        user_id: userId,
        status: 'completed'
      })
      .get();
    
    let totalExp = 0;
    
    console.log(`找到 ${taskRecords.data.length} 条已完成的任务记录`);
    
    taskRecords.data.forEach(record => {
      if (record.task_info && record.task_info.reward_exp) {
        totalExp += record.task_info.reward_exp;
        console.log('任务经验:', record.task_info.reward_exp, '累计:', totalExp);
      } else {
        console.log('⚠️ 任务记录缺少经验值信息:', record._id);
      }
    });
    
    return totalExp;
    
  } catch (error) {
    console.error('计算总经验值失败:', error);
    return 0;
  }
}

// 执行调试
debugCompanionStats().then(() => {
  console.log('\n✅ 调试完成');
}).catch(error => {
  console.error('❌ 调试失败:', error);
});