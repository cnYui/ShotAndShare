// 健康任务页面逻辑
const i18n = require('../../utils/i18n.js');
const themeManager = require('../../utils/theme.js');

Page({
  data: {
    currentCategory: 'all',
    todayCompleted: 0,
    weeklyCompleted: 0,
    totalExp: 0,
    
    categoryNames: {
      all: '全部',
      daily: '日常',
      exercise: '运动',
      diet: '饮食',
      sleep: '睡眠'
    },
    
    todayTasks: [],
    weeklyTasks: [],
    filteredTasks: [],
    filteredCompletedCount: 0,
    filteredTotalCount: 0,
    showCompletionModal: false,
    completedTaskReward: 0,
    petCongratulation: '',
    loading: false,
    hasData: false,
    isDarkMode: false,
    themeClass: '',
    texts: {}
  },

  onLoad() {
    const app = getApp();
    if (!app.requireLogin()) {
      return;
    }
    
    this.initThemeAndLanguage();
    this.loadTaskData();
    this.updatePetMood();
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
  },

  onShow() {
    this.initThemeAndLanguage();
    this.refreshTasks();
  },

  // 切换任务分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category
    });
    this.filterTasks();
  },

  // 加载任务数据
  loadTaskData() {
    console.log('🔍 开始加载任务数据...');
    this.setData({ loading: true });
    wx.showLoading({ title: '加载中...' });
    
    // 获取每日任务
    wx.cloud.callFunction({
      name: 'taskManager',
      data: {
        action: 'getDailyTasks'
      },
      success: (res) => {
        console.log('✅ 云函数调用成功:', res.result);
        if (res.result.success) {
          if (res.result.data && res.result.data.length > 0) {
            console.log('📋 任务数据:', res.result.data);
            this.processTaskData(res.result.data);
            this.setData({ hasData: true });
          } else {
            console.log('⚠️ 任务数据为空，尝试初始化数据库...');
            this.initializeDatabase();
          }
        } else {
          console.error('❌ 获取任务失败:', res.result.error);
          this.showErrorAndRetry('获取任务失败: ' + res.result.error);
        }
      },
      fail: (err) => {
        console.error('❌ 调用云函数失败:', err);
        this.showErrorAndRetry('网络错误，请检查网络连接');
      },
      complete: () => {
        this.setData({ loading: false });
        wx.hideLoading();
      }
    });
    
    // 获取任务统计
    this.loadTaskStats();
  },

  // 处理任务数据
  processTaskData(taskRecords) {
    console.log('🔄 处理任务数据，记录数量:', taskRecords.length);
    const todayTasks = [];
    const weeklyTasks = [];
    
    taskRecords.forEach(record => {
      console.log('📝 处理任务记录:', record);
      
      if (!record.task_info) {
        console.warn('⚠️ 任务记录缺少task_info:', record);
        return;
      }
      
      const task = {
        id: record._id,
        title: record.task_info.name || record.task_info.title || '未知任务',
        description: record.task_info.description || '暂无描述',
        category: record.task_info.category || 'daily',
        categoryText: this.getCategoryText(record.task_info.category || 'daily'),
        reward: record.task_info.reward_exp || 0,
        completed: record.status === 'completed',
        progress: record.progress || 0,
        targetProgress: record.task_info.target_value || 1,
        type: record.task_info.type || 'check',
        deadline: this.formatDeadline(record.task_info.deadline)
      };
      
      // 所有任务都作为今日任务显示
      todayTasks.push(task);
    });
    
    console.log('✅ 处理完成 - 今日任务:', todayTasks.length, '周任务:', weeklyTasks.length);
    
    this.setData({
      todayTasks,
      weeklyTasks
    });
    
    this.filterTasks();
    this.updateStats();
    this.loadTotalExp();
  },

  // 获取分类文本
  getCategoryText(category) {
    const categoryMap = {
      daily: '日常',
      exercise: '运动',
      diet: '饮食',
      sleep: '睡眠'
    };
    return categoryMap[category] || '其他';
  },

  // 格式化截止时间
  formatDeadline(deadline) {
    if (!deadline) return '全天';
    return deadline;
  },

  // 加载任务统计
  loadTaskStats() {
    wx.cloud.callFunction({
      name: 'taskManager',
      data: {
        action: 'getTaskStats'
      },
      success: (res) => {
        console.log('📊 统计数据:', res.result);
        if (res.result.success) {
          const stats = res.result.data;
          this.setData({
            todayCompleted: stats.today.completed,
            weeklyCompleted: stats.week.completed
          });
        }
      },
      fail: (err) => {
        console.error('获取统计失败:', err);
      }
    });
  },

  // 初始化数据库
  initializeDatabase() {
    console.log('🔧 开始初始化数据库...');
    wx.showLoading({ title: '初始化中...' });
    
    wx.cloud.callFunction({
      name: 'initDatabase',
      data: {},
      success: (res) => {
        console.log('✅ 数据库初始化结果:', res.result);
        if (res.result.success) {
          wx.showToast({
            title: '初始化成功',
            icon: 'success'
          });
          // 重新加载任务数据
          setTimeout(() => {
            this.loadTaskData();
          }, 1000);
        } else {
          this.showErrorAndRetry('数据库初始化失败');
        }
      },
      fail: (err) => {
        console.error('❌ 初始化失败:', err);
        this.showErrorAndRetry('初始化失败，请重试');
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 显示错误并提供重试选项
  showErrorAndRetry(message) {
    wx.showModal({
      title: '加载失败',
      content: message + '\n\n是否重试？',
      confirmText: '重试',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.loadTaskData();
        }
      }
    });
  },

  // 过滤任务
  filterTasks() {
    const { currentCategory, todayTasks, weeklyTasks } = this.data;
    let allTasks = [...todayTasks, ...weeklyTasks];
    
    if (currentCategory !== 'all') {
      allTasks = allTasks.filter(task => task.category === currentCategory);
    }
    
    // 计算完成的任务数量
    const completedCount = allTasks.filter(task => task.completed).length;
    
    this.setData({
      filteredTasks: allTasks,
      filteredCompletedCount: completedCount,
      filteredTotalCount: allTasks.length
    });
  },

  // 更新统计数据
  updateStats() {
    const { todayTasks, weeklyTasks } = this.data;
    
    const todayCompleted = todayTasks.filter(task => task.completed).length;
    const weeklyCompleted = weeklyTasks.filter(task => task.completed).length;
    
    this.setData({
      todayCompleted,
      weeklyCompleted
    });
  },

  // 加载总经验值
  loadTotalExp() {
    wx.cloud.callFunction({
      name: 'taskManager',
      data: {
        action: 'getTotalExp'
      },
      success: (res) => {
        console.log('📊 总经验值数据:', res.result);
        if (res.result.success) {
          this.setData({
            totalExp: res.result.data.totalExp || 0
          });
        } else {
          console.error('获取总经验值失败:', res.result.error);
          // 如果获取失败，尝试从宠物数据中获取
          this.loadExpFromPet();
        }
      },
      fail: (err) => {
        console.error('获取总经验值失败:', err);
        // 如果云函数调用失败，尝试从宠物数据中获取
        this.loadExpFromPet();
      }
    });
  },

  // 从宠物数据中获取经验值
  loadExpFromPet() {
    wx.cloud.callFunction({
      name: 'petManager',
      data: {
        action: 'getPetInfo'
      },
      success: (res) => {
        if (res.result.success && res.result.data) {
          this.setData({
            totalExp: res.result.data.exp || 0
          });
        }
      },
      fail: (err) => {
        console.error('从宠物数据获取经验值失败:', err);
      }
    });
  },

  // 切换任务完成状态
  toggleTask(e) {
    const taskId = e.currentTarget.dataset.id;
    console.log('🎯 开始完成任务:', taskId);
    
    // 调用云函数完成任务
    wx.showLoading({ title: '完成中...' });
    
    wx.cloud.callFunction({
      name: 'taskManager',
      data: {
        action: 'completeTask',
        taskId: taskId
      },
      success: (res) => {
        console.log('✅ 任务完成结果:', res.result);
        if (res.result.success) {
          // 更新本地任务状态
          this.updateLocalTaskStatus(taskId, true);
          
          const rewardExp = res.result.data.reward_exp || 0;
          
          // 显示经验值获得提示
          wx.showToast({
            title: `+${rewardExp} 经验值`,
            icon: 'success',
            duration: 2000
          });
          
          // 延迟显示完成奖励模态框
          setTimeout(() => {
            this.setData({
              showCompletionModal: true,
              completedTaskReward: rewardExp,
              petCongratulation: this.getRandomCongratulation()
            });
          }, 2000);
          
          // 更新统计数据
          this.loadTaskStats();
          
          // 触觉反馈
          wx.vibrateShort();
          
          // 通知宠物页面经验值已更新
          this.notifyExpUpdate(rewardExp);
          
        } else {
          wx.showToast({
            title: res.result.error,
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('❌ 完成任务失败:', err);
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

  // 通知经验值更新
  notifyExpUpdate(expGain) {
    console.log('📢 通知经验值更新:', expGain);
    
    // 更新全局数据，标记经验值有变化
    const app = getApp();
    if (app.globalData) {
      app.globalData.expChanged = true;
      app.globalData.lastExpGain = expGain;
    }
    
    // 使用事件通知机制
    wx.setStorageSync('expUpdateFlag', {
      timestamp: Date.now(),
      expGain: expGain
    });
  },

  // 更新本地任务状态
  updateLocalTaskStatus(taskId, completed) {
    const todayTasks = this.data.todayTasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed };
      }
      return task;
    });
    
    const weeklyTasks = this.data.weeklyTasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed };
      }
      return task;
    });
    
    this.setData({
      todayTasks,
      weeklyTasks
    });
    
    this.filterTasks();
  },

  // 开始任务
  startTask(e) {
    const taskId = e.currentTarget.dataset.id;
    const { todayTasks, weeklyTasks } = this.data;
    
    const task = [...todayTasks, ...weeklyTasks].find(t => t.id === taskId);
    
    if (task.type === 'timer') {
      // 跳转到计时器页面
      wx.navigateTo({
        url: `/pages/timer/timer?taskId=${taskId}&title=${task.title}&duration=30`
      });
    } else if (task.type === 'check') {
      // 直接完成打卡
      this.toggleTask(e);
    } else if (task.type === 'progress') {
      // 跳转到进度详情页面
      wx.navigateTo({
        url: `/pages/task-progress/task-progress?taskId=${taskId}`
      });
    }
  },

  // 刷新任务
  refreshTasks() {
    console.log('🔄 刷新任务数据...');
    this.setData({ hasData: false });
    this.loadTaskData();
  },



  // 关闭完成提示
  closeCompletionModal() {
    this.setData({
      showCompletionModal: false
    });
  },

  // 获取随机祝贺语
  getRandomCongratulation() {
    const congratulations = [
      '太棒了！主人真厉害！',
      '又完成一个任务，我为你骄傲！',
      '坚持就是胜利，继续加油！',
      '你的努力让我很开心！',
      '健康生活，从每个小目标开始！',
      '主人越来越棒了！',
      '每一步都在变得更好！'
    ];
    
    return congratulations[Math.floor(Math.random() * congratulations.length)];
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshTasks();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 更新宠物心情
  updatePetMood() {
    // 任务页面的宠物心情更新
    // 这里可以根据完成的任务数量来更新宠物心情
    console.log('🐾 更新宠物心情状态');
    
    const hour = new Date().getHours();
    let moodText = '准备完成任务';
    
    if (hour >= 6 && hour < 9) {
      moodText = '精神饱满，准备开始新的一天';
    } else if (hour >= 12 && hour < 14) {
      moodText = '午休时间，适合轻松任务';
    } else if (hour >= 18 && hour < 22) {
      moodText = '晚间时光，坚持完成任务';
    } else if (hour >= 22 || hour < 6) {
      moodText = '夜深了，记得早点休息';
    }
    
    // 可以根据需要更新页面数据或显示提示
    console.log('🐾 宠物心情:', moodText);
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '一起来完成健康任务吧！',
      path: '/pages/tasks/tasks',
      imageUrl: '/images/share-cover.svg'
    };
  }
});