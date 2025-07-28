// 在微信开发者工具云函数测试中使用的数据库清理脚本
// 将此代码添加到 healthDataManager 云函数中，或创建新的云函数

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

/**
 * 清理健康数据重复记录的云函数
 * 使用方法：在云开发控制台测试此函数，传入参数 { "action": "cleanDuplicates" }
 */
exports.main = async (event, context) => {
  const { action } = event;
  
  if (action === 'cleanDuplicates') {
    return await cleanHealthDataDuplicates();
  }
  
  return {
    success: false,
    error: '未知操作类型'
  };
};

/**
 * 清理健康数据重复记录
 */
async function cleanHealthDataDuplicates() {
  try {
    console.log('开始清理健康数据重复记录...');
    
    // 获取所有健康数据
    const { data: allRecords } = await db.collection('health_data').get();
    console.log(`总共找到 ${allRecords.length} 条健康数据记录`);
    
    if (allRecords.length === 0) {
      return {
        success: true,
        message: '没有找到健康数据记录',
        cleaned: 0
      };
    }
    
    // 按用户和日期分组
    const groupedData = {};
    
    allRecords.forEach(record => {
      const key = `${record.user_id}_${record.date}`;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(record);
    });
    
    let duplicatesFound = 0;
    let recordsCleaned = 0;
    const cleanupResults = [];
    
    // 处理每个分组
    for (const [key, records] of Object.entries(groupedData)) {
      if (records.length > 1) {
        duplicatesFound++;
        console.log(`发现重复记录组: ${key}, 共 ${records.length} 条记录`);
        
        // 按更新时间排序，保留最新的记录
        records.sort((a, b) => {
          const timeA = new Date(a.updated_at || a.created_at || a._id.getTimestamp());
          const timeB = new Date(b.updated_at || b.created_at || b._id.getTimestamp());
          return timeB - timeA;
        });
        
        const keepRecord = records[0]; // 保留最新的记录
        const deleteRecords = records.slice(1); // 删除其余记录
        
        // 确保保留的记录包含所有必要字段
        const updatedRecord = {
          user_id: keepRecord.user_id,
          date: keepRecord.date,
          steps: keepRecord.steps || 0,
          water_ml: keepRecord.water_ml || 0,
          sleep_hours: keepRecord.sleep_hours || 0,
          exercise_minutes: keepRecord.exercise_minutes || 0,
          calories: keepRecord.calories || 0,
          weight: keepRecord.weight || 0,
          source: keepRecord.source || 'manual',
          created_at: keepRecord.created_at || new Date(),
          updated_at: new Date()
        };
        
        try {
          // 更新保留的记录，确保字段完整
          await db.collection('health_data').doc(keepRecord._id).update({
            data: updatedRecord
          });
          
          // 删除重复记录
          for (const deleteRecord of deleteRecords) {
            await db.collection('health_data').doc(deleteRecord._id).remove();
            recordsCleaned++;
          }
          
          cleanupResults.push({
            key,
            kept: keepRecord._id,
            deleted: deleteRecords.map(r => r._id),
            deletedCount: deleteRecords.length
          });
          
          console.log(`清理完成: ${key}, 保留记录 ${keepRecord._id}, 删除 ${deleteRecords.length} 条重复记录`);
          
        } catch (error) {
          console.error(`清理记录组 ${key} 时出错:`, error);
          cleanupResults.push({
            key,
            error: error.message
          });
        }
      }
    }
    
    console.log(`清理完成: 发现 ${duplicatesFound} 个重复组, 清理了 ${recordsCleaned} 条重复记录`);
    
    return {
      success: true,
      message: `清理完成`,
      totalRecords: allRecords.length,
      duplicateGroups: duplicatesFound,
      recordsCleaned: recordsCleaned,
      details: cleanupResults
    };
    
  } catch (error) {
    console.error('清理健康数据时出错:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 检查健康数据状态
 */
async function checkHealthDataStatus() {
  try {
    const { data: allRecords } = await db.collection('health_data').get();
    
    // 统计重复记录
    const groupedData = {};
    allRecords.forEach(record => {
      const key = `${record.user_id}_${record.date}`;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(record);
    });
    
    const duplicateGroups = Object.values(groupedData).filter(group => group.length > 1);
    const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + (group.length - 1), 0);
    
    // 检查字段完整性
    const incompleteRecords = allRecords.filter(record => 
      record.water_ml === undefined || 
      record.sleep_hours === undefined || 
      record.exercise_minutes === undefined
    );
    
    return {
      success: true,
      totalRecords: allRecords.length,
      duplicateGroups: duplicateGroups.length,
      totalDuplicates: totalDuplicates,
      incompleteRecords: incompleteRecords.length,
      sampleIncomplete: incompleteRecords.slice(0, 3)
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// 如果要检查数据状态，可以调用:
// { "action": "checkStatus" }
if (action === 'checkStatus') {
  return await checkHealthDataStatus();
}