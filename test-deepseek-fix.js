const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: 'healthypet-3g0ib8ub8b5b8b8b' // 替换为你的环境ID
});

/**
 * 测试修复后的DeepSeek API
 */
async function testDeepSeekFix() {
  console.log('开始测试修复后的DeepSeek API...');
  
  try {
    // 测试简单消息
    console.log('\n=== 测试1: 简单消息 ===');
    const result1 = await cloud.callFunction({
      name: 'petChat',
      data: {
        message: '你好小绿！'
      }
    });
    
    console.log('测试1结果:', JSON.stringify(result1.result, null, 2));
    
    // 等待一下再进行下一个测试
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 测试较长消息
    console.log('\n=== 测试2: 较长消息 ===');
    const result2 = await cloud.callFunction({
      name: 'petChat',
      data: {
        message: '今天天气真好，我想和你一起出去玩，你觉得怎么样？我们可以去公园散步，或者在家里玩游戏。'
      }
    });
    
    console.log('测试2结果:', JSON.stringify(result2.result, null, 2));
    
    // 等待一下再进行下一个测试
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 测试连续对话
    console.log('\n=== 测试3: 连续对话 ===');
    const result3 = await cloud.callFunction({
      name: 'petChat',
      data: {
        message: '摸摸头'
      }
    });
    
    console.log('测试3结果:', JSON.stringify(result3.result, null, 2));
    
    console.log('\n✅ 所有测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testDeepSeekFix();