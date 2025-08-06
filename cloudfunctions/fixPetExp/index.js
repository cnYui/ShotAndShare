const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    console.log('🔧 开始修复宠物经验值数据...');
    
    // 获取所有宠物数据
    const petsResult = await db.collection('pets').get();
    const pets = petsResult.data;
    
    console.log(`📊 找到 ${pets.length} 只宠物需要修复`);
    
    let fixedCount = 0;
    
    for (const pet of pets) {
      const currentLevel = pet.level || 1;
      const currentExp = pet.exp || 0;
      
      // 计算正确的当前等级内经验值
      // 如果经验值超过100，说明数据有问题，需要修复
      if (currentExp >= 100) {
        // 计算应该的等级和经验值
        let correctLevel = currentLevel;
        let correctExp = currentExp;
        
        // 如果当前经验值看起来像是总经验值，重新计算
        if (currentExp > currentLevel * 100) {
          // 这可能是总经验值，重新计算等级和经验
          correctLevel = Math.floor(currentExp / 100) + 1;
          correctExp = currentExp % 100;
        } else {
          // 只是经验值超过了100，计算正确的等级和经验
          while (correctExp >= 100) {
            correctLevel++;
            correctExp -= 100;
          }
        }
        
        console.log(`🔧 修复宠物 ${pet.pet_name}:`, {
          '原等级': pet.level,
          '原经验': pet.exp,
          '新等级': correctLevel,
          '新经验': correctExp
        });
        
        // 更新数据库
        await db.collection('pets').doc(pet._id).update({
          data: {
            level: correctLevel,
            exp: correctExp
          }
        });
        
        fixedCount++;
      } else {
        console.log(`✅ 宠物 ${pet.pet_name} 数据正常，无需修复`);
      }
    }
    
    console.log(`🎉 修复完成！共修复了 ${fixedCount} 只宠物的数据`);
    
    return {
      success: true,
      message: `修复完成！共修复了 ${fixedCount} 只宠物的数据`,
      fixedCount: fixedCount,
      totalPets: pets.length
    };
    
  } catch (error) {
    console.error('❌ 修复宠物经验值失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};