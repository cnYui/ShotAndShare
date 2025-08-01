// pages/profile/profile.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    version: '1.0.0',
    userInfo: {
      nickName: '健康达人',
      avatarUrl: '/images/default-avatar.png',
      id: 'HP001',
      level: 5,
      exp: 1580
    },
    petList: [
      {
        id: 1,
        name: '小橘',
        type: '橘猫',
        stage: '幼年期',
        level: 5,
        health: 85,
        imageUrl: '/images/pet-cat.png',
        isActive: true
      }
    ],
    statsData: [
      {
        id: 1,
        icon: 'icon-target',
        color: 'blue',
        value: '128',
        label: '完成任务'
      },
      {
        id: 2,
        icon: 'icon-calendar',
        color: 'green',
        value: '15',
        label: '连续天数'
      },
      {
        id: 3,
        icon: 'icon-trophy',
        color: 'yellow',
        value: '8',
        label: '获得成就'
      },
      {
        id: 4,
        icon: 'icon-heart',
        color: 'red',
        value: '95%',
        label: '健康指数'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadUserInfo();
    this.loadPetList();
    this.loadStatsData();
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
    this.loadUserInfo();
    this.loadStatsData();
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
    this.loadUserInfo();
    this.loadPetList();
    this.loadStatsData();
    wx.stopPullDownRefresh();
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
      title: '我在健康养宠小程序中养了一只可爱的宠物！',
      path: '/pages/profile/profile'
    };
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: {
          ...this.data.userInfo,
          ...userInfo
        }
      });
    }
  },

  /**
   * 加载宠物列表
   */
  loadPetList() {
    // 模拟从服务器获取宠物列表
    const petList = [
      {
        id: 1,
        name: '小橘',
        type: '橘猫',
        stage: '幼年期',
        level: 5,
        health: 85,
        imageUrl: '/images/pet-cat.png',
        isActive: true
      }
    ];
    
    this.setData({ petList });
  },

  /**
   * 加载统计数据
   */
  loadStatsData() {
    // 模拟从服务器获取统计数据
    const statsData = [
      {
        id: 1,
        icon: 'icon-target',
        color: 'blue',
        value: '128',
        label: '完成任务'
      },
      {
        id: 2,
        icon: 'icon-calendar',
        color: 'green',
        value: '15',
        label: '连续天数'
      },
      {
        id: 3,
        icon: 'icon-trophy',
        color: 'yellow',
        value: '8',
        label: '获得成就'
      },
      {
        id: 4,
        icon: 'icon-heart',
        color: 'red',
        value: '95%',
        label: '健康指数'
      }
    ];
    
    this.setData({ statsData });
  },

  /**
   * 更换头像
   */
  changeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // 这里应该上传到服务器
        this.setData({
          'userInfo.avatarUrl': tempFilePath
        });
        
        // 保存到本地存储
        const userInfo = { ...this.data.userInfo, avatarUrl: tempFilePath };
        wx.setStorageSync('userInfo', userInfo);
        
        wx.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 编辑个人资料
   */
  editProfile() {
    wx.showModal({
      title: '编辑昵称',
      editable: true,
      placeholderText: '请输入昵称',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            'userInfo.nickName': res.content
          });
          
          // 保存到本地存储
          const userInfo = { ...this.data.userInfo, nickName: res.content };
          wx.setStorageSync('userInfo', userInfo);
          
          wx.showToast({
            title: '昵称更新成功',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 添加宠物
   */
  addPet() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 选择宠物
   */
  selectPet(e) {
    const pet = e.currentTarget.dataset.pet;
    
    if (pet.isActive) {
      return;
    }
    
    // 更新宠物状态
    const petList = this.data.petList.map(item => ({
      ...item,
      isActive: item.id === pet.id
    }));
    
    this.setData({ petList });
    
    wx.showToast({
      title: `已切换到${pet.name}`,
      icon: 'success'
    });
  },

  /**
   * 跳转到数据分析
   */
  goToDataAnalysis() {
    wx.switchTab({
      url: '/pages/data/data'
    });
  },

  /**
   * 跳转到成就中心
   */
  goToAchievements() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 跳转到提醒设置
   */
  goToReminders() {
    wx.showActionSheet({
      itemList: ['运动提醒', '饮食提醒', '睡眠提醒', '喝水提醒'],
      success: (res) => {
        const reminders = ['运动', '饮食', '睡眠', '喝水'];
        wx.showToast({
          title: `设置${reminders[res.tapIndex]}提醒`,
          icon: 'success'
        });
      }
    });
  },

  /**
   * 跳转到应用设置
   */
  goToSettings() {
    wx.showActionSheet({
      itemList: ['通知设置', '隐私设置', '主题设置', '语言设置'],
      success: (res) => {
        const settings = ['通知', '隐私', '主题', '语言'];
        wx.showToast({
          title: `${settings[res.tapIndex]}设置`,
          icon: 'none'
        });
      }
    });
  },

  /**
   * 跳转到帮助中心
   */
  goToHelp() {
    wx.showModal({
      title: '帮助中心',
      content: '1. 如何添加宠物？\n2. 如何完成健康任务？\n3. 如何查看数据报告？\n4. 如何设置提醒？',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 跳转到意见反馈
   */
  goToFeedback() {
    wx.showModal({
      title: '意见反馈',
      editable: true,
      placeholderText: '请输入您的建议或意见...',
      success: (res) => {
        if (res.confirm && res.content) {
          wx.showToast({
            title: '反馈提交成功',
            icon: 'success'
          });
        }
      }
    });
  }
});