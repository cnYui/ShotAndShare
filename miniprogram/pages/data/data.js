// 健康数据页面逻辑
const i18n = require('../../utils/i18n.js');
const themeManager = require('../../utils/theme.js');

Page({
  data: {
    // 当前选中的分类
    activeCategory: 'steps',
    currentTab: 'steps',
    // 当前选中的时间范围
    activeRange: 'day',
    currentRange: 'day',
    
    // 今日数据概览
    todayData: {
      steps: 8520,
      water: 0,
      sleep: 7.5,
      exercise: 45
    },
    
    // 目标数据
    targets: {
      steps: 8000,
      water: 2000,
      sleep: 8,
      exercise: 60
    },
    
    // 步数数据
    stepsData: {
      current: 8520,
      target: 8000,
      completion: 106.5,
      remaining: 0,
      weeklyAverage: 8200,
      insights: '今天的步数比昨天多了1200步，继续保持！'
    },
    
    // 饮水数据
    waterData: {
      current: 0,
      target: 2000,
      completion: 0,
      remaining: 2000,
      records: [],
      insights: '开始记录您的饮水量，保持身体水分平衡。'
    },
    
    // 睡眠数据
    sleepData: {
      duration: 7.5,
      bedtime: '23:30',
      wakeup: '07:00',
      quality: 85,
      phases: [
        { name: '深度睡眠', duration: '2h 15m', color: '#2c3e50' },
        { name: '浅度睡眠', duration: '4h 30m', color: '#3498db' },
        { name: 'REM睡眠', duration: '45m', color: '#9b59b6' }
      ],
      insights: '睡眠质量良好，建议保持规律的作息时间。'
    },
    
    // 运动数据
    exerciseData: {
      totalDuration: 45,
      calories: 320,
      types: [
        { name: '跑步', duration: '25分钟', calories: 180, icon: 'running' },
        { name: '瑜伽', duration: '20分钟', calories: 140, icon: 'yoga' }
      ],
      insights: '运动强度适中，建议增加力量训练。'
    },
    
    // 自定义饮水弹窗
    showWaterModal: false,
    customWaterAmount: '',
    
    // 微信步数相关数据
    weeklyStepsData: [],
    stepsChartData: null,
    
    // 当前日期
    currentDate: '',
    
    // 统计数据
    statsData: {
      steps: { day: 0, week: 0, month: 0 },
      water: { day: 0, week: 0, month: 0 },
      sleep: { day: 0, week: 0, month: 0 },
      exercise: { day: 0, week: 0, month: 0 }
    },
    
    // 目标和进度
    stepsTarget: 8000,
    waterTarget: 2000,
    sleepTarget: 8,
    exerciseTarget: 60,
    stepsProgress: 0,
    stepsProgressRounded: 0,
    waterProgress: 0,
    stepsInsights: '暂无数据洞察',
    
    // 显示目标值
    displayStepsTarget: 8000,
    displayWaterTarget: 2000,
    displaySleepTarget: 8,
    displayExerciseTarget: 60,
    
    // 剩余值
    stepsRemaining: 0,
    waterRemaining: 2000,
    
    // 其他数据
    waterRecords: [],
    waterMarks: [25, 50, 75, 100],
    waterMarkTarget: 2000,
    sleepQualityDesc: '良好',
    sleepPhases: [],
    exerciseTypes: [],
    exerciseTimeData: [
      { day: '周一', duration: 30, percentage: 50 },
      { day: '周二', duration: 45, percentage: 75 },
      { day: '周三', duration: 20, percentage: 33 },
      { day: '周四', duration: 60, percentage: 100 },
      { day: '周五', duration: 35, percentage: 58 },
      { day: '周六', duration: 50, percentage: 83 },
      { day: '周日', duration: 40, percentage: 67 }
    ],
    showCustomWaterModal: false,
    customWaterAmount: '',
    
    // 编辑弹窗相关
    showEditModal: false,
    editDataType: '',
    editValue: '',
    
    // 国际化文本
    texts: {},
    
    // 主题相关
    isDarkMode: false,
    themeClass: ''
  },
  
  onLoad() {
    // 初始化主题和语言
    this.initThemeAndLanguage();
    
    // 设置当前日期
    const today = new Date();
    const currentDate = `${today.getMonth() + 1}月${today.getDate()}日`;
    this.setData({
      currentDate: currentDate
    });
    
    // 首次加载时清理重复数据
    this.cleanDuplicateData();
    
    this.loadTodayData();
    
    // 初始化睡眠阶段数据
    this.initializeSleepPhases();
    
    // 初始化加载日数据
    this.loadRangeData('day');
  },
  
  onShow() {
    // 重新应用主题和语言
    this.initThemeAndLanguage();
    this.refreshData();
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

  // 初始化睡眠阶段数据
  initializeSleepPhases() {
    const sleepPhases = this.data.sleepData.phases || [];
    this.setData({
      sleepPhases: sleepPhases
    });
  },

  // 获取微信步数数据
  getWeChatStepsData() {
    return new Promise((resolve, reject) => {
      // 首先检查用户是否授权微信运动
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.werun']) {
            // 已授权，直接获取运动数据
            this.fetchWeRunData(resolve, reject);
          } else {
            // 未授权，请求授权
            wx.authorize({
              scope: 'scope.werun',
              success: () => {
                console.log('微信运动授权成功');
                this.fetchWeRunData(resolve, reject);
              },
              fail: (error) => {
                console.log('微信运动授权失败:', error);
                wx.showModal({
                  title: '授权提示',
                  content: '需要授权微信运动数据来显示真实步数，是否前往设置？',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      wx.openSetting({
                        success: (settingRes) => {
                          if (settingRes.authSetting['scope.werun']) {
                            this.fetchWeRunData(resolve, reject);
                          } else {
                            reject(new Error('用户拒绝授权微信运动'));
                          }
                        }
                      });
                    } else {
                      reject(new Error('用户拒绝授权微信运动'));
                    }
                  }
                });
              }
            });
          }
        },
        fail: (error) => {
          console.error('获取设置失败:', error);
          reject(error);
        }
      });
    });
  },

  // 获取微信运动数据
  fetchWeRunData(resolve, reject) {
    wx.getWeRunData({
      success: (res) => {
        console.log('微信运动数据获取成功:', res);
        
        if (res.cloudID) {
          // 使用CloudID方式调用云函数解密数据
          wx.cloud.callFunction({
            name: 'decryptWeRunData',
            data: {
              weRunData: wx.cloud.CloudID(res.cloudID)
            },
            success: (cloudRes) => {
              console.log('云函数解密成功:', cloudRes);
              
              if (cloudRes.result.success) {
                const { todaySteps, weeklySteps } = cloudRes.result.data;
                const today = new Date();
                const todayStr = this.formatDate(today);
                
                const stepsData = {
                  steps: todaySteps || 0,
                  date: todayStr,
                  weeklyData: weeklySteps || []
                };
                
                // 更新步数图表数据
                this.updateStepsChart(weeklySteps);
                
                resolve(stepsData);
              } else {
                console.error('云函数解密失败:', cloudRes.result.error);
                // 解密失败，使用默认值
                resolve({ 
                  steps: 0, 
                  date: this.formatDate(new Date()),
                  weeklyData: []
                });
              }
            },
            fail: (cloudError) => {
              console.error('调用解密云函数失败:', cloudError);
              // 云函数调用失败，使用默认值
              resolve({ 
                steps: 0, 
                date: this.formatDate(new Date()),
                weeklyData: []
              });
            }
          });
        } else if (res.encryptedData && res.iv) {
          // 兼容旧版本：使用传统方式
          wx.cloud.callFunction({
            name: 'decryptWeRunData',
            data: {
              encryptedData: res.encryptedData,
              iv: res.iv
            },
            success: (cloudRes) => {
              console.log('云函数解密成功:', cloudRes);
              
              if (cloudRes.result.success) {
                const { todaySteps, weeklySteps } = cloudRes.result.data;
                const today = new Date();
                const todayStr = this.formatDate(today);
                
                const stepsData = {
                  steps: todaySteps || 0,
                  date: todayStr,
                  weeklyData: weeklySteps || []
                };
                
                // 更新步数图表数据
                this.updateStepsChart(weeklySteps);
                
                resolve(stepsData);
              } else {
                console.error('云函数解密失败:', cloudRes.result.error);
                // 解密失败，使用默认值
                resolve({ 
                  steps: 0, 
                  date: this.formatDate(new Date()),
                  weeklyData: []
                });
              }
            },
            fail: (cloudError) => {
              console.error('调用解密云函数失败:', cloudError);
              // 云函数调用失败，使用默认值
              resolve({ 
                steps: 0, 
                date: this.formatDate(new Date()),
                weeklyData: []
              });
            }
          });
        } else {
          console.log('没有加密数据，使用默认值');
          // 如果没有加密数据，使用默认值
          resolve({ 
            steps: 0, 
            date: this.formatDate(new Date()),
            weeklyData: []
          });
        }
      },
      fail: (error) => {
        console.error('获取微信运动数据失败:', error);
        reject(error);
      }
    });
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  // 加载今日数据
  loadTodayData() {
    // 首先从数据库加载今日数据
    this.loadTodayDataFromDB();
  },

  // 从数据库加载今日数据
  loadTodayDataFromDB() {
    wx.showLoading({
      title: '加载数据中...'
    });

    const today = this.formatDate(new Date());
    
    wx.cloud.callFunction({
      name: 'healthDataManager',
      data: {
        action: 'getHealthData',
        startDate: today,
        endDate: today
      },
      success: (res) => {
        wx.hideLoading();
        
        if (res.result && res.result.success && res.result.data.length > 0) {
          // 从数据库获取到数据
          const dbData = res.result.data[0];
          const todayData = {
            steps: dbData.steps || 0,
            water: dbData.water_ml || 0,
            sleep: dbData.sleep_hours || 0,
            exercise: dbData.exercise_minutes || 0
          };
          
          this.setData({
            todayData: todayData
          });
          
          this.updateStepsData();
          this.updateWaterData();
          this.updateSleepData();
          this.updateExerciseData();
        } else {
          // 数据库中没有今日数据，获取微信步数并初始化
          this.initializeTodayData();
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('从数据库加载今日数据失败:', error);
        // 加载失败，初始化今日数据
        this.initializeTodayData();
      }
    });
  },

  // 初始化今日数据
  initializeTodayData() {
    // 首先尝试获取微信步数数据
    this.getWeChatStepsData().then(stepsData => {
      // 使用真实步数数据，其他数据从0开始
      const todayData = {
        steps: stepsData.steps || 0,
        water: 0,
        sleep: 0,
        exercise: 0
      };
      
      this.setData({
        todayData: todayData
      });
      
      // 将步数数据保存到数据库
      if (stepsData.steps > 0) {
        this.saveStepsToDatabase(stepsData.steps);
      }
      
      this.updateStepsData();
      this.updateWaterData();
      this.updateSleepData();
      this.updateExerciseData();
    }).catch(error => {
      console.error('获取微信步数失败:', error);
      // 如果获取微信步数失败，使用默认数据
      const defaultData = {
        steps: 0,
        water: 0,
        sleep: 0,
        exercise: 0
      };
      
      this.setData({
        todayData: defaultData
      });
      
      this.updateStepsData();
      this.updateWaterData();
      this.updateSleepData();
      this.updateExerciseData();
    });
  },

  // 保存步数到数据库
  saveStepsToDatabase(steps) {
    wx.cloud.callFunction({
      name: 'healthDataManager',
      data: {
        action: 'inputHealthData',
        healthData: {
          steps: steps
        }
      },
      success: (res) => {
        console.log('步数数据保存成功:', res);
      },
      fail: (error) => {
        console.error('步数数据保存失败:', error);
      }
    });
  },
  
  // 更新步数数据
  updateStepsData() {
    const { steps } = this.data.todayData;
    const target = this.data.targets.steps;
    const completion = Math.round((steps / target) * 100 * 10) / 10;
    const stepsProgress = Math.min(completion, 100);
    
    this.setData({
      'stepsData.current': steps,
      'stepsData.completion': completion,
      'stepsData.remaining': Math.max(0, target - steps),
      stepsProgress: stepsProgress,
      stepsProgressRounded: Math.round(stepsProgress)
    });
  },
  
  // 更新饮水数据
  updateWaterData() {
    const { water } = this.data.todayData;
    const target = this.data.targets.water;
    const completion = Math.round((water / target) * 100);
    const waterProgress = Math.min(completion, 100); // 确保不超过100%
    
    this.setData({
      'waterData.current': water,
      'waterData.completion': completion,
      'waterData.remaining': Math.max(0, target - water),
      waterProgress: waterProgress // 添加waterProgress更新
    });
  },

  // 更新睡眠数据
  updateSleepData() {
    const { sleep } = this.data.todayData;
    const target = this.data.targets.sleep;
    const completion = Math.round((sleep / target) * 100);
    const sleepProgress = Math.min(completion, 100);
    
    this.setData({
      'sleepData.duration': sleep,
      'sleepData.completion': completion,
      'sleepData.remaining': Math.max(0, target - sleep),
      sleepProgress: sleepProgress
    });
  },

  // 更新运动数据
  updateExerciseData() {
    const { exercise } = this.data.todayData;
    const target = this.data.targets.exercise;
    const completion = Math.round((exercise / target) * 100);
    const exerciseProgress = Math.min(completion, 100);
    
    this.setData({
      'exerciseData.totalDuration': exercise,
      'exerciseData.completion': completion,
      'exerciseData.remaining': Math.max(0, target - exercise),
      exerciseProgress: exerciseProgress
    });
  },
  
  // 更新进度条样式（已移除，现在使用内联样式）
  updateProgressStyles() {
    // 不再需要手动设置样式，进度通过内联样式直接绑定到数据
  },
  
  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      activeCategory: category
    });
    
    // 根据分类加载对应数据
    this.loadCategoryData(category);
  },
  
  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab,
      activeCategory: tab
    });
    
    // 根据分类加载对应数据
    this.loadCategoryData(tab);
  },
  
  // 切换时间范围
  switchRange(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({
      activeRange: range,
      currentRange: range
    });
    
    // 根据时间范围重新加载数据
    this.loadRangeData(range);
  },
  
  // 加载分类数据
  loadCategoryData(category) {
    // 模拟加载不同分类的数据
    console.log(`加载${category}数据`);
    
    // 这里可以调用相应的API获取数据
    switch(category) {
      case 'steps':
        this.loadStepsChart();
        break;
      case 'water':
        this.loadWaterChart();
        break;
      case 'sleep':
        this.loadSleepChart();
        break;
      case 'exercise':
        this.loadExerciseChart();
        break;
    }
  },
  
  // 加载时间范围数据
  loadRangeData(range) {
    console.log(`加载${range}范围数据`);
    
    wx.showLoading({
      title: '加载数据中...'
    });
    
    // 调用云函数获取统计数据
    wx.cloud.callFunction({
      name: 'healthDataManager',
      data: {
        action: 'getHealthStats',
        range: range // 'day', 'week', 'month'
      },
      success: (res) => {
        wx.hideLoading();
        
        if (res.result.success) {
          const statsData = res.result.data;
          this.processStatsData(statsData, range);
        } else {
          console.error('获取统计数据失败:', res.result.error);
          this.setDefaultStatsData(range);
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('调用云函数失败:', error);
        this.setDefaultStatsData(range);
      }
    });
  },
  
  // 处理统计数据
  processStatsData(data, range) {
    const currentTab = this.data.currentTab;
    
    // 更新统计数据
    const statsData = this.data.statsData;
    
    // 计算各项数据的总和或平均值
    if (data && data.length > 0) {
      // 步数：求总和，确保不为负数
      const totalSteps = Math.max(0, data.reduce((sum, item) => {
        const steps = parseInt(item.steps) || 0;
        return sum + Math.max(0, steps); // 确保每个值都不为负
      }, 0));
      statsData.steps[range] = totalSteps;
      
      // 饮水：求总和 (注意字段名是 water_ml)，确保不为负数
      const totalWater = Math.max(0, data.reduce((sum, item) => {
        const water = parseInt(item.water_ml) || 0;
        return sum + Math.max(0, water);
      }, 0));
      statsData.water[range] = totalWater;
      
      // 睡眠：求平均值 (注意字段名是 sleep_hours)
      const validSleepData = data.filter(item => {
        const sleepHours = parseFloat(item.sleep_hours) || 0;
        return sleepHours > 0 && sleepHours <= 24; // 合理的睡眠时间范围
      });
      const avgSleep = validSleepData.length > 0 
        ? validSleepData.reduce((sum, item) => sum + parseFloat(item.sleep_hours), 0) / validSleepData.length
        : 0;
      statsData.sleep[range] = Math.round(Math.max(0, avgSleep) * 10) / 10;
      
      // 运动：求总和 (注意字段名是 exercise_minutes)，确保不为负数
      const totalExercise = Math.max(0, data.reduce((sum, item) => {
        const exercise = parseInt(item.exercise_minutes) || 0;
        return sum + Math.max(0, exercise);
      }, 0));
      statsData.exercise[range] = totalExercise;
    } else {
      // 没有数据时设为0
      statsData.steps[range] = 0;
      statsData.water[range] = 0;
      statsData.sleep[range] = 0;
      statsData.exercise[range] = 0;
    }
    
    // 更新页面数据
    this.setData({
      statsData: statsData
    });
    
    // 更新当前显示的数据
    this.updateDisplayData(currentTab, range);
  },
  
  // 设置默认统计数据（当获取失败时）
  setDefaultStatsData(range) {
    const statsData = this.data.statsData;
    statsData.steps[range] = 0;
    statsData.water[range] = 0;
    statsData.sleep[range] = 0;
    statsData.exercise[range] = 0;
    
    this.setData({
      statsData: statsData
    });
    
    this.updateDisplayData(this.data.currentTab, range);
  },
  
  // 更新显示数据
  updateDisplayData(tab, range) {
    const statsData = this.data.statsData;
    
    // 更新顶部数据概览（始终显示当前时间范围的所有数据）
    const stepsValue = statsData.steps[range];
    const waterValue = statsData.water[range];
    const sleepValue = statsData.sleep[range];
    const exerciseValue = statsData.exercise[range];
    
    // 计算动态目标值
    const dailyStepsTarget = this.data.stepsTarget;
    const dailyWaterTarget = this.data.waterTarget;
    const dailySleepTarget = this.data.sleepTarget;
    const dailyExerciseTarget = this.data.exerciseTarget;
    
    let displayStepsTarget, displayWaterTarget, displaySleepTarget, displayExerciseTarget;
    let stepsProgress, waterProgress;
    
    if (range === 'day') {
      // 日目标保持不变
      displayStepsTarget = dailyStepsTarget;
      displayWaterTarget = dailyWaterTarget;
      displaySleepTarget = dailySleepTarget;
      displayExerciseTarget = dailyExerciseTarget;
      stepsProgress = Math.round((stepsValue / dailyStepsTarget) * 100 * 10) / 10;
      waterProgress = Math.round((waterValue / dailyWaterTarget) * 100);
    } else if (range === 'week') {
      // 周目标：显示总目标
      const weekStepsTarget = dailyStepsTarget * 7;
      const weekWaterTarget = dailyWaterTarget * 7;
      const weekSleepTarget = dailySleepTarget * 7;
      const weekExerciseTarget = dailyExerciseTarget * 7;
      displayStepsTarget = `目标: ${weekStepsTarget}步`;
      displayWaterTarget = `目标: ${weekWaterTarget}ml`;
      displaySleepTarget = `目标: ${weekSleepTarget}小时`;
      displayExerciseTarget = `目标: ${weekExerciseTarget}分钟`;
      stepsProgress = Math.round((stepsValue / weekStepsTarget) * 100 * 10) / 10;
      waterProgress = Math.round((waterValue / weekWaterTarget) * 100);
    } else {
      // 月目标：显示总目标
      const monthStepsTarget = dailyStepsTarget * 30;
      const monthWaterTarget = dailyWaterTarget * 30;
      const monthSleepTarget = dailySleepTarget * 30;
      const monthExerciseTarget = dailyExerciseTarget * 30;
      displayStepsTarget = `目标: ${monthStepsTarget}步`;
      displayWaterTarget = `目标: ${monthWaterTarget}ml`;
      displaySleepTarget = `目标: ${monthSleepTarget}小时`;
      displayExerciseTarget = `目标: ${monthExerciseTarget}分钟`;
      stepsProgress = Math.round((stepsValue / monthStepsTarget) * 100 * 10) / 10;
      waterProgress = Math.round((waterValue / monthWaterTarget) * 100);
    }
    
    // 计算"还需"显示值
    let stepsRemaining, waterRemaining;
    if (range === 'day') {
      stepsRemaining = Math.max(0, dailyStepsTarget - stepsValue);
      waterRemaining = Math.max(0, dailyWaterTarget - waterValue);
    } else if (range === 'week') {
      const weekStepsTarget = dailyStepsTarget * 7;
      const weekWaterTarget = dailyWaterTarget * 7;
      stepsRemaining = Math.max(0, weekStepsTarget - stepsValue);
      waterRemaining = Math.max(0, weekWaterTarget - waterValue);
    } else {
      const monthStepsTarget = dailyStepsTarget * 30;
      const monthWaterTarget = dailyWaterTarget * 30;
      stepsRemaining = Math.max(0, monthStepsTarget - stepsValue);
      waterRemaining = Math.max(0, monthWaterTarget - waterValue);
    }
    
    // 计算水位标记值
    const waterMarkTarget = range === 'day' ? dailyWaterTarget : 
                           range === 'week' ? dailyWaterTarget : dailyWaterTarget;
    
    // 更新所有数据显示
    const finalStepsProgress = Math.min(stepsProgress, 100);
    this.setData({
      'todayData.steps': stepsValue,
      'todayData.water': waterValue,
      'todayData.sleep': sleepValue,
      'todayData.exercise': exerciseValue,
      displayStepsTarget: displayStepsTarget,
      displayWaterTarget: displayWaterTarget,
      displaySleepTarget: displaySleepTarget,
      displayExerciseTarget: displayExerciseTarget,
      stepsRemaining: stepsRemaining,
      waterRemaining: waterRemaining,
      waterMarkTarget: waterMarkTarget,
      stepsProgress: finalStepsProgress,
      stepsProgressRounded: Math.round(finalStepsProgress),
      waterProgress: Math.min(waterProgress, 100),
      stepsInsights: this.generateStepsInsights(stepsValue, range),
      'sleepData.duration': sleepValue
    });
  },
  
  // 获取时间范围对应的天数
  getRangeDays(range) {
    switch(range) {
      case 'day': return 1;
      case 'week': return 7;
      case 'month': return 30;
      default: return 1;
    }
  },

  // 清理重复数据
  cleanDuplicateData() {
    wx.cloud.callFunction({
      name: 'healthDataManager',
      data: {
        action: 'cleanAllDuplicates'
      }
    }).then(res => {
      console.log('清理重复数据完成:', res.result);
    }).catch(err => {
      console.error('清理重复数据失败:', err);
    });
  },
  
  // 生成步数洞察
  generateStepsInsights(steps, range) {
    if (steps === 0) {
      return `${range === 'day' ? '今日' : range === 'week' ? '本周' : '本月'}暂无步数数据`;
    }
    
    const dailyTarget = this.data.stepsTarget;
    
    if (range === 'day') {
      if (steps >= dailyTarget) {
        return `恭喜！今日步数已达标，超出目标${steps - dailyTarget}步`;
      } else {
        return `今日还需${dailyTarget - steps}步即可达标，加油！`;
      }
    } else if (range === 'week') {
      const weekTarget = dailyTarget * 7; // 本周总目标
      if (steps >= weekTarget) {
        return `恭喜！本周步数已达标，超出目标${steps - weekTarget}步`;
      } else {
        return `本周还需${weekTarget - steps}步即可达标，加油！`;
      }
    } else {
      const monthTarget = dailyTarget * 30; // 本月总目标
      if (steps >= monthTarget) {
        return `恭喜！本月步数已达标，超出目标${steps - monthTarget}步`;
      } else {
        return `本月还需${monthTarget - steps}步即可达标，加油！`;
      }
    }
  },
  
  // 加载步数图表
  loadStepsChart() {
    // 如果有微信步数的周数据，使用真实数据
    if (this.data.weeklyStepsData && this.data.weeklyStepsData.length > 0) {
      this.updateStepsChart(this.data.weeklyStepsData);
    } else {
      // 否则使用模拟图表数据
      const chartData = {
        categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        series: [6800, 7200, 8500, 9200, 8800, 7600, 8520]
      };
      
      // 这里可以使用图表库渲染图表
      console.log('步数图表数据:', chartData);
    }
  },

  // 更新步数图表数据
  updateStepsChart(weeklySteps) {
    if (!weeklySteps || weeklySteps.length === 0) {
      return;
    }
    
    // 处理周数据，确保有7天的数据
    const today = new Date();
    const categories = [];
    const series = [];
    
    // 生成最近7天的日期
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = this.formatDate(date);
      const dayName = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
      
      categories.push(dayName);
      
      // 查找对应日期的步数
      const dayData = weeklySteps.find(item => item.date === dateStr);
      series.push(dayData ? dayData.steps : 0);
    }
    
    const chartData = {
      categories,
      series
    };
    
    // 保存周数据到页面数据中
    this.setData({
      weeklyStepsData: weeklySteps,
      stepsChartData: chartData
    });
    
    console.log('真实步数图表数据:', chartData);
  },
  
  // 加载饮水图表
  loadWaterChart() {
    const chartData = {
      categories: ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
      series: [250, 200, 300, 200, 250, 150, 200]
    };
    
    console.log('饮水图表数据:', chartData);
  },
  
  // 加载睡眠图表
  loadSleepChart() {
    const chartData = {
      categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      series: [7.2, 6.8, 7.5, 8.0, 7.3, 8.2, 7.5]
    };
    
    console.log('睡眠图表数据:', chartData);
  },
  
  // 加载运动图表
  loadExerciseChart() {
    const chartData = {
      categories: ['跑步', '瑜伽', '游泳', '骑行', '力量训练'],
      series: [25, 20, 0, 0, 0]
    };
    
    console.log('运动图表数据:', chartData);
  },
  
  // 快速添加饮水
  quickAddWater(e) {
    const amount = parseInt(e.currentTarget.dataset.amount);
    const currentWater = this.data.waterData.current;
    const newAmount = currentWater + amount;
    
    // 添加饮水记录
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newRecord = {
      time: timeStr,
      amount: amount
    };
    
    const records = this.data.waterData.records.concat([newRecord]);
    
    this.setData({
      'waterData.current': newAmount,
      'waterData.records': records,
      'todayData.water': newAmount
    });
    
    this.updateWaterData();
    
    // 保存到数据库
    this.saveWaterToDatabase(newAmount);
    
    wx.showToast({
      title: `已添加${amount}ml饮水`,
      icon: 'success'
    });
  },
  
  // 添加饮水（与wxml中的bindtap对应）
  addWater(e) {
    this.quickAddWater(e);
  },
  
  // 显示自定义饮水弹窗
  showCustomWater() {
    this.setData({
      showWaterModal: true,
      customWaterAmount: ''
    });
  },
  
  // 显示自定义饮水输入（与wxml中的bindtap对应）
  showCustomWaterInput() {
    this.setData({
      showCustomWaterModal: true,
      customWaterAmount: ''
    });
  },
  
  // 隐藏自定义饮水输入
  hideCustomWaterInput() {
    this.setData({
      showCustomWaterModal: false
    });
  },
  
  // 自定义饮水输入
  onCustomWaterInput(e) {
    this.setData({
      customWaterAmount: e.detail.value
    });
  },
  
  // 关闭自定义饮水弹窗
  hideWaterModal() {
    this.setData({
      showWaterModal: false
    });
  },
  
  // 输入自定义饮水量
  onWaterInput(e) {
    this.setData({
      customWaterAmount: e.detail.value
    });
  },
  
  // 确认添加自定义饮水
  confirmCustomWater() {
    const amount = parseInt(this.data.customWaterAmount);
    
    if (!amount || amount <= 0) {
      wx.showToast({
        title: '请输入有效的饮水量',
        icon: 'none'
      });
      return;
    }
    
    if (amount > 1000) {
      wx.showToast({
        title: '单次饮水量不能超过1000ml',
        icon: 'none'
      });
      return;
    }
    
    const currentWater = this.data.waterData.current;
    const newAmount = currentWater + amount;
    
    // 添加饮水记录
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newRecord = {
      time: timeStr,
      amount: amount
    };
    
    const records = this.data.waterData.records.concat([newRecord]);
    
    this.setData({
      'waterData.current': newAmount,
      'waterData.records': records,
      'todayData.water': newAmount,
      showWaterModal: false,
      showCustomWaterModal: false
    });
    
    this.updateWaterData();
    
    // 保存到数据库
    this.saveWaterToDatabase(newAmount);
    
    wx.showToast({
      title: `已添加${amount}ml饮水`,
      icon: 'success'
    });
  },

  // 保存饮水数据到数据库
  saveWaterToDatabase(waterAmount) {
    wx.cloud.callFunction({
      name: 'healthDataManager',
      data: {
        action: 'inputHealthData',
        healthData: {
          water_ml: waterAmount
        }
      },
      success: (res) => {
        console.log('饮水数据保存成功:', res);
      },
      fail: (error) => {
        console.error('饮水数据保存失败:', error);
      }
    });
  },
  
  // 导出数据
  exportData() {
    wx.showLoading({
      title: '正在导出数据...'
    });
    
    // 模拟导出过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '数据导出成功',
        icon: 'success'
      });
    }, 2000);
  },
  
  // 同步数据
  syncData() {
    wx.showLoading({
      title: '正在同步数据...'
    });
    
    // 模拟同步过程
    setTimeout(() => {
      wx.hideLoading();
      
      // 切换回"今日"标签
      this.setData({
        currentRange: 'day'
      });
      
      // 刷新数据
      this.refreshData();
      
      // 重新加载今日数据
      this.loadRangeData('day');
      
      wx.showToast({
        title: '数据同步成功',
        icon: 'success'
      });
    }, 1500);
  },
  
  // 打开设置
  openSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },
  
  // 打开数据设置
  openDataSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  // 编辑饮水量
  editWater() {
    this.setData({
      showEditModal: true,
      editDataType: 'water',
      editValue: this.data.todayData.water || 0
    });
  },

  // 编辑睡眠时长
  editSleep() {
    this.setData({
      showEditModal: true,
      editDataType: 'sleep',
      editValue: this.data.todayData.sleep || 0
    });
  },

  // 编辑运动时长
  editExercise() {
    this.setData({
      showEditModal: true,
      editDataType: 'exercise',
      editValue: this.data.todayData.exercise || 0
    });
  },

  // 隐藏编辑弹窗
  hideEditModal() {
    this.setData({
      showEditModal: false,
      editDataType: '',
      editValue: ''
    });
  },

  // 编辑值输入
  onEditValueInput(e) {
    this.setData({
      editValue: e.detail.value
    });
  },

  // 确认编辑
  confirmEdit() {
    const { editDataType, editValue } = this.data;
    const value = parseFloat(editValue);
    
    if (!value || value < 0) {
      wx.showToast({
        title: '请输入有效的数值',
        icon: 'none'
      });
      return;
    }
    
    // 验证数值范围
    if (editDataType === 'water' && value > 5000) {
      wx.showToast({
        title: '饮水量不能超过5000ml',
        icon: 'none'
      });
      return;
    }
    
    if (editDataType === 'sleep' && value > 24) {
      wx.showToast({
        title: '睡眠时长不能超过24小时',
        icon: 'none'
      });
      return;
    }
    
    if (editDataType === 'exercise' && value > 1440) {
      wx.showToast({
        title: '运动时长不能超过1440分钟',
        icon: 'none'
      });
      return;
    }
    
    // 更新本地数据
    this.updateLocalData(editDataType, value);
    
    // 更新数据库
    this.updateHealthDataInDB(editDataType, value);
    
    // 隐藏弹窗
    this.hideEditModal();
    
    wx.showToast({
      title: '数据更新成功',
      icon: 'success'
    });
  },

  // 更新本地数据
  updateLocalData(dataType, value) {
    const updateData = {};
    
    // 更新今日数据概览
    updateData[`todayData.${dataType}`] = value;
    
    // 更新统计数据
    updateData[`statsData.${dataType}.day`] = value;
    
    // 根据数据类型更新相关显示
    if (dataType === 'water') {
      const waterProgress = Math.round((value / this.data.waterTarget) * 100);
      updateData.waterProgress = Math.min(waterProgress, 100);
      updateData['waterData.current'] = value;
    } else if (dataType === 'sleep') {
      updateData['sleepData.duration'] = value;
    } else if (dataType === 'exercise') {
      updateData['exerciseData.totalDuration'] = value;
    }
    
    this.setData(updateData);
    
    // 重新计算显示数据
    this.updateDisplayData(this.data.currentTab, this.data.currentRange);
  },

  // 更新数据库中的健康数据
  updateHealthDataInDB(dataType, value) {
    wx.showLoading({
      title: '正在保存数据...'
    });
    
    const healthData = {};
    
    // 根据数据类型设置对应字段
    if (dataType === 'water') {
      healthData.water_ml = value;
    } else if (dataType === 'sleep') {
      healthData.sleep_hours = value;
    } else if (dataType === 'exercise') {
      healthData.exercise_minutes = value;
    }
    
    wx.cloud.callFunction({
      name: 'healthDataManager',
      data: {
        action: 'inputHealthData',
        healthData: healthData
      },
      success: (res) => {
        wx.hideLoading();
        console.log('健康数据更新成功:', res);
        
        if (res.result && res.result.success) {
          // 重新加载今日数据
          this.loadTodayDataFromDB();
        } else {
          wx.showToast({
            title: '数据保存失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('健康数据更新失败:', error);
        wx.showToast({
          title: '数据保存失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 刷新数据
  refreshData() {
    this.loadTodayDataFromDB();
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.refreshData();
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },
  
  // 分享小程序
  onShareAppMessage() {
    return {
      title: '我的健康数据报告',
      path: '/pages/data/data',
      imageUrl: '/images/share-cover.svg'
    };
  },
  
  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '健康宠物伴侣 - 我的健康数据',
      imageUrl: '/images/share-cover.svg'
    };
  }
});