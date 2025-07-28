const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: 'healthypet-8g0qqkqy6e0e5c9a' // 替换为你的环境ID
});

const db = cloud.database();

/**
 * 清理健康数据重复记录脚本
 * 解决health_data表中重复数据问题
 */
async function cleanHealthData() {
  console.log('🧹 开始清理健康数据重复记录...');
  
  try {
    // 获取所有健康数据
    const allData = await db.collection('health_data')
      .orderBy('user_id', 'asc')
      .orderBy('date', 'asc')
      .orderBy('updated_at', 'desc')
      .get();
    
    console.log(`📊 总共找到 ${allData.data.length} 条健康数据记录`);
    
    // 按用户和日期分组
    const groupedData = {};
    allData.data.forEach(record => {
      const key = `${record.user_id}_${record.date}`;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(record);
    });
    
    let totalDeleted = 0;
    let processedGroups = 0;
    
    // 处理每个分组
    for (const [key, records] of Object.entries(groupedData)) {
      processedGroups++;
      
      if (records.length > 1) {
        console.log(`🔍 发现重复记录: ${key}, 共 ${records.length} 条`);
        
        // 保留第一条（最新的），删除其余的
        const recordsToDelete = records.slice(1);
        
        for (const record of recordsToDelete) {
          try {
            await db.collection('health_data').doc(record._id).remove();
            console.log(`❌ 删除重复记录: ${record._id}`);
            totalDeleted++;
          } catch (error) {
            console.error(`删除记录失败: ${record._id}`, error);
          }
        }
        
        // 检查保留的记录是否有正确的字段结构
        const keepRecord = records[0];
        const needsUpdate = !keepRecord.hasOwnProperty('water_ml') || 
                           !keepRecord.hasOwnProperty('sleep_hours') || 
                           !keepRecord.hasOwnProperty('exercise_minutes');
        
        if (needsUpdate) {
          console.log(`🔧 更新记录字段结构: ${keepRecord._id}`);
          
          const updateData = {
            steps: keepRecord.steps || 0,
            water_ml: keepRecord.water_ml || 0,
            sleep_hours: keepRecord.sleep_hours || 0,
            exercise_minutes: keepRecord.exercise_minutes || 0,
            calories: keepRecord.calories || 0,
            weight: keepRecord.weight || 0,
            source: keepRecord.source || 'manual',
            updated_at: new Date()
          };
          
          try {
            await db.collection('health_data').doc(keepRecord._id).update({
              data: updateData
            });
            console.log(`✅ 字段结构更新成功: ${keepRecord._id}`);
          } catch (error) {
            console.error(`更新字段结构失败: ${keepRecord._id}`, error);
          }
        }
      }
      
      // 每处理100个分组显示一次进度
      if (processedGroups % 100 === 0) {
        console.log(`📈 进度: ${processedGroups}/${Object.keys(groupedData).length}`);
      }
    }
    
    console.log('\n🎉 清理完成！');
    console.log(`📊 统计信息:`);
    console.log(`  - 处理的分组数: ${Object.keys(groupedData).length}`);
    console.log(`  - 删除的重复记录: ${totalDeleted}`);
    console.log(`  - 剩余记录数: ${allData.data.length - totalDeleted}`);
    
    // 验证清理结果
    await verifyCleanup();
    
  } catch (error) {
    console.error('❌ 清理过程中出错:', error);
  }
}

/**
 * 验证清理结果
 */
async function verifyCleanup() {
  console.log('\n🔍 验证清理结果...');
  
  try {
    const allData = await db.collection('health_data')
      .orderBy('user_id', 'asc')
      .orderBy('date', 'asc')
      .get();
    
    // 检查是否还有重复记录
    const groupedData = {};
    allData.data.forEach(record => {
      const key = `${record.user_id}_${record.date}`;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(record);
    });
    
    const duplicateGroups = Object.entries(groupedData).filter(([key, records]) => records.length > 1);
    
    if (duplicateGroups.length === 0) {
      console.log('✅ 验证通过：没有发现重复记录');
    } else {
      console.log(`⚠️  仍有 ${duplicateGroups.length} 个分组存在重复记录`);
      duplicateGroups.forEach(([key, records]) => {
        console.log(`  - ${key}: ${records.length} 条记录`);
      });
    }
    
    // 检查字段结构
    const recordsWithMissingFields = allData.data.filter(record => 
      !record.hasOwnProperty('water_ml') || 
      !record.hasOwnProperty('sleep_hours') || 
      !record.hasOwnProperty('exercise_minutes')
    );
    
    if (recordsWithMissingFields.length === 0) {
      console.log('✅ 验证通过：所有记录都有正确的字段结构');
    } else {
      console.log(`⚠️  有 ${recordsWithMissingFields.length} 条记录缺少必要字段`);
    }
    
    console.log(`\n📊 最终统计:`);
    console.log(`  - 总记录数: ${allData.data.length}`);
    console.log(`  - 唯一用户-日期组合: ${Object.keys(groupedData).length}`);
    
  } catch (error) {
    console.error('❌ 验证过程中出错:', error);
  }
}

/**
 * 显示当前数据状态
 */
async function showDataStatus() {
  console.log('📊 当前健康数据状态:');
  
  try {
    const allData = await db.collection('health_data')
      .orderBy('user_id', 'asc')
      .orderBy('date', 'asc')
      .get();
    
    console.log(`总记录数: ${allData.data.length}`);
    
    // 按用户分组统计
    const userStats = {};
    allData.data.forEach(record => {
      if (!userStats[record.user_id]) {
        userStats[record.user_id] = {
          total: 0,
          dates: new Set()
        };
      }
      userStats[record.user_id].total++;
      userStats[record.user_id].dates.add(record.date);
    });
    
    console.log('\n用户统计:');
    Object.entries(userStats).forEach(([userId, stats]) => {
      const duplicateRatio = ((stats.total - stats.dates.size) / stats.total * 100).toFixed(1);
      console.log(`  ${userId}: ${stats.total} 条记录, ${stats.dates.size} 个唯一日期, 重复率: ${duplicateRatio}%`);
    });
    
  } catch (error) {
    console.error('❌ 获取数据状态失败:', error);
  }
}

// 主函数
async function main() {
  console.log('🚀 健康数据清理工具启动');
  console.log('================================\n');
  
  // 显示当前状态
  await showDataStatus();
  
  console.log('\n================================');
  
  // 执行清理
  await cleanHealthData();
  
  console.log('\n================================');
  console.log('🏁 清理工具执行完成');
}

// 运行清理脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  cleanHealthData,
  verifyCleanup,
  showDataStatus
};