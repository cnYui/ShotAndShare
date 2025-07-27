const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

/**
 * 宠物管理云函数
 * 处理宠物相关的所有操作
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  switch (event.action) {
    case 'getPetStatus':
      return await getPetStatus(openid);
    case 'getPetInfo':
      return await getPetStatus(openid); // getPetInfo和getPetStatus功能相同
    case 'updatePetInfo':
      return await updatePetInfo(openid, event.petInfo);
    case 'feedPet':
      return await feedPet(openid);
    case 'playWithPet':
      return await playWithPet(openid);
    case 'petLevelUp':
      return await petLevelUp(openid);
    case 'getPetHistory':
      return await getPetHistory(openid);
    case 'create':
      return await createPet(openid, event.petData);
    case 'list':
      return await listPets(openid);
    default:
      return {
        success: false,
        error: '未知操作类型'
      };
  }
};

/**
 * 获取宠物状态
 */
async function getPetStatus(userId) {
  try {
    const petQuery = await db.collection('pets').where({
      user_id: userId
    }).get();
    
    if (petQuery.data.length === 0) {
      return {
        success: false,
        error: '宠物不存在'
      };
    }
    
    const pet = petQuery.data[0];
    
    // 计算实时状态值（基于时间衰减）
    const realTimeStatus = calculateRealTimeStatus(pet);
    
    // 如果状态值有变化，更新数据库
    if (realTimeStatus.health !== pet.health || 
        realTimeStatus.vitality !== pet.vitality) {
      await db.collection('pets').doc(pet._id).update({
        data: {
          health: realTimeStatus.health,
          vitality: realTimeStatus.vitality,
          last_active: new Date()
        }
      });
    }
    
    return {
      success: true,
      data: {
        ...pet,
        ...realTimeStatus,
        mood: calculateMood(realTimeStatus),
        nextLevelExp: (pet.level * 100) - pet.exp
      }
    };
    
  } catch (error) {
    console.error('获取宠物状态失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 更新宠物信息
 */
async function updatePetInfo(userId, petInfo) {
  try {
    const petQuery = await db.collection('pets').where({
      user_id: userId
    }).get();
    
    if (petQuery.data.length === 0) {
      return {
        success: false,
        error: '宠物不存在'
      };
    }
    
    const pet = petQuery.data[0];
    
    // 验证更新数据
    const allowedFields = ['pet_name', 'species'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (petInfo[field] !== undefined) {
        updateData[field] = petInfo[field];
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        error: '没有有效的更新字段'
      };
    }
    
    updateData.last_active = new Date();
    
    await db.collection('pets').doc(pet._id).update({
      data: updateData
    });
    
    return {
      success: true,
      data: {
        ...pet,
        ...updateData
      }
    };
    
  } catch (error) {
    console.error('更新宠物信息失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 喂养宠物
 */
async function feedPet(userId) {
  try {
    const petQuery = await db.collection('pets').where({
      user_id: userId
    }).get();
    
    if (petQuery.data.length === 0) {
      return {
        success: false,
        error: '宠物不存在'
      };
    }
    
    const pet = petQuery.data[0];
    
    // 检查是否可以喂养（每小时只能喂养一次）- 测试阶段已注释
    // const lastFeedTime = pet.last_feed_time || new Date(0);
    const now = new Date();
    // const timeDiff = now.getTime() - new Date(lastFeedTime).getTime();
    // const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // if (hoursDiff < 1) {
    //   return {
    //     success: false,
    //     error: `还需要等待 ${Math.ceil(60 - (timeDiff / (1000 * 60)))} 分钟才能再次喂养`
    //   };
    // }
    
    // 增加健康值和活力值
    const newHealth = Math.min(pet.health + 15, 100);
    const newVitality = Math.min(pet.vitality + 10, 100);
    
    await db.collection('pets').doc(pet._id).update({
      data: {
        health: newHealth,
        vitality: newVitality,
        last_feed_time: now,
        last_active: now
      }
    });
    
    return {
      success: true,
      data: {
        message: '喂养成功！宠物很开心~',
        health: newHealth,
        vitality: newVitality,
        healthIncrease: 15,
        vitalityIncrease: 10
      }
    };
    
  } catch (error) {
    console.error('喂养宠物失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 与宠物玩耍
 */
async function playWithPet(userId) {
  try {
    const petQuery = await db.collection('pets').where({
      user_id: userId
    }).get();
    
    if (petQuery.data.length === 0) {
      return {
        success: false,
        error: '宠物不存在'
      };
    }
    
    const pet = petQuery.data[0];
    
    // 检查是否可以玩耍（每30分钟只能玩耍一次）- 测试阶段已注释
    // const lastPlayTime = pet.last_play_time || new Date(0);
    const now = new Date();
    // const timeDiff = now.getTime() - new Date(lastPlayTime).getTime();
    // const minutesDiff = timeDiff / (1000 * 60);
    
    // if (minutesDiff < 30) {
    //   return {
    //     success: false,
    //     error: `还需要等待 ${Math.ceil(30 - minutesDiff)} 分钟才能再次玩耍`
    //   };
    // }
    
    // 增加亲密度
    const newIntimacy = Math.min(pet.intimacy + 15, 100);
    
    await db.collection('pets').doc(pet._id).update({
      data: {
        intimacy: newIntimacy,
        last_play_time: now,
        last_active: now
      }
    });
    
    return {
      success: true,
      data: {
        message: '互动成功！宠物很开心~',
        intimacy: newIntimacy,
        intimacyIncrease: 15
      }
    };
    
  } catch (error) {
    console.error('与宠物玩耍失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 宠物升级
 */
async function petLevelUp(userId) {
  try {
    const petQuery = await db.collection('pets').where({
      user_id: userId
    }).get();
    
    if (petQuery.data.length === 0) {
      return {
        success: false,
        error: '宠物不存在'
      };
    }
    
    const pet = petQuery.data[0];
    const requiredExp = pet.level * 100;
    
    if (pet.exp < requiredExp) {
      return {
        success: false,
        error: `经验不足，还需要 ${requiredExp - pet.exp} 经验值`
      };
    }
    
    const newLevel = pet.level + 1;
    const remainingExp = pet.exp - requiredExp;
    
    // 升级奖励
    const levelUpRewards = {
      health: 100, // 满血
      vitality: 100, // 满活力
      intimacy: Math.min(pet.intimacy + 10, 100) // 增加亲密度
    };
    
    await db.collection('pets').doc(pet._id).update({
      data: {
        level: newLevel,
        exp: remainingExp,
        health: levelUpRewards.health,
        vitality: levelUpRewards.vitality,
        intimacy: levelUpRewards.intimacy,
        last_active: new Date()
      }
    });
    
    return {
      success: true,
      data: {
        message: `恭喜！宠物升级到 ${newLevel} 级！`,
        newLevel: newLevel,
        remainingExp: remainingExp,
        rewards: levelUpRewards
      }
    };
    
  } catch (error) {
    console.error('宠物升级失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取宠物历史记录
 */
async function getPetHistory(userId) {
  try {
    // 获取最近的任务完成记录
    const taskRecords = await db.collection('task_records')
      .where({
        user_id: userId,
        status: 'completed'
      })
      .orderBy('completed_at', 'desc')
      .limit(20)
      .get();
    
    // 获取聊天记录统计
    const chatCount = await db.collection('chat_context')
      .where({
        user_id: userId
      })
      .count();
    
    return {
      success: true,
      data: {
        recentTasks: taskRecords.data,
        totalChats: chatCount.total
      }
    };
    
  } catch (error) {
    console.error('获取宠物历史失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 计算实时状态值（基于时间衰减）
 */
function calculateRealTimeStatus(pet) {
  const now = new Date();
  const lastActive = new Date(pet.last_active);
  const minutesSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60);
  
  // 每5分钟固定衰减
  const fiveMinutePeriods = Math.floor(minutesSinceActive / 5);
  
  // 计算衰减值
  const healthDecay = fiveMinutePeriods * 1;  // 每5分钟减1点健康值
  const vitalityDecay = fiveMinutePeriods * 2; // 每5分钟减2点活力值
  const intimacyDecay = fiveMinutePeriods * 1; // 每5分钟减1点亲密度
  
  const newHealth = Math.max(pet.health - healthDecay, 0);
  const newVitality = Math.max(pet.vitality - vitalityDecay, 0);
  const newIntimacy = Math.max(pet.intimacy - intimacyDecay, 0);
  
  return {
    health: newHealth,
    vitality: newVitality,
    intimacy: newIntimacy
  };
}

/**
 * 计算宠物心情
 */
function calculateMood(status) {
  const avgStatus = (status.health + status.vitality + status.intimacy) / 3;
  
  if (avgStatus >= 80) {
    return 'happy'; // 开心
  } else if (avgStatus >= 60) {
    return 'normal'; // 普通
  } else if (avgStatus >= 40) {
    return 'tired'; // 疲惫
  } else {
    return 'sad'; // 难过
  }
}

/**
 * 创建宠物
 */
async function createPet(userId, petData) {
  try {
    // 检查用户是否已有宠物
    const existingPet = await db.collection('pets').where({
      user_id: userId
    }).get();
    
    if (existingPet.data.length > 0) {
      return {
        success: false,
        error: '用户已有宠物，无法创建新宠物'
      };
    }
    
    // 验证宠物数据
    const { pet_name, species, avatar } = petData;
    
    if (!pet_name || pet_name.trim().length === 0) {
      return {
        success: false,
        error: '宠物名称不能为空'
      };
    }
    
    if (pet_name.length > 10) {
      return {
        success: false,
        error: '宠物名称不能超过10个字符'
      };
    }
    
    // 创建新宠物
    const newPet = {
      user_id: userId,
      pet_name: pet_name.trim(),
      species: species || '健康小助手',
      avatar: avatar || '/images/default-pet.png',
      level: 1,
      exp: 0,
      health: 100,
      vitality: 100,
      intimacy: 50,
      last_feed_time: null,
      last_play_time: null,
      last_active: new Date(),
      created_at: new Date()
    };
    
    const result = await db.collection('pets').add({
      data: newPet
    });
    
    return {
      success: true,
      data: {
        ...newPet,
        _id: result._id
      }
    };
    
  } catch (error) {
    console.error('创建宠物失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取宠物列表
 */
async function listPets(userId) {
  try {
    const petsQuery = await db.collection('pets').where({
      user_id: userId
    }).get();
    
    const pets = petsQuery.data.map(pet => {
      const realTimeStatus = calculateRealTimeStatus(pet);
      return {
        ...pet,
        ...realTimeStatus,
        mood: calculateMood(realTimeStatus),
        nextLevelExp: (pet.level * 100) - pet.exp
      };
    });
    
    return {
      success: true,
      data: pets
    };
    
  } catch (error) {
    console.error('获取宠物列表失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}