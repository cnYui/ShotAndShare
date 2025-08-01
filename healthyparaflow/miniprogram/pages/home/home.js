// pages/home/home.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentTime: '',
    refreshing: false,
    userInfo: {
      nickName: '小明',
      avatarUrl: '/images/default-avatar.png'
    },
    petInfo: {
      name: '小橘',
      mood: '开心',
      stage: '幼年期',
      level: 5,
      exp: 320,
      maxExp: 500,
      expPercent: 64,
      health: 85,
      energy: 72,
      imageUrl: '/images/pet-cat.png',
      message: '主人，今天的天气真好呢！我们一起出去散步吧~'
    },
    completedTasks: 2,
    totalTasks: 5,
    taskCategories: [
      {
        id: 1,
        name: '运动',
        icon: 'icon-walking',
        completed: true
      },
      {
        id: 2,
        name: '饮食',
        icon: 'icon-apple',
        completed: true
      },
      {
        id: 3,
        name: '睡眠',
        icon: 'icon-moon',
        completed: false
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.updateTime();
    this.loadUserInfo();
    this.loadPetInfo();
    this.loadTaskData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 设置定时器更新时间
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 60000); // 每分钟更新一次
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时刷新数据
    this.loadPetInfo();
    this.loadTaskData();
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
    // 清除定时器
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
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
      title: '我的宠物' + this.data.petInfo.name + '正在健康成长！',
      path: '/pages/home/home'
    };
  },

  /**
   * 更新当前时间
   */
  updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.setData({
      currentTime: `${hours}:${minutes}`
    });
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    // 从本地存储或服务器获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      });
    }
  },

  /**
   * 加载宠物信息
   */
  loadPetInfo() {
    // 模拟从服务器获取宠物信息
    // 实际项目中应该调用API
    const petInfo = {
      name: '小橘',
      mood: '开心',
      stage: '幼年期',
      level: 5,
      exp: 320,
      maxExp: 500,
      expPercent: Math.round((320 / 500) * 100),
      health: 85,
      energy: 72,
      imageUrl: '/images/pet-cat.png',
      message: this.getRandomPetMessage()
    };
    
    this.setData({
      petInfo: petInfo
    });
  },

  /**
   * 加载任务数据
   */
  loadTaskData() {
    // 模拟从服务器获取任务数据
    const taskData = {
      completedTasks: 2,
      totalTasks: 5,
      taskCategories: [
        {
          id: 1,
          name: '运动',
          icon: 'icon-walking',
          completed: true
        },
        {
          id: 2,
          name: '饮食',
          icon: 'icon-apple',
          completed: true
        },
        {
          id: 3,
          name: '睡眠',
          icon: 'icon-moon',
          completed: false
        }
      ]
    };
    
    this.setData(taskData);
  },

  /**
   * 获取随机宠物消息
   */
  getRandomPetMessage() {
    const messages = [
      '主人，今天的天气真好呢！我们一起出去散步吧~',
      '我今天学会了一个新技能，想要看看吗？',
      '主人，记得按时吃饭哦，我会陪着你的！',
      '今天的任务完成得怎么样了？我们一起加油吧！',
      '主人，我想和你聊聊天，有什么有趣的事情吗？'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  },

  /**
   * 下拉刷新
   */
  onRefresh() {
    this.setData({
      refreshing: true
    });
    
    // 模拟刷新数据
    setTimeout(() => {
      this.loadPetInfo();
      this.loadTaskData();
      this.setData({
        refreshing: false
      });
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 跳转到任务页面
   */
  goToTasks() {
    wx.switchTab({
      url: '/pages/tasks/tasks'
    });
  },

  /**
   * 跳转到聊天页面
   */
  goToChat() {
    wx.switchTab({
      url: '/pages/chat/chat'
    });
  }
});