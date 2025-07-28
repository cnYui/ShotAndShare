const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: 'healthypet-3g0b6bqy8c0e8c5a' // 请替换为你的云开发环境ID
});

const db = cloud.database();

/**
 * 测试健康数据清理功能
 */
async function testHealthDataCleanup() {
  console.log('开始测试健康数据清理功能...');
  
  try {
    // 1. 查看当前数据库中的重复数据情况
    console.log('\n=== 查看当前数据库状态 ===');
    const allData = await db.collection('health_data')
      .orderBy('date', 'desc')
      .orderBy('updated_at', 'desc')
      .get();
    
    console.log(`总记录数: ${allData.data.length}`);
    
    // 按用户和日期分组统计
    const groupedData = {};
    allData.data.forEach(record => {
      const key = `${record.user_id}_${record.date}`;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(record);
    });
    
    // 找出重复的记录
    const duplicates = Object.entries(groupedData).filter(([key, records]) => records.length > 1);
    console.log(`发现重复数据组: ${duplicates.length}`);
    
    duplicates.forEach(([key, records]) => {
      const [userId, date] = key.split('_');
      console.log(`- 用户${userId}, 日期${date}: ${records.length}条记录`);
      records.forEach((record, index) => {
        console.log(`  ${index + 1}. ID: ${record._id}, 步数: ${record.steps || 0}, 更新时间: ${record.updated_at}`);
      });
    });
    
    // 2. 测试清理单个日期的重复数据
    if (duplicates.length > 0) {
      console.log('\n=== 测试清理单个日期重复数据 ===');
      const [firstKey, firstRecords] = duplicates[0];
      const [userId, date] = firstKey.split('_');
      
      console.log(`清理用户${userId}在${date}的重复数据...`);
      
      // 调用云函数清理
      const cleanResult = await cloud.callFunction({
        name: 'healthDataManager',
        data: {
          action: 'cleanDuplicateData',
          date: date
        }
      });
      
      console.log('清理结果:', cleanResult.result);
    }
    
    // 3. 测试清理所有重复数据
    console.log('\n=== 测试清理所有重复数据 ===');
    const cleanAllResult = await cloud.callFunction({
      name: 'healthDataManager',
      data: {
        action: 'cleanAllDuplicates'
      }
    });
    
    console.log('清理所有重复数据结果:', cleanAllResult.result);
    
    // 4. 验证清理后的数据状态
    console.log('\n=== 验证清理后的数据状态 ===');
    const afterCleanData = await db.collection('health_data')
      .orderBy('date', 'desc')
      .get();
    
    console.log(`清理后总记录数: ${afterCleanData.data.length}`);
    
    // 重新检查是否还有重复数据
    const afterGroupedData = {};
    afterCleanData.data.forEach(record => {
      const key = `${record.user_id}_${record.date}`;
      if (!afterGroupedData[key]) {
        afterGroupedData[key] = [];
      }
      afterGroupedData[key].push(record);
    });
    
    const afterDuplicates = Object.entries(afterGroupedData).filter(([key, records]) => records.length > 1);
    console.log(`清理后剩余重复数据组: ${afterDuplicates.length}`);
    
    if (afterDuplicates.length === 0) {
      console.log('✅ 清理成功！没有重复数据了。');
    } else {
      console.log('⚠️ 仍有重复数据:');
      afterDuplicates.forEach(([key, records]) => {
        const [userId, date] = key.split('_');
        console.log(`- 用户${userId}, 日期${date}: ${records.length}条记录`);
      });
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

/**
 * 测试新的upsert功能
 */
async function testUpsertFunction() {
  console.log('\n=== 测试Upsert功能 ===');
  
  try {
    // 测试同步微信运动数据
    console.log('测试同步微信运动数据...');
    const syncResult = await cloud.callFunction({
      name: 'healthDataManager',
      data: {
        action: 'syncWeRunData',
        encryptedData: 'test_encrypted_data',
        iv: 'test_iv'
      }
    });
    
    console.log('同步结果:', syncResult.result);
    
    // 再次同步，验证是否会创建重复记录
    console.log('\n再次同步，验证是否会创建重复记录...');
    const syncResult2 = await cloud.callFunction({
      name: 'healthDataManager',
      data: {
        action: 'syncWeRunData',
        encryptedData: 'test_encrypted_data_2',
        iv: 'test_iv_2'
      }
    });
    
    console.log('第二次同步结果:', syncResult2.result);
    
    // 检查今天的数据记录数
    const today = new Date().toISOString().split('T')[0];
    const todayData = await db.collection('health_data')
      .where({
        date: today
      })
      .get();
    
    console.log(`今天(${today})的记录数: ${todayData.data.length}`);
    
    if (todayData.data.length === 1) {
      console.log('✅ Upsert功能正常！没有创建重复记录。');
    } else {
      console.log('⚠️ Upsert功能可能有问题，创建了多条记录。');
      todayData.data.forEach((record, index) => {
        console.log(`记录${index + 1}: ID=${record._id}, 步数=${record.steps}, 更新时间=${record.updated_at}`);
      });
    }
    
  } catch (error) {
    console.error('测试Upsert功能失败:', error);
  }
}

// 运行测试
async function runTests() {
  console.log('健康数据清理功能测试开始');
  console.log('================================');
  
  await testHealthDataCleanup();
  await testUpsertFunction();
  
  console.log('\n================================');
  console.log('测试完成');
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testHealthDataCleanup,
  testUpsertFunction,
  runTests
};