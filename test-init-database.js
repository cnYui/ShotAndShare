/**
 * 测试 initDatabase 云函数
 * 使用微信云开发 SDK 调用云函数
 */

const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: 'cloud1-6g4qsd2kcddd1be0'
});

async function testInitDatabase() {
  try {
    console.log('开始调用 initDatabase 云函数...');
    
    const result = await cloud.callFunction({
      name: 'initDatabase',
      data: {}
    });
    
    console.log('云函数调用成功:');
    console.log('返回结果:', JSON.stringify(result.result, null, 2));
    
    if (result.result.success) {
      console.log('\n数据库初始化成功！');
      console.log('操作结果:');
      result.result.data.forEach((item, index) => {
        console.log(`${index + 1}. ${item}`);
      });
    } else {
      console.log('\n数据库初始化失败:', result.result.error);
    }
    
  } catch (error) {
    console.error('调用云函数失败:', error);
  }
}

// 执行测试
testInitDatabase();