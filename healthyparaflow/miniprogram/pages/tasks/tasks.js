// pages/tasks/tasks.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    refreshing: false,
    petName: '小橘',
    completedTasks: 2,
    totalTasks: 8,
    currentCategory: 'all',
    categories: [
      { id: 'all', name: '全部' },
      { id: 'daily', name: '日常' },
      { id: 'weekly', name: '每周' },
      { id: 'achievement', name: '成就' }
    ],
    todayTasks: [],
    weeklyTasks: [],
    achievementTasks: [],
    todayCompletedCount: 0,
    weeklyCompletedCount: 0,
    achievementCompletedCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadTaskData();
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
      title: '我正在完成健康任务，一起来养宠物吧！',
      path: '/pages/tasks/tasks'
    };
  },

  /**
   * 加载任务数据
   */
  loadTaskData() {
    // 模拟从服务器获取任务数据
    const todayTasks = [
      {
        id: 1,
        title: '晨间散步',
        description: '带宠物出门散步30分钟',
        icon: 'icon-walking',
        reward: 50,
        completed: true,
        progress: 100,
        current: 30,
        target: 30,
        deadline: '今天 18:00前',
        canStart: false,
        canComplete: false
      },
      {
        id: 2,
        title: '健康饮食',
        description: '记录今日饮食，保持营养均衡',
        icon: 'icon-apple',
        reward: 30,
        completed: true,
        progress: 100,
        current: 3,
        target: 3,
        deadline: '今天 22:00前',
        canStart: false,
        canComplete: false
      },
      {
        id: 3,
        title: '充足睡眠',
        description: '保证8小时优质睡眠',
        icon: 'icon-moon',
        reward: 40,
        completed: false,
        progress: 75,
        current: 6,
        target: 8,
        deadline: '明天 07:00前',
        canStart: true,
        canComplete: false
      },
      {
        id: 4,
        title: '喝水提醒',
        description: '每日饮水8杯，保持身体水分',
        icon: 'icon-heart',
        reward: 20,
        completed: false,
        progress: 50,
        current: 4,
        target: 8,
        deadline: '今天 20:00前',
        canStart: false,
        canComplete: false
      },
      {
        id: 5,
        title: '宠物互动',
        description: '与宠物聊天互动15分钟',
        icon: 'icon-heart',
        reward: 35,
        completed: false,
        progress: 0,
        current: 0,
        target: 15,
        deadline: '今天 21:00前',
        canStart: true,
        canComplete: false
      }
    ];

    const weeklyTasks = [
      {
        id: 6,
        title: '户外运动',
        description: '每周至少3次户外运动',
        icon: 'icon-target',
        reward: 100,
        completed: false,
        progress: 67,
        current: 2,
        target: 3
      },
      {
        id: 7,
        title: '健康检查',
        description: '完成一次全面健康数据记录',
        icon: 'icon-heart',
        reward: 80,
        completed: true,
        progress: 100,
        current: 1,
        target: 1
      }
    ];

    const achievementTasks = [
      {
        id: 8,
        title: '连续签到达人',
        description: '连续签到7天',
        icon: 'icon-trophy',
        reward: 200,
        completed: false,
        progress: 71,
        current: 5,
        target: 7
      },
      {
        id: 9,
        title: '健康生活家',
        description: '完成100个健康任务',
        icon: 'icon-star',
        reward: 500,
        completed: false,
        progress: 45,
        current: 45,
        target: 100
      }
    ];

    // 计算完成数量
    const todayCompletedCount = todayTasks.filter(task => task.completed).length;
    const weeklyCompletedCount = weeklyTasks.filter(task => task.completed).length;
    const achievementCompletedCount = achievementTasks.filter(task => task.completed).length;
    const totalCompleted = todayCompletedCount + weeklyCompletedCount + achievementCompletedCount;
    const totalTasks = todayTasks.length + weeklyTasks.length + achievementTasks.length;

    this.setData({
      todayTasks,
      weeklyTasks,
      achievementTasks,
      todayCompletedCount,
      weeklyCompletedCount,
      achievementCompletedCount,
      completedTasks: totalCompleted,
      totalTasks: totalTasks
    });
  },

  /**
   * 切换分类
   */
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category
    });
  },

  /**
   * 切换任务完成状态
   */
  toggleTask(e) {
    const taskId = e.currentTarget.dataset.id;
    this.updateTaskStatus(taskId);
  },

  /**
   * 开始任务
   */
  startTask(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '任务已开始',
      icon: 'success'
    });
    
    // 更新任务状态
    this.updateTaskProgress(taskId);
  },

  /**
   * 完成任务
   */
  completeTask(e) {
    const taskId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认完成',
      content: '确认完成这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateTaskStatus(taskId, true);
          wx.showToast({
            title: '任务完成！',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 更新任务状态
   */
  updateTaskStatus(taskId, completed = null) {
    const updateTasks = (tasks) => {
      return tasks.map(task => {
        if (task.id === taskId) {
          const newCompleted = completed !== null ? completed : !task.completed;
          return {
            ...task,
            completed: newCompleted,
            progress: newCompleted ? 100 : task.progress,
            current: newCompleted ? task.target : task.current
          };
        }
        return task;
      });
    };

    const todayTasks = updateTasks(this.data.todayTasks);
    const weeklyTasks = updateTasks(this.data.weeklyTasks);
    const achievementTasks = updateTasks(this.data.achievementTasks);

    // 重新计算完成数量
    const todayCompletedCount = todayTasks.filter(task => task.completed).length;
    const weeklyCompletedCount = weeklyTasks.filter(task => task.completed).length;
    const achievementCompletedCount = achievementTasks.filter(task => task.completed).length;
    const totalCompleted = todayCompletedCount + weeklyCompletedCount + achievementCompletedCount;

    this.setData({
      todayTasks,
      weeklyTasks,
      achievementTasks,
      todayCompletedCount,
      weeklyCompletedCount,
      achievementCompletedCount,
      completedTasks: totalCompleted
    });
  },

  /**
   * 更新任务进度
   */
  updateTaskProgress(taskId) {
    // 模拟任务进度更新
    const updateTasks = (tasks) => {
      return tasks.map(task => {
        if (task.id === taskId && !task.completed) {
          const newCurrent = Math.min(task.current + 1, task.target);
          const newProgress = Math.round((newCurrent / task.target) * 100);
          const canComplete = newCurrent >= task.target;
          
          return {
            ...task,
            current: newCurrent,
            progress: newProgress,
            canComplete: canComplete,
            canStart: !canComplete
          };
        }
        return task;
      });
    };

    this.setData({
      todayTasks: updateTasks(this.data.todayTasks),
      weeklyTasks: updateTasks(this.data.weeklyTasks)
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
      this.loadTaskData();
      this.setData({
        refreshing: false
      });
      wx.stopPullDownRefresh();
    }, 1000);
  }
});