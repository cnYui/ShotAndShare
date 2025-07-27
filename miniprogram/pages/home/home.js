// 宠物主页面逻辑
const i18n = require('../../utils/i18n.js');
const themeManager = require('../../utils/theme.js');

Page({
  data: {
    petInfo: {
      name: '小绿',
      level: 1,
      health: 100,
      vitality: 100,
      intimacy: 50,
      exp: 0,
      nextLevelExp: 200,
      avatar: '/images/pets/default-pet.png',
      statusText: '很开心'
    },
    expProgress: 0,
    completedTasks: 0,
    totalTasks: 0,
    todayTasks: [],
    petMessage: '',
    isFeeding: false,
    isPlaying: false,
    loading: true,
    isDarkMode: false,
    themeClass: '',
    texts: {}
  },

  onLoad() {
    const app = getApp();
    
    // 检查登录状态
    if (!app.globalData.isLoggedIn) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return;
    }
    
    this.initThemeAndLanguage();
    this.loadPetData();
    this.loadTodayTasks();
    this.showRandomMessage();
  },
  
  // 初始化主题和语言
  initThemeAndLanguage() {
    this.loadTexts();
    this.applyCurrentTheme();
  },
  
  // 加载文本
  loadTexts() {
    const texts = i18n.getTexts();
    this.setData({ texts });
  },
  
  // 应用当前主题
  applyCurrentTheme() {
    const theme = themeManager.getCurrentTheme();
    const isDarkMode = themeManager.isDark();
    const themeClass = isDarkMode ? 'dark-theme' : '';
    
    this.setData({
      isDarkMode,
      themeClass
    });
    
    // 设置页面主题类
    if (isDarkMode) {
      wx.setPageStyle({
        style: {
          backgroundColor: '#1a1a1a'
        }
      });
    } else {
      wx.setPageStyle({
        style: {
          backgroundColor: '#f6f6f6'
        }
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('🔄 页面显示，开始刷新数据...');
    
    // 重新应用主题和语言
    this.initThemeAndLanguage();
    
    // 检查是否从任务页面返回
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    const isFromTasks = prevPage && prevPage.route === 'pages/tasks/tasks';
    
    if (isFromTasks) {
      console.log('📋 从任务页面返回，检查经验值变化...');
      // 延迟一下确保任务完成的云函数已执行
      setTimeout(() => {
        this.loadPetData();
        this.checkExpChange();
      }, 500);
    } else {
      this.loadPetData();
    }
    
    this.loadTodayTasks();
    
    // 设置定时刷新，每30秒检查一次状态变化
    this.startAutoRefresh();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 停止自动刷新
    this.stopAutoRefresh();
  },

  // 开始自动刷新
  startAutoRefresh() {
    this.stopAutoRefresh(); // 先清除之前的定时器
    this.refreshTimer = setInterval(() => {
      console.log('⏰ 定时刷新宠物状态...');
      this.loadPetData();
    }, 30000); // 30秒刷新一次
  },

  // 停止自动刷新
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  },

  // 加载宠物数据
  loadPetData() {
    console.log('🔄 开始加载宠物数据...');
    wx.showLoading({ title: '加载中...' });
    
    // 直接从云端获取最新数据，确保经验值实时更新
    wx.cloud.callFunction({
      name: 'petManager',
      data: {
        action: 'getPetStatus'
      },
      success: (res) => {
        console.log('✅ 获取宠物状态成功:', res.result);
        console.log('🔍 检查返回数据中的关键字段:', {
          companionDays: res.result.data?.companionDays,
          totalExp: res.result.data?.totalExp,
          created_at: res.result.data?.created_at,
          _createTime: res.result.data?._createTime
        });
        if (res.result.success) {
          const petData = res.result.data;
          this.updatePetDisplay(petData);
          
          // 更新全局宠物信息
          const app = getApp();
          app.globalData.petInfo = petData;
          wx.setStorageSync('petInfo', petData);
        } else {
          console.error('❌ 获取宠物状态失败:', res.result.error);
          this.showErrorAndRetry('获取宠物信息失败');
        }
      },
      fail: (err) => {
        console.error('❌ 调用云函数失败:', err);
        this.showErrorAndRetry('网络错误，请重试');
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 更新宠物显示信息
  updatePetDisplay(petData) {
    // 修复升级逻辑：下一级所需经验应该是(当前等级+1) * 100
    const nextLevelExp = (petData.level + 1) * 100;
    const expProgress = nextLevelExp > 0 ? Math.round((petData.exp / nextLevelExp) * 100) : 0;
    
    console.log('📊 宠物数据更新:', {
      level: petData.level,
      exp: petData.exp,
      nextLevelExp: nextLevelExp,
      expProgress: expProgress,
      companionDays: petData.companionDays,
      totalExp: petData.totalExp,
      shouldLevelUp: petData.exp >= nextLevelExp
    });
    
    // 检查是否应该升级
    if (petData.exp >= nextLevelExp) {
      console.log('🎊 检测到应该升级，触发升级逻辑...');
      this.triggerLevelUp(petData);
      return;
    }
    
    this.setData({
      petInfo: {
        name: petData.pet_name || '小绿',
        level: petData.level,
        health: petData.health,
        vitality: petData.vitality,
        intimacy: petData.intimacy,
        exp: petData.exp,
        nextLevelExp: nextLevelExp,
        avatar: petData.avatar || '/images/pets/default-pet.png',
        statusText: this.getPetStatusText(petData),
        companionDays: petData.companionDays !== undefined ? petData.companionDays : 0,
        totalExp: petData.totalExp !== undefined ? petData.totalExp : 0
      },
      expProgress: expProgress
    });
  },

  // 触发升级
  triggerLevelUp(petData) {
    console.log('🚀 开始升级流程...');
    wx.showLoading({ title: '升级中...' });
    
    wx.cloud.callFunction({
      name: 'petManager',
      data: {
        action: 'petLevelUp'
      },
      success: (res) => {
        console.log('✅ 升级结果:', res.result);
        if (res.result.success) {
          // 重新加载宠物数据
          this.loadPetData();
          
          // 显示升级动画
          setTimeout(() => {
            this.showLevelUpAnimation();
          }, 1000);
        } else {
          console.error('❌ 升级失败:', res.result.error);
        }
      },
      fail: (err) => {
        console.error('❌ 升级调用失败:', err);
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 显示错误并提供重试选项
  showErrorAndRetry(message) {
    wx.showModal({
      title: '提示',
      content: message + '，是否重试？',
      confirmText: '重试',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.loadPetData();
        }
      }
    });
  },

  // 检查经验值变化
  checkExpChange() {
    console.log('🔍 检查经验值变化...');
    
    // 检查是否有经验值更新标记
    const expUpdateFlag = wx.getStorageSync('expUpdateFlag');
    if (expUpdateFlag && expUpdateFlag.timestamp) {
      const timeDiff = Date.now() - expUpdateFlag.timestamp;
      // 如果更新标记在5分钟内，说明是最近的更新
      if (timeDiff < 5 * 60 * 1000) {
        console.log('📈 检测到经验值更新标记:', expUpdateFlag);
        this.showExpGainAnimation(expUpdateFlag.expGain);
        // 清除标记
        wx.removeStorageSync('expUpdateFlag');
        return;
      }
    }
    
    // 传统的经验值比较检查
    const lastExp = wx.getStorageSync('lastExp') || 0;
    const currentExp = this.data.petInfo.exp || 0;
    
    console.log('📊 经验值比较:', { lastExp, currentExp });
    
    if (currentExp > lastExp) {
      const expGain = currentExp - lastExp;
      console.log('📈 检测到经验值增加:', expGain);
      this.showExpGainAnimation(expGain);
      wx.setStorageSync('lastExp', currentExp);
    } else {
      // 更新最后记录的经验值
      wx.setStorageSync('lastExp', currentExp);
    }
  },

  // 显示经验值获得动画
  showExpGainAnimation(expGain) {
    console.log('✨ 显示经验值获得动画:', expGain);
    
    if (expGain <= 0) {
      console.log('⚠️ 经验值增加为0或负数，跳过动画');
      return;
    }
    
    // 显示经验值获得提示
    wx.showToast({
      title: `🎉 +${expGain} 经验值`,
      icon: 'success',
      duration: 2000
    });
    
    // 检查是否升级
    const { level, exp, nextLevelExp } = this.data.petInfo;
    console.log('🔍 检查升级条件:', { level, exp, nextLevelExp });
    
    if (exp >= nextLevelExp) {
      console.log('🎊 宠物升级了！');
      setTimeout(() => {
        this.showLevelUpAnimation();
      }, 2500);
    }
    
    // 触觉反馈
    wx.vibrateShort();
  },

  // 显示升级动画
  showLevelUpAnimation() {
    wx.showModal({
      title: '🎉 恭喜升级！',
      content: `宠物升级到 ${this.data.petInfo.level} 级！\n获得升级奖励：满血满活力！`,
      showCancel: false,
      confirmText: '太棒了！'
    });
  },

  // 获取宠物状态文本
  getPetStatusText(petInfo) {
    if (petInfo.health < 30) return '生病了';
    if (petInfo.vitality < 30) return '很疲惫';
    if (petInfo.intimacy > 80) return '非常开心';
    if (petInfo.intimacy > 60) return '很开心';
    return '还不错';
  },

  // 加载今日任务
  loadTodayTasks() {
    console.log('📋 开始加载今日任务...');
    
    this.setData({ loading: true });
    
    wx.cloud.callFunction({
      name: 'taskManager',
      data: {
        action: 'getDailyTasks'
      },
      success: (res) => {
        console.log('📋 任务数据获取结果:', res.result);
        if (res.result.success) {
          const taskRecords = res.result.data || [];
          const todayTasks = [];
          let completedCount = 0;
          
          console.log('📋 处理任务记录，总数:', taskRecords.length);
          
          taskRecords.forEach(record => {
            console.log('📝 处理任务记录:', record);
            
            if (record.task_info) {
              todayTasks.push({
                id: record._id,
                name: record.task_info.name || record.task_info.title || '未知任务',
                reward: record.task_info.reward_exp || 0,
                completed: record.status === 'completed'
              });
              
              if (record.status === 'completed') {
                completedCount++;
              }
            }
          });
          
          console.log('📊 任务统计:', {
            总任务数: todayTasks.length,
            已完成: completedCount,
            未完成: todayTasks.length - completedCount
          });
          
          this.setData({
            todayTasks: todayTasks.slice(0, 5), // 只显示前5个任务
            completedTasks: completedCount,
            totalTasks: todayTasks.length,
            loading: false
          });
        } else {
          console.error('❌ 获取任务失败:', res.result.error);
          this.setData({
            todayTasks: [],
            completedTasks: 0,
            totalTasks: 0,
            loading: false
          });
        }
      },
      fail: (err) => {
        console.error('❌ 加载任务失败:', err);
        this.setData({
          todayTasks: [],
          completedTasks: 0,
          totalTasks: 0,
          loading: false
        });
      }
    });
  },

  // 刷新宠物状态
  refreshPetStatus() {
    // 模拟状态更新
    const currentTime = new Date().getHours();
    let statusText = '很开心';
    let message = '';
    
    if (currentTime >= 6 && currentTime < 9) {
      statusText = '精神饱满';
      message = '早上好！新的一天开始了！';
    } else if (currentTime >= 12 && currentTime < 14) {
      statusText = '有点饿了';
      message = '该吃午饭了，记得营养均衡哦！';
    } else if (currentTime >= 18 && currentTime < 20) {
      statusText = '期待晚餐';
      message = '晚餐时间到了，今天吃什么呢？';
    } else if (currentTime >= 22 || currentTime < 6) {
      statusText = '有点困了';
      message = '该休息了，早睡早起身体好！';
    }
    
    this.setData({
      'petInfo.statusText': statusText,
      petMessage: message
    });
  },

  // 显示随机提示消息
  showRandomMessage() {
    const messages = [
      '记得多喝水哦！',
      '今天的任务完成了吗？',
      '运动让我们更健康！',
      '保持好心情很重要呢！',
      '规律作息对身体好哦！'
    ];
    
    setTimeout(() => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      this.setData({
        petMessage: randomMessage
      });
      
      // 3秒后隐藏消息
      setTimeout(() => {
        this.setData({
          petMessage: ''
        });
      }, 3000);
    }, 2000);
  },

  // 喂食宠物
  feedPet() {
    // 防止重复点击
    if (this.data.isFeeding) {
      return;
    }
    
    this.setData({ isFeeding: true });
    wx.showLoading({ title: '喂食中...' });
    
    wx.cloud.callFunction({
      name: 'petManager',
      data: {
        action: 'feedPet'
      },
      success: (res) => {
        if (res.result.success) {
          wx.showToast({
            title: res.result.data.message || '喂食成功！',
            icon: 'success'
          });
          
          // 更新本地宠物状态
          this.updatePetStatusFromFeed(res.result.data);
          
          this.setData({
            petMessage: '谢谢主人！好好吃！'
          });
          
          // 延迟刷新宠物数据以获取最新经验值
          setTimeout(() => {
            this.loadPetData();
          }, 500);
          
          setTimeout(() => {
            this.setData({ petMessage: '' });
          }, 2000);
        } else {
          wx.showToast({
            title: res.result.error,
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('喂食失败:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
        this.setData({ isFeeding: false });
      }
    });
  },

  // 与宠物互动
  playWithPet() {
    // 防止重复点击
    if (this.data.isPlaying) {
      return;
    }
    
    this.setData({ isPlaying: true });
    wx.showLoading({ title: '互动中...' });
    
    wx.cloud.callFunction({
      name: 'petManager',
      data: {
        action: 'playWithPet'
      },
      success: (res) => {
        if (res.result.success) {
          wx.showToast({
            title: res.result.data.message || '互动成功！',
            icon: 'success'
          });
          
          // 更新本地宠物状态
          this.updatePetStatusFromPlay(res.result.data);
          
          this.setData({
            petMessage: '和主人一起玩真开心！'
          });
          
          setTimeout(() => {
            this.setData({ petMessage: '' });
          }, 2000);
        } else {
          wx.showToast({
            title: res.result.error,
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('互动失败:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
        this.setData({ isPlaying: false });
      }
    });
  },

  // 从喂食结果更新宠物状态
  updatePetStatusFromFeed(feedResult) {
    const currentPetInfo = this.data.petInfo;
    const newHealth = feedResult.health;
    const newVitality = feedResult.vitality;
    
    this.setData({
      'petInfo.health': newHealth,
      'petInfo.vitality': newVitality,
      'petInfo.statusText': this.getPetStatusText({ health: newHealth, vitality: newVitality, intimacy: currentPetInfo.intimacy })
    });
    
    // 更新全局宠物信息
    const app = getApp();
    if (app.globalData.petInfo) {
      app.globalData.petInfo.health = newHealth;
      app.globalData.petInfo.vitality = newVitality;
      wx.setStorageSync('petInfo', app.globalData.petInfo);
    }
  },
  
  // 从互动结果更新宠物状态
  updatePetStatusFromPlay(playResult) {
    const currentPetInfo = this.data.petInfo;
    const newIntimacy = playResult.intimacy;
    
    this.setData({
      'petInfo.intimacy': newIntimacy,
      'petInfo.statusText': this.getPetStatusText({ health: currentPetInfo.health, vitality: currentPetInfo.vitality, intimacy: newIntimacy })
    });
    
    // 更新全局宠物信息
    const app = getApp();
    if (app.globalData.petInfo) {
      app.globalData.petInfo.intimacy = newIntimacy;
      wx.setStorageSync('petInfo', app.globalData.petInfo);
    }
  },

  // 带宠物散步
  walkWithPet() {
    wx.showLoading({ title: '散步中...' });
    
    // 模拟散步过程
    setTimeout(() => {
      wx.hideLoading();
      
      // 散步增加健康值和活力值
      const currentPetInfo = this.data.petInfo;
      const newHealth = Math.min(100, currentPetInfo.health + 5);
      const newVitality = Math.min(100, currentPetInfo.vitality + 8);
      const newIntimacy = Math.min(100, currentPetInfo.intimacy + 3);
      
      this.setData({
        'petInfo.health': newHealth,
        'petInfo.vitality': newVitality,
        'petInfo.intimacy': newIntimacy,
        'petInfo.statusText': this.getPetStatusText({ health: newHealth, vitality: newVitality, intimacy: newIntimacy }),
        petMessage: '散步真舒服！我感觉更健康了！'
      });
      
      // 更新全局宠物信息
      const app = getApp();
      if (app.globalData.petInfo) {
        app.globalData.petInfo.health = newHealth;
        app.globalData.petInfo.vitality = newVitality;
        app.globalData.petInfo.intimacy = newIntimacy;
        wx.setStorageSync('petInfo', app.globalData.petInfo);
      }
      
      wx.showToast({
        title: '散步完成！',
        icon: 'success'
      });
      
      // 3秒后隐藏消息
      setTimeout(() => {
        this.setData({ petMessage: '' });
      }, 3000);
      
    }, 2000);
  },

  // 和宠物玩游戏
  playGame() {
    const games = [
      { name: '捉迷藏', message: '找到我了！好开心！', intimacy: 10, vitality: 5 },
      { name: '飞盘游戏', message: '接住了！我好厉害！', intimacy: 8, vitality: 12 },
      { name: '智力游戏', message: '我变聪明了！', intimacy: 12, vitality: 3 },
      { name: '追逐游戏', message: '跑步真快乐！', intimacy: 9, vitality: 10 }
    ];
    
    const randomGame = games[Math.floor(Math.random() * games.length)];
    
    wx.showLoading({ title: `玩${randomGame.name}中...` });
    
    setTimeout(() => {
      wx.hideLoading();
      
      const currentPetInfo = this.data.petInfo;
      const newIntimacy = Math.min(100, currentPetInfo.intimacy + randomGame.intimacy);
      const newVitality = Math.min(100, currentPetInfo.vitality + randomGame.vitality);
      
      this.setData({
        'petInfo.intimacy': newIntimacy,
        'petInfo.vitality': newVitality,
        'petInfo.statusText': this.getPetStatusText({ health: currentPetInfo.health, vitality: newVitality, intimacy: newIntimacy }),
        petMessage: randomGame.message
      });
      
      // 更新全局宠物信息
      const app = getApp();
      if (app.globalData.petInfo) {
        app.globalData.petInfo.intimacy = newIntimacy;
        app.globalData.petInfo.vitality = newVitality;
        wx.setStorageSync('petInfo', app.globalData.petInfo);
      }
      
      wx.showToast({
        title: `${randomGame.name}完成！`,
        icon: 'success'
      });
      
      // 3秒后隐藏消息
      setTimeout(() => {
        this.setData({ petMessage: '' });
      }, 3000);
      
    }, 2500);
  },

  // 处理任务点击
  onTaskTap(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/task-detail/task-detail?id=${taskId}`
    });
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '我的健康小宠物',
      path: '/pages/home/home',
      imageUrl: '/images/share-cover.svg'
    };
  }
});