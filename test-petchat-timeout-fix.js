const axios = require('axios');
require('dotenv').config();

// 云函数调用配置
const CLOUD_FUNCTION_URL = 'https://tcb-api.tencentcloudapi.com/web';
const ENV_ID = process.env.ENV_ID || 'healthypet-8g0qqkqy6e0e5c9a';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

/**
 * 测试宠物聊天超时处理
 */
async function testPetChatTimeout() {
  console.log('🧪 开始测试宠物聊天超时处理...');
  
  try {
    // 模拟用户数据
    const testData = {
      openid: 'test_user_timeout',
      message: '你好，我的小宠物！'
    };
    
    console.log('📤 发送测试消息:', testData.message);
    
    const startTime = Date.now();
    
    // 调用云函数
    const response = await axios.post(`${CLOUD_FUNCTION_URL}`, {
      action: 'functions.invoke',
      function_name: 'petChat',
      request_data: testData
    }, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 25000 // 25秒超时
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️  响应时间: ${duration}ms`);
    console.log('📥 云函数响应:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ 测试成功！');
      console.log('🐾 宠物回复:', response.data.data.reply);
      
      // 检查是否是降级回复
      const reply = response.data.data.reply;
      if (reply.includes('网络') || reply.includes('慢') || reply.includes('困')) {
        console.log('🔄 检测到降级回复，超时处理正常');
      } else {
        console.log('🎯 收到正常AI回复');
      }
    } else {
      console.log('❌ 测试失败:', response.data.error);
    }
    
  } catch (error) {
    console.error('💥 测试出错:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.log('⏰ 请求超时，这可能表明云函数响应时间过长');
    }
  }
}

/**
 * 测试多次调用以验证稳定性
 */
async function testMultipleCalls() {
  console.log('\n🔄 开始多次调用测试...');
  
  const testMessages = [
    '你好！',
    '今天天气怎么样？',
    '我想和你玩游戏',
    '你饿了吗？',
    '晚安！'
  ];
  
  for (let i = 0; i < testMessages.length; i++) {
    console.log(`\n--- 第 ${i + 1} 次测试 ---`);
    
    try {
      const testData = {
        openid: 'test_user_multiple',
        message: testMessages[i]
      };
      
      const startTime = Date.now();
      
      const response = await axios.post(`${CLOUD_FUNCTION_URL}`, {
        action: 'functions.invoke',
        function_name: 'petChat',
        request_data: testData
      }, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      const duration = Date.now() - startTime;
      
      console.log(`消息: "${testMessages[i]}"`);
      console.log(`响应时间: ${duration}ms`);
      
      if (response.data.success) {
        console.log(`回复: "${response.data.data.reply}"`);
        console.log('✅ 成功');
      } else {
        console.log(`❌ 失败: ${response.data.error}`);
      }
      
      // 等待1秒再进行下一次测试
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ 第 ${i + 1} 次测试失败:`, error.message);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 宠物聊天超时处理测试');
  console.log('================================');
  
  // 检查环境变量
  if (!ACCESS_TOKEN) {
    console.error('❌ 缺少 ACCESS_TOKEN 环境变量');
    console.log('请在 .env 文件中设置 ACCESS_TOKEN');
    return;
  }
  
  console.log('🔧 环境配置:');
  console.log('- ENV_ID:', ENV_ID);
  console.log('- ACCESS_TOKEN:', ACCESS_TOKEN ? '已配置' : '未配置');
  console.log('');
  
  // 执行测试
  await testPetChatTimeout();
  await testMultipleCalls();
  
  console.log('\n🎉 测试完成！');
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testPetChatTimeout,
  testMultipleCalls
};