// 测试petChat云函数
const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: 'cloud1-6g4qsd2kcddd1be0'
});

async function testPetChat() {
  try {
    console.log('开始测试petChat云函数...');
    
    const result = await cloud.callFunction({
      name: 'petChat',
      data: {
        message: '你好，小宠物！'
      }
    });
    
    console.log('测试结果:', result);
    
    if (result.result.success) {
      console.log('✅ petChat云函数测试成功！');
      console.log('宠物回复:', result.result.data.reply);
    } else {
      console.log('❌ petChat云函数测试失败:', result.result.error);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

// 运行测试
testPetChat();