// pages/data/data.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    refreshing: false,
    petName: '小橘',
    selectedDate: '',
    showDatePicker: false,
    timeFilter: 'week',
    overviewData: [],
    chartData: [],
    healthMetrics: [],
    activityRecords: [],
    recentAchievements: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initDate();
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.onRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '我的宠物健康数据，一起来看看吧！',
      path: '/pages/data/data'
    };
  },

  /**
   * 初始化日期
   */
  initDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    this.setData({
      selectedDate: `${year}-${month}-${day}`
    });
  },

  /**
   * 加载数据
   */
  loadData() {
    this.loadOverviewData();
    this.loadChartData();
    this.loadHealthMetrics();
    this.loadActivityRecords();
    this.loadRecentAchievements();
  },

  /**
   * 加载概览数据
   */
  loadOverviewData() {
    const overviewData = [
      {
        id: 1,
        icon: 'icon-heart',
        color: 'red',
        value: '85',
        label: '健康值',
        trend: 1,
        trendText: '+5%'
      },
      {
        id: 2,
        icon: 'icon-target',
        color: 'blue',
        value: '12',
        label: '今日任务',
        trend: 0,
        trendText: '持平'
      },
      {
        id: 3,
        icon: 'icon-trophy',
        color: 'yellow',
        value: '1580',
        label: '总经验',
        trend: 1,
        trendText: '+120'
      },
      {
        id: 4,
        icon: 'icon-star',
        color: 'purple',
        value: '7',
        label: '连续天数',
        trend: 1,
        trendText: '+1天'
      }
    ];
    
    this.setData({ overviewData });
  },

  /**
   * 加载图表数据
   */
  loadChartData() {
    const { timeFilter } = this.data;
    let chartData = [];
    
    if (timeFilter === 'week') {
      chartData = [
        { label: '周一', value: 120, percentage: 60, color: '#FE5933' },
        { label: '周二', value: 150, percentage: 75, color: '#FE5933' },
        { label: '周三', value: 100, percentage: 50, color: '#FE5933' },
        { label: '周四', value: 180, percentage: 90, color: '#FE5933' },
        { label: '周五', value: 200, percentage: 100, color: '#FE5933' },
        { label: '周六', value: 160, percentage: 80, color: '#FE5933' },
        { label: '周日', value: 140, percentage: 70, color: '#FE5933' }
      ];
    } else if (timeFilter === 'month') {
      chartData = [
        { label: '第1周', value: 800, percentage: 80, color: '#FFDA6E' },
        { label: '第2周', value: 950, percentage: 95, color: '#FFDA6E' },
        { label: '第3周', value: 750, percentage: 75, color: '#FFDA6E' },
        { label: '第4周', value: 1000, percentage: 100, color: '#FFDA6E' }
      ];
    } else {
      chartData = [
        { label: '1月', value: 3200, percentage: 64, color: '#A8E6CF' },
        { label: '2月', value: 3800, percentage: 76, color: '#A8E6CF' },
        { label: '3月', value: 4200, percentage: 84, color: '#A8E6CF' },
        { label: '4月', value: 5000, percentage: 100, color: '#A8E6CF' }
      ];
    }
    
    this.setData({ chartData });
  },

  /**
   * 加载健康指标
   */
  loadHealthMetrics() {
    const healthMetrics = [
      {
        id: 1,
        name: '体重',
        value: '4.2',
        unit: 'kg',
        percentage: 70,
        min: '3.0',
        max: '6.0',
        status: 'green',
        statusText: '正常',
        description: '体重在正常范围内，继续保持良好的饮食习惯'
      },
      {
        id: 2,
        name: '运动量',
        value: '8500',
        unit: '步',
        percentage: 85,
        min: '5000',
        max: '10000',
        status: 'green',
        statusText: '良好',
        description: '今日运动量充足，有助于维持健康体重'
      },
      {
        id: 3,
        name: '睡眠时长',
        value: '7.5',
        unit: '小时',
        percentage: 94,
        min: '6',
        max: '8',
        status: 'green',
        statusText: '优秀',
        description: '睡眠质量很好，有助于身体恢复和成长'
      },
      {
        id: 4,
        name: '饮水量',
        value: '1.8',
        unit: 'L',
        percentage: 60,
        min: '1.5',
        max: '3.0',
        status: 'yellow',
        statusText: '偏低',
        description: '建议增加饮水量，保持身体水分平衡'
      }
    ];
    
    this.setData({ healthMetrics });
  },

  /**
   * 加载活动记录
   */
  loadActivityRecords() {
    const activityRecords = [
      {
        id: 1,
        type: 'green',
        title: '完成晨间散步',
        description: '与小橘一起完成了30分钟的晨间散步',
        time: '08:30',
        data: [
          { key: '步数', value: '3200步' },
          { key: '时长', value: '30分钟' },
          { key: '消耗', value: '120卡路里' }
        ]
      },
      {
        id: 2,
        type: 'blue',
        title: '记录饮食',
        description: '记录了早餐和午餐的营养摄入',
        time: '12:15',
        data: [
          { key: '蛋白质', value: '25g' },
          { key: '碳水', value: '45g' },
          { key: '脂肪', value: '15g' }
        ]
      },
      {
        id: 3,
        type: 'yellow',
        title: '健康提醒',
        description: '系统提醒该补充水分了',
        time: '14:00',
        data: null
      },
      {
        id: 4,
        type: 'purple',
        title: '获得成就',
        description: '连续签到7天，获得"坚持达人"称号',
        time: '20:00',
        data: [
          { key: '奖励经验', value: '+200' },
          { key: '奖励金币', value: '+50' }
        ]
      }
    ];
    
    this.setData({ activityRecords });
  },

  /**
   * 加载最近成就
   */
  loadRecentAchievements() {
    const recentAchievements = [
      {
        id: 1,
        name: '坚持达人',
        date: '今天',
        icon: 'icon-trophy',
        level: 'yellow'
      },
      {
        id: 2,
        name: '运动健将',
        date: '昨天',
        icon: 'icon-target',
        level: 'blue'
      },
      {
        id: 3,
        name: '早起鸟儿',
        date: '3天前',
        icon: 'icon-star',
        level: 'green'
      }
    ];
    
    this.setData({ recentAchievements });
  },

  /**
   * 切换时间筛选
   */
  switchTimeFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      timeFilter: filter
    });
    this.loadChartData();
  },

  /**
   * 显示日期选择器
   */
  showDatePicker() {
    this.setData({
      showDatePicker: true
    });
  },

  /**
   * 隐藏日期选择器
   */
  hideDatePicker() {
    this.setData({
      showDatePicker: false
    });
  },

  /**
   * 日期改变
   */
  onDateChange(e) {
    this.setData({
      selectedDate: e.detail.value,
      showDatePicker: false
    });
    this.loadData();
  },

  /**
   * 查看所有活动
   */
  viewAllActivities() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 添加数据
   */
  addData() {
    wx.showActionSheet({
      itemList: ['记录体重', '记录运动', '记录饮食', '记录睡眠'],
      success: (res) => {
        const actions = ['体重', '运动', '饮食', '睡眠'];
        wx.showToast({
          title: `添加${actions[res.tapIndex]}记录`,
          icon: 'success'
        });
      }
    });
  },

  /**
   * 下拉刷新
   */
  onRefresh() {
    this.setData({
      refreshing: true
    });
    
    setTimeout(() => {
      this.loadData();
      this.setData({
        refreshing: false
      });
      wx.stopPullDownRefresh();
    }, 1000);
  }
});