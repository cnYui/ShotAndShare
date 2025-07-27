const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: 'cloud1-6g4qsd2kcddd1be0'
});

// 测试petChat云函数
async function testPetChat() {
  console.log('🧪 开始测试petChat云函数...');
  
  try {
    const result = await cloud.callFunction({
      name: 'petChat',
      data: {
        message: 'hi',
        userId: 'test-user-123',
        petId: 'test-pet-456'
      }
    });
    
    console.log('✅ 云函数调用成功！');
    console.log('📝 返回结果:', JSON.stringify(result.result, null, 2));
    
    if (result.result.success) {
      console.log('🐱 宠物回复:', result.result.reply);
      console.log('📊 宠物状态:', result.result.petStatus);
    } else {
      console.log('❌ 云函数执行失败:', result.result.error);
    }
    
  } catch (error) {
    console.error('❌ 云函数调用失败:', error);
  }
}

// 运行测试
testPetChat();