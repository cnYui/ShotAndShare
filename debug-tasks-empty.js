/**
 * 调试健康任务为空的问题
 * 检查数据库状态和任务加载逻辑
 */

// 模拟小程序环境
const cloud = require('wx-server-sdk');

cloud.init({
  env: 'prod-9gik7h7cb5add5d9' // 替换为你的环境ID
});

const db = cloud.database();

async function debugTasksEmpty() {
  console.log('🔍 开始调试健康任务为空问题...');
  
  try {
    // 1. 检查tasks集合是否存在数据
    console.log('\n1. 检查tasks集合数据:');
    const tasksResult = await db.collection('tasks').get();
    console.log(`   - tasks集合记录数: ${tasksResult.data.length}`);
    
    if (tasksResult.data.length > 0) {
      console.log('   - 活跃任务:');
      const activeTasks = tasksResult.data.filter(task => task.is_active);
      console.log(`     活跃任务数量: ${activeTasks.length}`);
      activeTasks.forEach(task => {
        console.log(`     - ${task.name} (${task.category}) - 奖励: ${task.reward_exp}经验`);
      });
    } else {
      console.log('   ❌ tasks集合为空！需要初始化数据');
    }
    
    // 2. 检查task_records集合
    console.log('\n2. 检查task_records集合数据:');
    const taskRecordsResult = await db.collection('task_records').get();
    console.log(`   - task_records集合记录数: ${taskRecordsResult.data.length}`);
    
    if (taskRecordsResult.data.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = taskRecordsResult.data.filter(record => record.date === today);
      console.log(`   - 今日任务记录数: ${todayRecords.length}`);
      
      if (todayRecords.length > 0) {
        console.log('   - 今日任务状态:');
        todayRecords.forEach(record => {
          console.log(`     - 任务ID: ${record.task_id}, 状态: ${record.status}, 进度: ${record.progress}`);
        });
      }
    } else {
      console.log('   ❌ task_records集合为空！');
    }
    
    // 3. 检查用户数据
    console.log('\n3. 检查用户相关数据:');
    const usersResult = await db.collection('pet_users').get();
    console.log(`   - pet_users集合记录数: ${usersResult.data.length}`);
    
    const petsResult = await db.collection('pets').get();
    console.log(`   - pets集合记录数: ${petsResult.data.length}`);
    
    // 4. 模拟调用taskManager云函数
    console.log('\n4. 测试taskManager云函数:');
    
    try {
      // 模拟getDailyTasks调用
      const testUserId = 'test_user_123';
      console.log(`   - 模拟用户ID: ${testUserId}`);
      
      // 检查该用户是否有今日任务记录
      const today = new Date().toISOString().split('T')[0];
      const userTaskRecords = await db.collection('task_records')
        .where({
          user_id: testUserId,
          date: today
        })
        .get();
      
      console.log(`   - 用户今日任务记录数: ${userTaskRecords.data.length}`);
      
      if (userTaskRecords.data.length === 0) {
        console.log('   ⚠️  用户没有今日任务记录，需要初始化');
        
        // 检查是否有活跃任务可以初始化
        const activeTasksForInit = await db.collection('tasks').where({
          is_active: true
        }).get();
        
        console.log(`   - 可用于初始化的活跃任务数: ${activeTasksForInit.data.length}`);
        
        if (activeTasksForInit.data.length === 0) {
          console.log('   ❌ 没有活跃任务可以初始化！这是问题根源！');
        }
      }
      
    } catch (error) {
      console.error('   ❌ 测试taskManager时出错:', error);
    }
    
    // 5. 提供解决方案
    console.log('\n🔧 问题诊断和解决方案:');
    
    if (tasksResult.data.length === 0) {
      console.log('   ❌ 问题: tasks集合为空');
      console.log('   💡 解决方案: 需要调用initDatabase云函数初始化任务数据');
      console.log('   📝 执行命令: 在小程序中调用 wx.cloud.callFunction({ name: "initDatabase" })');
    } else {
      const activeTasks = tasksResult.data.filter(task => task.is_active);
      if (activeTasks.length === 0) {
        console.log('   ❌ 问题: 没有活跃任务 (is_active: true)');
        console.log('   💡 解决方案: 需要更新tasks集合，设置is_active为true');
      } else if (taskRecordsResult.data.length === 0) {
        console.log('   ❌ 问题: task_records集合为空');
        console.log('   💡 解决方案: 用户首次登录时会自动创建任务记录');
        console.log('   📝 建议: 检查用户登录流程和initDailyTasks函数');
      } else {
        console.log('   ✅ 数据库数据正常');
        console.log('   💡 可能问题: 前端页面加载逻辑或云函数调用失败');
        console.log('   📝 建议: 检查小程序控制台错误信息');
      }
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出错:', error);
  }
}

// 执行调试
debugTasksEmpty().then(() => {
  console.log('\n🎯 调试完成！');
}).catch(error => {
  console.error('调试失败:', error);
});

module.exports = {
  debugTasksEmpty
};