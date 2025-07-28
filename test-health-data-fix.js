const axios = require('axios');
require('dotenv').config();

/**
 * 测试健康数据修复功能
 * 验证饮水、睡眠、运动数据的正确录入和更新
 */

// 模拟云函数调用
const CLOUD_FUNCTION_URL = 'https://tcb-api.tencentcloudapi.com/web';
const ENV_ID = process.env.ENV_ID || 'healthypet-8g0qqkqy6e0e5c9a';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

/**
 * 调用云函数
 */
async function callCloudFunction(functionName, data) {
  try {
    const response = await axios.post(`${CLOUD_FUNCTION_URL}`, {
      action: 'functions.invoke',
      function_name: functionName,
      request_data: data
    }, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    return response.data;
  } catch (error) {
    console.error(`调用云函数 ${functionName} 失败:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 测试健康数据录入
 */
async function testHealthDataInput() {
  console.log('🧪 测试健康数据录入功能...');
  
  const testUserId = 'test_user_health_' + Date.now();
  
  // 测试数据
  const healthData = {
    water_ml: 500,        // 饮水量 500ml
    sleep_hours: 7.5,     // 睡眠时长 7.5小时
    exercise_minutes: 30, // 运动时间 30分钟
    steps: 8000,          // 步数 8000步
    calories: 320,        // 卡路里 320卡
    weight: 65.5          // 体重 65.5kg
  };
  
  console.log('📤 录入健康数据:', healthData);
  
  const result = await callCloudFunction('healthDataManager', {
    action: 'inputHealthData',
    healthData: healthData,
    openid: testUserId
  });
  
  if (result.success) {
    console.log('✅ 健康数据录入成功');
    console.log('📊 录入结果:', JSON.stringify(result.data, null, 2));
    return { success: true, userId: testUserId, data: result.data };
  } else {
    console.log('❌ 健康数据录入失败:', result.error);
    return { success: false, error: result.error };
  }
}

/**
 * 测试健康数据更新
 */
async function testHealthDataUpdate(userId) {
  console.log('\n🔄 测试健康数据更新功能...');
  
  // 更新数据（只更新部分字段）
  const updateData = {
    water_ml: 800,        // 增加饮水量到 800ml
    exercise_minutes: 45  // 增加运动时间到 45分钟
  };
  
  console.log('📤 更新健康数据:', updateData);
  
  const result = await callCloudFunction('healthDataManager', {
    action: 'inputHealthData',
    healthData: updateData,
    openid: userId
  });
  
  if (result.success) {
    console.log('✅ 健康数据更新成功');
    console.log('📊 更新结果:', JSON.stringify(result.data, null, 2));
    return { success: true, data: result.data };
  } else {
    console.log('❌ 健康数据更新失败:', result.error);
    return { success: false, error: result.error };
  }
}

/**
 * 测试健康数据查询
 */
async function testHealthDataQuery(userId) {
  console.log('\n🔍 测试健康数据查询功能...');
  
  const today = new Date().toISOString().split('T')[0];
  
  const result = await callCloudFunction('healthDataManager', {
    action: 'getHealthData',
    startDate: today,
    endDate: today,
    openid: userId
  });
  
  if (result.success) {
    console.log('✅ 健康数据查询成功');
    console.log('📊 查询结果:', JSON.stringify(result.data, null, 2));
    
    // 验证数据完整性
    if (result.data && result.data.length > 0) {
      const record = result.data[0];
      const requiredFields = ['water_ml', 'sleep_hours', 'exercise_minutes', 'steps', 'calories', 'weight'];
      const missingFields = requiredFields.filter(field => !record.hasOwnProperty(field));
      
      if (missingFields.length === 0) {
        console.log('✅ 数据字段完整');
      } else {
        console.log('⚠️  缺少字段:', missingFields);
      }
    }
    
    return { success: true, data: result.data };
  } else {
    console.log('❌ 健康数据查询失败:', result.error);
    return { success: false, error: result.error };
  }
}

/**
 * 测试重复数据处理
 */
async function testDuplicateDataHandling(userId) {
  console.log('\n🔄 测试重复数据处理...');
  
  // 尝试再次录入相同日期的数据
  const duplicateData = {
    water_ml: 1000,
    sleep_hours: 8,
    exercise_minutes: 60
  };
  
  console.log('📤 录入重复日期数据:', duplicateData);
  
  const result = await callCloudFunction('healthDataManager', {
    action: 'inputHealthData',
    healthData: duplicateData,
    openid: userId
  });
  
  if (result.success) {
    console.log('✅ 重复数据处理成功（应该是更新而不是新增）');
    
    // 查询验证是否只有一条记录
    const queryResult = await testHealthDataQuery(userId);
    if (queryResult.success && queryResult.data.length === 1) {
      console.log('✅ 验证通过：同一天只有一条记录');
      console.log('📊 最终数据:', JSON.stringify(queryResult.data[0], null, 2));
    } else {
      console.log('❌ 验证失败：发现重复记录');
    }
    
    return { success: true };
  } else {
    console.log('❌ 重复数据处理失败:', result.error);
    return { success: false, error: result.error };
  }
}

/**
 * 测试清理重复数据功能
 */
async function testCleanDuplicateData(userId) {
  console.log('\n🧹 测试清理重复数据功能...');
  
  const today = new Date().toISOString().split('T')[0];
  
  const result = await callCloudFunction('healthDataManager', {
    action: 'cleanDuplicateData',
    date: today,
    openid: userId
  });
  
  if (result.success) {
    console.log('✅ 清理重复数据成功');
    console.log('📊 清理结果:', JSON.stringify(result, null, 2));
    return { success: true, data: result };
  } else {
    console.log('❌ 清理重复数据失败:', result.error);
    return { success: false, error: result.error };
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始健康数据功能测试');
  console.log('================================\n');
  
  let testResults = {
    input: false,
    update: false,
    query: false,
    duplicate: false,
    clean: false
  };
  
  try {
    // 1. 测试数据录入
    const inputResult = await testHealthDataInput();
    testResults.input = inputResult.success;
    
    if (!inputResult.success) {
      console.log('❌ 数据录入测试失败，停止后续测试');
      return;
    }
    
    const userId = inputResult.userId;
    
    // 2. 测试数据更新
    const updateResult = await testHealthDataUpdate(userId);
    testResults.update = updateResult.success;
    
    // 3. 测试数据查询
    const queryResult = await testHealthDataQuery(userId);
    testResults.query = queryResult.success;
    
    // 4. 测试重复数据处理
    const duplicateResult = await testDuplicateDataHandling(userId);
    testResults.duplicate = duplicateResult.success;
    
    // 5. 测试清理功能
    const cleanResult = await testCleanDuplicateData(userId);
    testResults.clean = cleanResult.success;
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  }
  
  // 输出测试结果
  console.log('\n================================');
  console.log('📊 测试结果汇总:');
  console.log(`  数据录入: ${testResults.input ? '✅ 通过' : '❌ 失败'}`);
  console.log(`  数据更新: ${testResults.update ? '✅ 通过' : '❌ 失败'}`);
  console.log(`  数据查询: ${testResults.query ? '✅ 通过' : '❌ 失败'}`);
  console.log(`  重复处理: ${testResults.duplicate ? '✅ 通过' : '❌ 失败'}`);
  console.log(`  数据清理: ${testResults.clean ? '✅ 通过' : '❌ 失败'}`);
  
  const passedTests = Object.values(testResults).filter(result => result).length;
  const totalTests = Object.keys(testResults).length;
  
  console.log(`\n🎯 总体结果: ${passedTests}/${totalTests} 项测试通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！健康数据功能修复成功！');
  } else {
    console.log('⚠️  部分测试失败，请检查相关功能');
  }
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testHealthDataInput,
  testHealthDataUpdate,
  testHealthDataQuery,
  testDuplicateDataHandling,
  testCleanDuplicateData,
  runTests
};