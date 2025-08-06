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
    case 'walkWithPet':
      return await walkWithPet(openid);
    case 'restPet':
      return await restPet(openid);
    case 'playGame':
      return await playGame(openid);
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
    
    // 如果宠物没有created_at字段，使用_createTime或当前时间
    if (!pet.created_at && pet._createTime) {
      // 更新数据库，添加created_at字段
      await db.collection('pets').doc(pet._id).update({
        data: {
          created_at: new Date(pet._createTime)
        }
      });
      pet.created_at = new Date(pet._createTime);
    } else if (!pet.created_at) {
      // 如果都没有，使用当前时间作为创建时间
      const now = new Date();
      await db.collection('pets').doc(pet._id).update({
        data: {
          created_at: now
        }
      });
      pet.created_at = now;
    }
    
    // 计算陪伴天数
    const companionDays = calculateCompanionDays(pet.created_at);
    
    // 计算总经验值（从任务完成记录中统计）
    const totalExp = await calculateTotalExp(userId);
    
    // 移除自动升级逻辑，升级由taskManager统一处理
    // 这样避免了多个云函数同时处理升级导致的冲突
    let needUpdate = false;
    const updateData = {};
    
    console.log('📊 petManager获取状态:', { 
      '数据库中的等级': pet.level,
      '数据库中的经验值': pet.exp, 
      '计算出的总经验值': totalExp 
    });
    
    // 如果状态值有变化，更新数据库
    if (realTimeStatus.health !== pet.health || 
        realTimeStatus.vitality !== pet.vitality) {
      updateData.health = realTimeStatus.health;
      updateData.vitality = realTimeStatus.vitality;
      updateData.last_active = new Date();
      needUpdate = true;
    }
    
    // 执行数据库更新
    if (needUpdate) {
      await db.collection('pets').doc(pet._id).update({
        data: updateData
      });
      
      // 更新pet对象以反映最新数据
      Object.assign(pet, updateData);
    }
    
    return {
      success: true,
      data: {
        ...pet,
        ...realTimeStatus,
        exp: pet.exp, // 返回数据库中的经验值（当前等级内的经验值）
        mood: calculateMood(realTimeStatus),
        nextLevelExp: ((pet.level || 1) + 1) * 100,
        companionDays: companionDays,
        totalExp: totalExp
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
    
    // 使用宠物当前的经验值（升级后这个值代表当前等级内的经验）
    const currentLevelExp = pet.exp || 0;
    const currentLevel = pet.level || 1;
    const requiredExpForThisLevel = 100; // 每级需要100经验
    
    console.log('🎯 升级检查:', {
      '当前等级': currentLevel,
      '当前等级内经验': currentLevelExp,
      '升级所需经验': requiredExpForThisLevel
    });
    
    if (currentLevelExp < requiredExpForThisLevel) {
      return {
        success: false,
        error: `经验不足，还需要 ${requiredExpForThisLevel - currentLevelExp} 经验值`
      };
    }
    
    const newLevel = currentLevel + 1;
    
    // 计算溢出经验：当前等级内经验值减去升级所需的经验值
    const overflowExp = currentLevelExp - requiredExpForThisLevel;
    
    // 升级奖励
    const levelUpRewards = {
      health: 100, // 满血
      vitality: 100, // 满活力
      intimacy: Math.min(pet.intimacy + 10, 100) // 增加亲密度
    };
    
    await db.collection('pets').doc(pet._id).update({
      data: {
        level: newLevel,
        exp: overflowExp, // 设置为溢出的经验值，作为下一级的初始经验
        health: levelUpRewards.health,
        vitality: levelUpRewards.vitality,
        intimacy: levelUpRewards.intimacy,
        last_active: new Date()
      }
    });
    
    console.log('🎊 升级成功:', {
      '新等级': newLevel,
      '升级前等级内经验': currentLevelExp,
      '升级所需经验': requiredExpForThisLevel,
      '溢出经验值': overflowExp,
      '奖励': levelUpRewards
    });
    
    return {
      success: true,
      data: {
        message: `恭喜！宠物升级到 ${newLevel} 级！`,
        newLevel: newLevel,
        newExp: overflowExp,
        levelExpUsed: currentLevelExp,
        overflowExp: overflowExp,
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

/**
 * 计算陪伴天数
 */
function calculateCompanionDays(createTime) {
  if (!createTime) {
    return 0;
  }
  
  const now = new Date();
  const created = new Date(createTime);
  const timeDiff = now.getTime() - created.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  return Math.max(daysDiff, 0);
}

/**
 * 计算总经验值（从任务完成记录中统计）
 */
async function calculateTotalExp(userId) {
  try {
    // 获取所有已完成的任务记录
    const taskRecords = await db.collection('task_records')
      .where({
        user_id: userId,
        status: 'completed'
      })
      .get();
    
    let totalExp = 0;
    
    // 累计所有任务的经验值
    for (const record of taskRecords.data) {
      try {
        // 通过task_id查询任务详情获取经验值
        const taskQuery = await db.collection('tasks').doc(record.task_id).get();
        if (taskQuery.data && taskQuery.data.reward_exp) {
          totalExp += taskQuery.data.reward_exp;
        }
      } catch (taskError) {
        console.warn('查询任务详情失败:', taskError);
      }
    }
    
    return totalExp;
    
  } catch (error) {
    console.error('计算总经验值失败:', error);
    return 0;
  }
}

/**
 * 带宠物散步
 */
async function walkWithPet(userId) {
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
    const now = new Date();
    
    // 散步增加健康值、活力值和亲密度
    const newHealth = Math.min(pet.health + 5, 100);
    const newVitality = Math.min(pet.vitality + 8, 100);
    const newIntimacy = Math.min(pet.intimacy + 3, 100);
    
    await db.collection('pets').doc(pet._id).update({
      data: {
        health: newHealth,
        vitality: newVitality,
        intimacy: newIntimacy,
        last_walk_time: now,
        last_active: now
      }
    });
    
    return {
      success: true,
      data: {
        message: '散步完成！宠物感觉更健康了~',
        health: newHealth,
        vitality: newVitality,
        intimacy: newIntimacy,
        healthIncrease: 5,
        vitalityIncrease: 8,
        intimacyIncrease: 3
      }
    };
    
  } catch (error) {
    console.error('散步失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 宠物休息
 */
async function restPet(userId) {
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
    const now = new Date();
    
    // 休息恢复活力值和健康值
    const newVitality = Math.min(pet.vitality + 20, 100);
    const newHealth = Math.min(pet.health + 10, 100);
    
    await db.collection('pets').doc(pet._id).update({
      data: {
        vitality: newVitality,
        health: newHealth,
        last_rest_time: now,
        last_active: now
      }
    });
    
    return {
      success: true,
      data: {
        message: '休息完成！宠物精神饱满~',
        vitality: newVitality,
        health: newHealth,
        vitalityIncrease: 20,
        healthIncrease: 10
      }
    };
    
  } catch (error) {
    console.error('宠物休息失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 和宠物玩游戏
 */
async function playGame(userId) {
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
    const now = new Date();
    
    // 随机游戏类型和奖励
    const games = [
      { name: '捉迷藏', message: '找到我了！好开心！', intimacy: 10, vitality: 5 },
      { name: '飞盘游戏', message: '接住了！我好厉害！', intimacy: 8, vitality: 12 },
      { name: '智力游戏', message: '我变聪明了！', intimacy: 12, vitality: 3 },
      { name: '追逐游戏', message: '跑步真快乐！', intimacy: 9, vitality: 10 }
    ];
    
    const randomGame = games[Math.floor(Math.random() * games.length)];
    
    const newIntimacy = Math.min(pet.intimacy + randomGame.intimacy, 100);
    const newVitality = Math.min(pet.vitality + randomGame.vitality, 100);
    
    await db.collection('pets').doc(pet._id).update({
      data: {
        intimacy: newIntimacy,
        vitality: newVitality,
        last_game_time: now,
        last_active: now
      }
    });
    
    return {
      success: true,
      data: {
        message: `${randomGame.name}完成！${randomGame.message}`,
        gameName: randomGame.name,
        intimacy: newIntimacy,
        vitality: newVitality,
        intimacyIncrease: randomGame.intimacy,
        vitalityIncrease: randomGame.vitality
      }
    };
    
  } catch (error) {
    console.error('游戏失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}