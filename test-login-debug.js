/**
 * 测试登录功能和数据库写入
 * 用于调试用户登录后数据库没有写入用户信息的问题
 */

const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: 'cloud1-6g4qsd2kcddd1be0'
});

const db = cloud.database();

async function testLoginAndDatabase() {
  try {
    console.log('开始测试登录功能和数据库写入...');
    
    // 1. 检查数据库集合是否存在
    console.log('\n1. 检查数据库集合状态:');
    
    try {
      const usersCount = await db.collection('pet_users').count();
      console.log(`- pet_users 集合存在，当前记录数: ${usersCount.total}`);
    } catch (e) {
      console.log('- pet_users 集合不存在或无法访问:', e.message);
    }
    
    try {
      const petsCount = await db.collection('pets').count();
      console.log(`- pets 集合存在，当前记录数: ${petsCount.total}`);
    } catch (e) {
      console.log('- pets 集合不存在或无法访问:', e.message);
    }
    
    try {
      const tasksCount = await db.collection('tasks').count();
      console.log(`- tasks 集合存在，当前记录数: ${tasksCount.total}`);
    } catch (e) {
      console.log('- tasks 集合不存在或无法访问:', e.message);
    }
    
    try {
      const taskRecordsCount = await db.collection('task_records').count();
      console.log(`- task_records 集合存在，当前记录数: ${taskRecordsCount.total}`);
    } catch (e) {
      console.log('- task_records 集合不存在或无法访问:', e.message);
    }
    
    // 2. 查看现有用户数据
    console.log('\n2. 查看现有用户数据:');
    try {
      const users = await db.collection('pet_users').limit(5).get();
      if (users.data.length > 0) {
        console.log('现有用户:');
        users.data.forEach((user, index) => {
          console.log(`  ${index + 1}. 用户ID: ${user.user_id}, 昵称: ${user.nickname}, 加入时间: ${user.join_date}`);
        });
      } else {
        console.log('暂无用户数据');
      }
    } catch (e) {
      console.log('查询用户数据失败:', e.message);
    }
    
    // 3. 查看现有宠物数据
    console.log('\n3. 查看现有宠物数据:');
    try {
      const pets = await db.collection('pets').limit(5).get();
      if (pets.data.length > 0) {
        console.log('现有宠物:');
        pets.data.forEach((pet, index) => {
          console.log(`  ${index + 1}. 宠物名: ${pet.pet_name}, 主人ID: ${pet.user_id}, 等级: ${pet.level}`);
        });
      } else {
        console.log('暂无宠物数据');
      }
    } catch (e) {
      console.log('查询宠物数据失败:', e.message);
    }
    
    // 4. 测试模拟登录（不会真正创建用户，只是测试逻辑）
    console.log('\n4. 测试登录云函数调用:');
    try {
      // 注意：这里无法真正模拟微信用户登录，因为需要真实的openid
      // 但我们可以检查云函数是否可以正常调用
      console.log('由于需要真实的微信用户上下文，无法在此环境下完全测试登录功能');
      console.log('建议在微信开发者工具中测试登录功能');
    } catch (e) {
      console.log('登录测试失败:', e.message);
    }
    
    console.log('\n测试完成！');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 执行测试
testLoginAndDatabase();