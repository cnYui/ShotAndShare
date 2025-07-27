/**
 * 测试petChat云函数超时修复
 */
const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: 'cloud1-6g4qsd2kcddd1be0'
});

async function testPetChat() {
  console.log('开始测试petChat云函数...');
  
  try {
    const result = await cloud.callFunction({
      name: 'petChat',
      data: {
        message: '你好，小宠物！'
      }
    });
    
    console.log('✅ petChat调用成功:');
    console.log('返回结果:', JSON.stringify(result.result, null, 2));
    
    if (result.result.success) {
      console.log('✅ 宠物回复:', result.result.data.reply);
    } else {
      console.log('❌ 调用失败:', result.result.error);
    }
    
  } catch (error) {
    console.error('❌ petChat调用异常:', error);
    
    if (error.message.includes('timeout') || error.message.includes('TIME_LIMIT_EXCEEDED')) {
      console.log('⚠️  仍然存在超时问题，需要进一步优化');
    }
  }
}

// 测试多次调用
async function testMultipleCalls() {
  console.log('\n开始测试多次调用...');
  
  const messages = [
    '你好！',
    '今天天气怎么样？',
    '我想和你聊天',
    '你最喜欢什么？'
  ];
  
  for (let i = 0; i < messages.length; i++) {
    console.log(`\n--- 第${i + 1}次调用 ---`);
    console.log('发送消息:', messages[i]);
    
    const startTime = Date.now();
    
    try {
      const result = await cloud.callFunction({
        name: 'petChat',
        data: {
          message: messages[i]
        }
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`⏱️  响应时间: ${duration}ms`);
      
      if (result.result.success) {
        console.log('✅ 宠物回复:', result.result.data.reply);
      } else {
        console.log('❌ 调用失败:', result.result.error);
      }
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`⏱️  失败时间: ${duration}ms`);
      console.error('❌ 调用异常:', error.message);
    }
    
    // 等待1秒再进行下一次调用
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function main() {
  console.log('=== petChat云函数超时修复测试 ===\n');
  
  // 单次测试
  await testPetChat();
  
  // 多次测试
  await testMultipleCalls();
  
  console.log('\n=== 测试完成 ===');
  console.log('\n修复说明:');
  console.log('1. 将API超时时间从10秒减少到2秒');
  console.log('2. 减少max_tokens从150到100');
  console.log('3. 添加超时降级机制，返回预设回复');
  console.log('4. 优化错误处理，确保用户始终能收到回复');
}

// 运行测试
main().catch(console.error);