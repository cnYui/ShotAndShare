/**
 * 健康养宠小程序后端功能测试脚本
 * 用于验证云函数和数据库是否正常工作
 */

// 测试配置
const TEST_CONFIG = {
  // 测试用户信息
  testUser: {
    nickName: '测试用户',
    avatarUrl: 'https://example.com/avatar.jpg'
  },
  // 测试宠物信息
  testPet: {
    name: '小白',
    type: 'cat',
    breed: '英短',
    age: 2,
    gender: 'female'
  }
};

/**
 * 测试数据库初始化
 */
async function testDatabaseInit() {
  console.log('🔄 测试数据库初始化...');
  
  try {
    const result = await wx.cloud.callFunction({
      name: 'initDatabase'
    });
    
    if (result.result.success) {
      console.log('✅ 数据库初始化成功');
      console.log('📊 创建的集合:', result.result.data);
      return true;
    } else {
      console.error('❌ 数据库初始化失败:', result.result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ 数据库初始化异常:', error);
    return false;
  }
}

/**
 * 测试用户登录功能
 */
async function testUserLogin() {
  console.log('🔄 测试用户登录功能...');
  
  try {
    // 模拟微信登录
    const loginResult = await wx.login();
    
    const result = await wx.cloud.callFunction({
      name: 'login',
      data: {
        code: loginResult.code,
        userInfo: TEST_CONFIG.testUser
      }
    });
    
    if (result.result.success) {
      console.log('✅ 用户登录成功');
      console.log('👤 用户信息:', result.result.data.user);
      return result.result.data.user;
    } else {
      console.error('❌ 用户登录失败:', result.result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ 用户登录异常:', error);
    return null;
  }
}

/**
 * 测试宠物管理功能
 */
async function testPetManager() {
  console.log('🔄 测试宠物管理功能...');
  
  try {
    // 创建宠物
    const createResult = await wx.cloud.callFunction({
      name: 'petManager',
      data: {
        action: 'create',
        petData: TEST_CONFIG.testPet
      }
    });
    
    if (createResult.result.success) {
      console.log('✅ 宠物创建成功');
      console.log('🐱 宠物信息:', createResult.result.data);
      
      // 获取宠物列表
      const listResult = await wx.cloud.callFunction({
        name: 'petManager',
        data: {
          action: 'list'
        }
      });
      
      if (listResult.result.success) {
        console.log('✅ 宠物列表获取成功');
        console.log('📋 宠物数量:', listResult.result.data.length);
        return createResult.result.data;
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ 宠物管理测试异常:', error);
    return null;
  }
}

/**
 * 测试任务管理功能
 */
async function testTaskManager() {
  console.log('🔄 测试任务管理功能...');
  
  try {
    // 获取任务列表
    const tasksResult = await wx.cloud.callFunction({
      name: 'taskManager',
      data: {
        action: 'getTasks'
      }
    });
    
    if (tasksResult.result.success) {
      console.log('✅ 任务列表获取成功');
      console.log('📝 任务数量:', tasksResult.result.data.length);
      
      // 测试完成第一个任务
      if (tasksResult.result.data.length > 0) {
        const firstTask = tasksResult.result.data[0];
        
        const completeResult = await wx.cloud.callFunction({
          name: 'taskManager',
          data: {
            action: 'completeTask',
            taskId: firstTask._id,
            value: firstTask.target_value
          }
        });
        
        if (completeResult.result.success) {
          console.log('✅ 任务完成测试成功');
          console.log('🎯 获得经验:', completeResult.result.data.exp_gained);
        }
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ 任务管理测试异常:', error);
    return false;
  }
}

/**
 * 测试智能聊天功能
 */
async function testPetChat(petId) {
  console.log('🔄 测试智能聊天功能...');
  
  try {
    const result = await wx.cloud.callFunction({
      name: 'petChat',
      data: {
        message: '你好，小宠物！今天天气怎么样？',
        petId: petId
      }
    });
    
    if (result.result.success) {
      console.log('✅ 智能聊天测试成功');
      console.log('💬 AI回复:', result.result.data.reply);
      return true;
    } else {
      console.error('❌ 智能聊天失败:', result.result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ 智能聊天测试异常:', error);
    return false;
  }
}

/**
 * 测试健康数据管理
 */
async function testHealthDataManager() {
  console.log('🔄 测试健康数据管理功能...');
  
  try {
    // 添加健康数据
    const addResult = await wx.cloud.callFunction({
      name: 'healthDataManager',
      data: {
        action: 'add',
        data: {
          type: 'steps',
          value: 8000,
          date: new Date().toISOString().split('T')[0]
        }
      }
    });
    
    if (addResult.result.success) {
      console.log('✅ 健康数据添加成功');
      
      // 获取健康数据
      const getResult = await wx.cloud.callFunction({
        name: 'healthDataManager',
        data: {
          action: 'get',
          type: 'steps',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        }
      });
      
      if (getResult.result.success) {
        console.log('✅ 健康数据获取成功');
        console.log('📊 数据条数:', getResult.result.data.length);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ 健康数据管理测试异常:', error);
    return false;
  }
}

/**
 * 运行完整测试套件
 */
async function runFullTest() {
  console.log('🚀 开始后端功能完整测试...');
  console.log('=' .repeat(50));
  
  const results = {
    database: false,
    login: false,
    pet: false,
    task: false,
    chat: false,
    health: false
  };
  
  // 1. 测试数据库初始化
  results.database = await testDatabaseInit();
  console.log('');
  
  // 2. 测试用户登录
  const user = await testUserLogin();
  results.login = !!user;
  console.log('');
  
  // 3. 测试宠物管理
  const pet = await testPetManager();
  results.pet = !!pet;
  console.log('');
  
  // 4. 测试任务管理
  results.task = await testTaskManager();
  console.log('');
  
  // 5. 测试智能聊天（需要宠物ID）
  if (pet && pet._id) {
    results.chat = await testPetChat(pet._id);
  }
  console.log('');
  
  // 6. 测试健康数据管理
  results.health = await testHealthDataManager();
  console.log('');
  
  // 输出测试结果
  console.log('📋 测试结果汇总:');
  console.log('=' .repeat(50));
  console.log(`数据库初始化: ${results.database ? '✅ 通过' : '❌ 失败'}`);
  console.log(`用户登录: ${results.login ? '✅ 通过' : '❌ 失败'}`);
  console.log(`宠物管理: ${results.pet ? '✅ 通过' : '❌ 失败'}`);
  console.log(`任务管理: ${results.task ? '✅ 通过' : '❌ 失败'}`);
  console.log(`智能聊天: ${results.chat ? '✅ 通过' : '❌ 失败'}`);
  console.log(`健康数据: ${results.health ? '✅ 通过' : '❌ 失败'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log('');
  console.log(`🎯 测试通过率: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 恭喜！所有后端功能测试通过，系统运行正常！');
  } else {
    console.log('⚠️  部分功能测试失败，请检查相关配置和代码。');
  }
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runFullTest,
    testDatabaseInit,
    testUserLogin,
    testPetManager,
    testTaskManager,
    testPetChat,
    testHealthDataManager
  };
}

// 在小程序环境中可以直接调用
if (typeof wx !== 'undefined') {
  // 可以在小程序中调用 runFullTest() 进行测试
  console.log('后端测试脚本已加载，可以调用 runFullTest() 开始测试');
}