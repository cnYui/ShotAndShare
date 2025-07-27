// 健康数据页面逻辑
Page({
  data: {
    // 当前选中的分类
    activeCategory: 'steps',
    // 当前选中的时间范围
    activeRange: 'day',
    
    // 今日数据概览
    todayData: {
      steps: 8520,
      water: 1200,
      sleep: 7.5,
      exercise: 45
    },
    
    // 目标数据
    targets: {
      steps: 10000,
      water: 2000,
      sleep: 8,
      exercise: 60
    },
    
    // 步数数据
    stepsData: {
      current: 8520,
      target: 10000,
      completion: 85.2,
      remaining: 1480,
      weeklyAverage: 8200,
      insights: '今天的步数比昨天多了1200步，继续保持！'
    },
    
    // 饮水数据
    waterData: {
      current: 1200,
      target: 2000,
      completion: 60,
      remaining: 800,
      records: [
        { time: '08:00', amount: 250 },
        { time: '10:30', amount: 200 },
        { time: '12:00', amount: 300 },
        { time: '14:30', amount: 200 },
        { time: '16:00', amount: 250 }
      ],
      insights: '建议在下午增加饮水量，保持身体水分平衡。'
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
    currentDate: ''
  },
  
  onLoad() {
    // 设置当前日期
    const today = new Date();
    const currentDate = `${today.getMonth() + 1}月${today.getDate()}日`;
    this.setData({
      currentDate: currentDate
    });
    
    this.loadTodayData();
    this.updateProgressStyles();
  },
  
  onShow() {
    this.refreshData();
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
    // 首先尝试获取微信步数数据
    this.getWeChatStepsData().then(stepsData => {
      // 使用真实步数数据，其他数据暂时保持模拟
      const todayData = {
        steps: stepsData.steps || 0,
        water: Math.floor(Math.random() * 800) + 800,
        sleep: Math.round((Math.random() * 2 + 6.5) * 10) / 10,
        exercise: Math.floor(Math.random() * 40) + 30
      };
      
      this.setData({
        todayData: todayData
      });
      
      this.updateStepsData();
      this.updateWaterData();
    }).catch(error => {
      console.error('获取微信步数失败:', error);
      // 如果获取微信步数失败，使用模拟数据
      const mockData = {
        steps: Math.floor(Math.random() * 5000) + 6000,
        water: Math.floor(Math.random() * 800) + 800,
        sleep: Math.round((Math.random() * 2 + 6.5) * 10) / 10,
        exercise: Math.floor(Math.random() * 40) + 30
      };
      
      this.setData({
        todayData: mockData
      });
      
      this.updateStepsData();
      this.updateWaterData();
    });
  },
  
  // 更新步数数据
  updateStepsData() {
    const { steps } = this.data.todayData;
    const target = this.data.targets.steps;
    const completion = Math.round((steps / target) * 100 * 10) / 10;
    
    this.setData({
      'stepsData.current': steps,
      'stepsData.completion': completion,
      'stepsData.remaining': Math.max(0, target - steps)
    });
  },
  
  // 更新饮水数据
  updateWaterData() {
    const { water } = this.data.todayData;
    const target = this.data.targets.water;
    const completion = Math.round((water / target) * 100);
    
    this.setData({
      'waterData.current': water,
      'waterData.completion': completion,
      'waterData.remaining': Math.max(0, target - water)
    });
  },
  
  // 更新进度条样式
  updateProgressStyles() {
    const completion = this.data.stepsData.completion;
    const progressElement = this.selectComponent('.progress-circle');
    if (progressElement) {
      progressElement.setStyle({
        '--progress': `${completion}%`
      });
    }
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
  
  // 切换时间范围
  switchRange(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({
      activeRange: range
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
    // 根据时间范围调用不同的API
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
    
    const records = [...this.data.waterData.records, newRecord];
    
    this.setData({
      'waterData.current': newAmount,
      'waterData.records': records,
      'todayData.water': newAmount
    });
    
    this.updateWaterData();
    
    wx.showToast({
      title: `已添加${amount}ml饮水`,
      icon: 'success'
    });
  },
  
  // 显示自定义饮水弹窗
  showCustomWater() {
    this.setData({
      showWaterModal: true,
      customWaterAmount: ''
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
    
    const records = [...this.data.waterData.records, newRecord];
    
    this.setData({
      'waterData.current': newAmount,
      'waterData.records': records,
      'todayData.water': newAmount,
      showWaterModal: false
    });
    
    this.updateWaterData();
    
    wx.showToast({
      title: `已添加${amount}ml饮水`,
      icon: 'success'
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
      this.refreshData();
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
  
  // 刷新数据
  refreshData() {
    this.loadTodayData();
    this.updateProgressStyles();
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