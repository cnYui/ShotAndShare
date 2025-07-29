// 宠物主页面逻辑
const i18n = require('../../utils/i18n.js');
const themeManager = require('../../utils/theme.js');

Page({
  data: {
    petInfo: {
      name: '小绿',
      level: 1,
      stage: 'baby',
      mood: 'happy',
      action: 'idle',
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
    }, 300000); // 5分钟刷新一次 (300000毫秒)
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
    console.log('🔍 原始宠物数据:', petData);
    
    // 使用数据库中的实际经验值，而不是计算值
    const currentExp = petData.exp || 0;
    const currentLevel = petData.level || 1;
    
    // 计算下一级所需经验值 - 修复计算逻辑
    const nextLevelExp = (currentLevel + 1) * 100; // 下一级所需的总经验值
    
    // 计算当前等级的经验进度
    const currentLevelBaseExp = currentLevel * 100; // 当前等级的起始经验值
    const currentLevelExp = Math.max(0, currentExp - (currentLevel - 1) * 100); // 当前等级内的经验值
    const expForThisLevel = currentLevel * 100; // 当前等级需要的总经验值
    const expProgress = expForThisLevel > 0 ? Math.round((currentLevelExp / expForThisLevel) * 100) : 0;
    
    console.log('📊 经验值计算详情:', {
      '数据库经验值': currentExp,
      '当前等级': currentLevel,
      '当前等级基础经验': currentLevelBaseExp,
      '当前等级内经验': currentLevelExp,
      '升级所需经验': expForThisLevel,
      '进度百分比': expProgress,
      '下一级总经验': nextLevelExp,
      '总经验值': petData.totalExp,
      '是否应该升级': currentExp >= nextLevelExp
    });
    
    // 检查是否应该升级 - 修复升级判断逻辑
    const requiredExpForNextLevel = (currentLevel + 1) * 100;
    if (currentExp >= requiredExpForNextLevel) {
      console.log('🎊 检测到应该升级，触发升级逻辑...', {
        '当前经验': currentExp,
        '升级所需': requiredExpForNextLevel,
        '当前等级': currentLevel
      });
      this.triggerLevelUp(petData);
      return;
    }
    
    // 确保经验值显示与数据库同步
    this.setData({
      petInfo: {
        name: petData.pet_name || '小绿',
        level: currentLevel,
        stage: petData.stage || 'baby',
        mood: petData.mood || 'happy',
        action: petData.action || 'idle',
        health: petData.health || 100,
        vitality: petData.vitality || 100,
        intimacy: petData.intimacy || 50,
        exp: currentExp, // 使用数据库中的实际经验值
        nextLevelExp: nextLevelExp,
        avatar: petData.avatar || '/images/pets/default-pet.png',
        statusText: this.getPetStatusText(petData),
        companionDays: petData.companionDays !== undefined ? petData.companionDays : 0,
        totalExp: petData.totalExp !== undefined ? petData.totalExp : currentExp // 如果没有totalExp，使用当前经验值
      },
      expProgress: Math.max(0, Math.min(100, expProgress)) // 确保进度在0-100之间
    });
    
    console.log('✅ 更新后的界面数据:', {
      '显示经验值': currentExp,
      '显示等级': currentLevel,
      '显示进度': expProgress,
      '总经验值': petData.totalExp !== undefined ? petData.totalExp : currentExp
    });
  },

  // 触发升级
  triggerLevelUp(petData) {
    console.log('🚀 开始升级流程...', {
      '当前等级': petData.level,
      '当前经验': petData.exp,
      '总经验': petData.totalExp
    });
    
    wx.showLoading({ title: '升级中...' });
    
    wx.cloud.callFunction({
      name: 'petManager',
      data: {
        action: 'petLevelUp'
      },
      success: (res) => {
        console.log('✅ 升级结果:', res.result);
        if (res.result.success) {
          // 显示升级成功提示
          wx.showModal({
            title: '🎉 升级成功！',
            content: res.result.data.message,
            showCancel: false,
            confirmText: '太棒了！',
            success: () => {
              // 重新加载宠物数据
              this.loadPetData();
              
              // 显示升级动画
              setTimeout(() => {
                this.showLevelUpAnimation();
              }, 500);
            }
          });
        } else {
          console.error('❌ 升级失败:', res.result.error);
          wx.showToast({
            title: res.result.error || '升级失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('❌ 升级调用失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 显示错误并提供重试选项
  showErrorAndRetry(message) {
    const texts = this.data.texts;
    wx.showModal({
      title: texts.common?.tip || '提示',
      content: message + '，是否重试？',
      confirmText: texts.common?.retry || '重试',
      cancelText: texts.common?.cancel || '取消',
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
    const texts = this.data.texts;
    wx.showToast({
      title: `🎉 +${expGain} ${texts.home?.experience || '经验值'}`,
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
    // 触发宠物升级动画
    const petComponent = this.selectComponent('#mainPet');
    if (petComponent) {
      petComponent.levelUp();
    }
    
    const texts = this.data.texts;
    wx.showModal({
      title: texts.home?.levelUpTitle || '🎉 恭喜升级！',
      content: `${texts.home?.levelUpContent || '宠物升级到'} ${this.data.petInfo.level} ${texts.home?.level || '级'}！\n${texts.home?.levelUpReward || '获得升级奖励：满血满活力！'}`,
      showCancel: false,
      confirmText: texts.home?.levelUpConfirm || '太棒了！'
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
    
    // 检查当前宠物状态，判断是否过度喂食
    const currentPetInfo = this.data.petInfo;
    const isOverfed = currentPetInfo.health >= 100 && currentPetInfo.vitality >= 100;
    
    // 先触发宠物喂食动画
    const petComponent = this.selectComponent('#mainPet');
    if (petComponent) {
      petComponent.feed(isOverfed);
    }
    
    // 临时本地模拟方案（解决云函数网络问题）
    const useLocalSimulation = true; // 云函数修复后设置为 false
    
    if (useLocalSimulation) {
      console.log('🔧 使用本地模拟喂食（临时方案）');
      
      wx.showLoading({ title: '喂食中...' });
      
      // 模拟网络延迟
      setTimeout(() => {
        const newHealth = Math.min(currentPetInfo.health + 15, 100);
        const newVitality = Math.min(currentPetInfo.vitality + 10, 100);
        
        // 更新本地状态
        this.setData({
          'petInfo.health': newHealth,
          'petInfo.vitality': newVitality,
          'petInfo.statusText': this.getPetStatusText({ 
            health: newHealth, 
            vitality: newVitality, 
            intimacy: currentPetInfo.intimacy 
          })
        });
        
        // 根据是否过度喂食显示不同消息
        const message = isOverfed ? '我已经吃饱了，不能再吃了...' : '谢谢主人！好好吃！';
        this.setData({ petMessage: message });
        
        wx.showToast({
          title: isOverfed ? '宠物已经吃饱了' : '喂食成功！',
          icon: isOverfed ? 'none' : 'success'
        });
        
        setTimeout(() => {
          this.setData({ petMessage: '' });
        }, 3000);
        
        wx.hideLoading();
        this.setData({ isFeeding: false });
      }, 800);
      
      return;
    }
    
    // 原有的云函数调用逻辑
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
            icon: isOverfed ? 'none' : 'success'
          });
          
          // 更新本地宠物状态
          this.updatePetStatusFromFeed(res.result.data);
          
          // 根据是否过度喂食显示不同消息
          const message = isOverfed ? '我已经吃饱了，不能再吃了...' : '谢谢主人！好好吃！';
          this.setData({
            petMessage: message
          });
          
          // 延迟刷新宠物数据以获取最新经验值
          setTimeout(() => {
            this.loadPetData();
          }, 500);
          
          setTimeout(() => {
            this.setData({ petMessage: '' });
          }, 3000);
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
    
    // 触发宠物互动动画
    const petComponent = this.selectComponent('#mainPet');
    if (petComponent) {
      petComponent.play();
    }
    
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
    
    wx.cloud.callFunction({
      name: 'petManager',
      data: {
        action: 'walkWithPet'
      },
      success: (res) => {
        if (res.result.success) {
          // 触发宠物散步动画
          const petComponent = this.selectComponent('#mainPet');
          if (petComponent) {
            petComponent.walkWithPet();
          }
          
          wx.showToast({
            title: res.result.data.message || '散步完成！',
            icon: 'success'
          });
          
          // 更新本地宠物状态
          this.updatePetStatusFromWalk(res.result.data);
          
          this.setData({
            petMessage: '散步真舒服！我感觉更健康了！'
          });
          
          // 延迟刷新宠物数据以获取最新状态
          setTimeout(() => {
            this.loadPetData();
          }, 500);
          
          setTimeout(() => {
            this.setData({ petMessage: '' });
          }, 3000);
        } else {
          wx.showToast({
            title: res.result.error,
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('散步失败:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 和宠物玩游戏
  playGame() {
    wx.showLoading({ title: '游戏中...' });
    
    wx.cloud.callFunction({
      name: 'petManager',
      data: {
        action: 'playGame'
      },
      success: (res) => {
        if (res.result.success) {
          // 触发宠物游戏动画
          const petComponent = this.selectComponent('#mainPet');
          if (petComponent) {
            petComponent.playGame();
          }
          
          wx.showToast({
            title: res.result.data.message || '游戏完成！',
            icon: 'success'
          });
          
          // 更新本地宠物状态
          this.updatePetStatusFromGame(res.result.data);
          
          this.setData({
            petMessage: res.result.data.message || '和主人一起玩真开心！'
          });
          
          // 延迟刷新宠物数据以获取最新状态
          setTimeout(() => {
            this.loadPetData();
          }, 500);
          
          setTimeout(() => {
            this.setData({ petMessage: '' });
          }, 3000);
        } else {
          wx.showToast({
            title: res.result.error,
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('游戏失败:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 从散步结果更新宠物状态
  updatePetStatusFromWalk(walkResult) {
    const currentPetInfo = this.data.petInfo;
    const newHealth = walkResult.health;
    const newVitality = walkResult.vitality;
    const newIntimacy = walkResult.intimacy;
    
    this.setData({
      'petInfo.health': newHealth,
      'petInfo.vitality': newVitality,
      'petInfo.intimacy': newIntimacy,
      'petInfo.statusText': this.getPetStatusText({ health: newHealth, vitality: newVitality, intimacy: newIntimacy })
    });
    
    // 更新全局宠物信息
    const app = getApp();
    if (app.globalData.petInfo) {
      app.globalData.petInfo.health = newHealth;
      app.globalData.petInfo.vitality = newVitality;
      app.globalData.petInfo.intimacy = newIntimacy;
      wx.setStorageSync('petInfo', app.globalData.petInfo);
    }
  },
  
  // 从游戏结果更新宠物状态
  updatePetStatusFromGame(gameResult) {
    const currentPetInfo = this.data.petInfo;
    const newIntimacy = gameResult.intimacy;
    const newVitality = gameResult.vitality;
    
    this.setData({
      'petInfo.intimacy': newIntimacy,
      'petInfo.vitality': newVitality,
      'petInfo.statusText': this.getPetStatusText({ health: currentPetInfo.health, vitality: newVitality, intimacy: newIntimacy })
    });
    
    // 更新全局宠物信息
    const app = getApp();
    if (app.globalData.petInfo) {
      app.globalData.petInfo.intimacy = newIntimacy;
      app.globalData.petInfo.vitality = newVitality;
      wx.setStorageSync('petInfo', app.globalData.petInfo);
    }
  },

  // 处理任务点击
  onTaskTap(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/task-detail/task-detail?id=${taskId}`
    });
  },

  // 处理蛋孵化事件
  onPetHatch(e) {
    console.log('🥚 宠物蛋孵化事件:', e.detail);
    const { newStage, newLevel } = e.detail;
    
    // 显示孵化成功提示
    wx.showModal({
      title: '🎉 孵化成功！',
      content: '恭喜你！宠物蛋成功孵化出了可爱的小猫咪！\n现在你可以开始照顾它了！',
      showCancel: false,
      confirmText: '太棒了！',
      success: () => {
        // 更新宠物数据到云端
        this.updatePetStageToCloud(newStage, newLevel);
      }
    });
    
    // 触觉反馈
    wx.vibrateShort();
  },
  
  // 更新宠物阶段到云端
  updatePetStageToCloud(newStage, newLevel) {
    wx.showLoading({ title: '更新中...' });
    
    wx.cloud.callFunction({
      name: 'petManager',
      data: {
        action: 'updatePetStage',
        stage: newStage,
        level: newLevel
      },
      success: (res) => {
        console.log('✅ 更新宠物阶段成功:', res.result);
        if (res.result.success) {
          // 重新加载宠物数据
          this.loadPetData();
          
          // 显示欢迎消息
          this.setData({
            petMessage: '你好主人！我是你的新宠物！请多多照顾我哦！'
          });
          
          setTimeout(() => {
            this.setData({ petMessage: '' });
          }, 5000);
        } else {
          console.error('❌ 更新宠物阶段失败:', res.result.error);
          wx.showToast({
            title: '更新失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('❌ 调用云函数失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 处理孵化事件
  onPetHatch(e) {
    console.log('🥚 宠物孵化事件:', e.detail);
    const { newStage, newLevel } = e.detail;
    
    this.setData({
      'petInfo.stage': newStage,
      'petInfo.level': newLevel
    });
    
    wx.showToast({
      title: '🎉 孵化成功！',
      icon: 'success',
      duration: 2000
    });
    
    // 触觉反馈
    wx.vibrateShort();
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