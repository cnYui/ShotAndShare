/**
 * 本地存储工具
 */

/**
 * 存储数据
 * @param {string} key 键名
 * @param {any} data 数据
 * @returns {boolean} 是否成功
 */
function setStorage(key, data) {
  try {
    wx.setStorageSync(key, data);
    return true;
  } catch (error) {
    console.error('存储数据失败:', error);
    return false;
  }
}

/**
 * 获取数据
 * @param {string} key 键名
 * @param {any} defaultValue 默认值
 * @returns {any} 数据
 */
function getStorage(key, defaultValue = null) {
  try {
    const data = wx.getStorageSync(key);
    return data !== '' ? data : defaultValue;
  } catch (error) {
    console.error('获取数据失败:', error);
    return defaultValue;
  }
}

/**
 * 删除数据
 * @param {string} key 键名
 * @returns {boolean} 是否成功
 */
function removeStorage(key) {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (error) {
    console.error('删除数据失败:', error);
    return false;
  }
}

/**
 * 清空所有数据
 * @returns {boolean} 是否成功
 */
function clearStorage() {
  try {
    wx.clearStorageSync();
    return true;
  } catch (error) {
    console.error('清空数据失败:', error);
    return false;
  }
}

/**
 * 获取存储信息
 * @returns {object} 存储信息
 */
function getStorageInfo() {
  try {
    return wx.getStorageInfoSync();
  } catch (error) {
    console.error('获取存储信息失败:', error);
    return {
      keys: [],
      currentSize: 0,
      limitSize: 0
    };
  }
}

/**
 * 用户信息相关存储
 */
const UserStorage = {
  // 用户基本信息
  setUserInfo(userInfo) {
    return setStorage('userInfo', userInfo);
  },
  
  getUserInfo() {
    return getStorage('userInfo', {
      nickName: '健康达人',
      avatarUrl: '/images/default-avatar.png',
      id: 'HP001',
      level: 1,
      exp: 0
    });
  },
  
  // 用户设置
  setUserSettings(settings) {
    return setStorage('userSettings', settings);
  },
  
  getUserSettings() {
    return getStorage('userSettings', {
      notifications: true,
      soundEnabled: true,
      vibrationEnabled: true,
      theme: 'light',
      language: 'zh-CN'
    });
  }
};

/**
 * 宠物信息相关存储
 */
const PetStorage = {
  // 宠物列表
  setPetList(petList) {
    return setStorage('petList', petList);
  },
  
  getPetList() {
    return getStorage('petList', []);
  },
  
  // 当前激活的宠物
  setActivePet(pet) {
    return setStorage('activePet', pet);
  },
  
  getActivePet() {
    return getStorage('activePet', null);
  },
  
  // 宠物成长数据
  setPetGrowthData(petId, data) {
    const key = `petGrowth_${petId}`;
    return setStorage(key, data);
  },
  
  getPetGrowthData(petId) {
    const key = `petGrowth_${petId}`;
    return getStorage(key, {
      level: 1,
      exp: 0,
      health: 100,
      happiness: 100,
      energy: 100
    });
  }
};

/**
 * 任务相关存储
 */
const TaskStorage = {
  // 任务完成记录
  setTaskRecord(date, tasks) {
    const key = `taskRecord_${date}`;
    return setStorage(key, tasks);
  },
  
  getTaskRecord(date) {
    const key = `taskRecord_${date}`;
    return getStorage(key, []);
  },
  
  // 任务统计数据
  setTaskStats(stats) {
    return setStorage('taskStats', stats);
  },
  
  getTaskStats() {
    return getStorage('taskStats', {
      totalCompleted: 0,
      streakDays: 0,
      weeklyCompleted: 0,
      monthlyCompleted: 0
    });
  },
  
  // 自定义任务
  setCustomTasks(tasks) {
    return setStorage('customTasks', tasks);
  },
  
  getCustomTasks() {
    return getStorage('customTasks', []);
  }
};

/**
 * 健康数据相关存储
 */
const HealthStorage = {
  // 每日健康数据
  setDailyHealthData(date, data) {
    const key = `healthData_${date}`;
    return setStorage(key, data);
  },
  
  getDailyHealthData(date) {
    const key = `healthData_${date}`;
    return getStorage(key, {
      steps: 0,
      calories: 0,
      water: 0,
      sleep: 0,
      exercise: 0,
      mood: 5
    });
  },
  
  // 健康目标
  setHealthGoals(goals) {
    return setStorage('healthGoals', goals);
  },
  
  getHealthGoals() {
    return getStorage('healthGoals', {
      dailySteps: 8000,
      dailyWater: 2000,
      dailySleep: 8,
      weeklyExercise: 5
    });
  },
  
  // 健康报告
  setHealthReport(period, report) {
    const key = `healthReport_${period}`;
    return setStorage(key, report);
  },
  
  getHealthReport(period) {
    const key = `healthReport_${period}`;
    return getStorage(key, null);
  }
};

/**
 * 聊天记录相关存储
 */
const ChatStorage = {
  // 聊天记录
  setChatHistory(history) {
    return setStorage('chatHistory', history);
  },
  
  getChatHistory() {
    return getStorage('chatHistory', []);
  },
  
  // 添加聊天消息
  addChatMessage(message) {
    const history = this.getChatHistory();
    history.push({
      ...message,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });
    
    // 限制聊天记录数量，保留最近1000条
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
    
    return this.setChatHistory(history);
  },
  
  // 清空聊天记录
  clearChatHistory() {
    return removeStorage('chatHistory');
  }
};

/**
 * 成就相关存储
 */
const AchievementStorage = {
  // 已获得的成就
  setAchievements(achievements) {
    return setStorage('achievements', achievements);
  },
  
  getAchievements() {
    return getStorage('achievements', []);
  },
  
  // 添加新成就
  addAchievement(achievement) {
    const achievements = this.getAchievements();
    const exists = achievements.find(item => item.id === achievement.id);
    
    if (!exists) {
      achievements.push({
        ...achievement,
        unlockedAt: new Date().toISOString()
      });
      return this.setAchievements(achievements);
    }
    
    return false;
  },
  
  // 检查是否已获得成就
  hasAchievement(achievementId) {
    const achievements = this.getAchievements();
    return achievements.some(item => item.id === achievementId);
  }
};

/**
 * 应用配置相关存储
 */
const AppStorage = {
  // 应用版本信息
  setAppVersion(version) {
    return setStorage('appVersion', version);
  },
  
  getAppVersion() {
    return getStorage('appVersion', '1.0.0');
  },
  
  // 首次启动标记
  setFirstLaunch(isFirst) {
    return setStorage('isFirstLaunch', isFirst);
  },
  
  isFirstLaunch() {
    return getStorage('isFirstLaunch', true);
  },
  
  // 最后活跃时间
  setLastActiveTime(time) {
    return setStorage('lastActiveTime', time);
  },
  
  getLastActiveTime() {
    return getStorage('lastActiveTime', null);
  }
};

module.exports = {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  getStorageInfo,
  UserStorage,
  PetStorage,
  TaskStorage,
  HealthStorage,
  ChatStorage,
  AchievementStorage,
  AppStorage
};