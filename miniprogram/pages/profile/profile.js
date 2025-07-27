// 个人设置页面逻辑
Page({
  data: {
    // 用户信息
    userInfo: {
      avatar: '/images/default-avatar.png',
      name: '健康达人',
      level: 15,
      title: '养生专家',
      totalDays: 128,
      totalTasks: 456,
      totalExp: 8520,
      signature: '每天都要健康快乐！'
    },
    
    // 宠物信息
    petInfo: {
      avatar: '/images/default-pet.png',
      name: '小绿',
      level: 12,
      type: '健康小助手',
      mood: '开心'
    },
    
    // 设置选项
    settings: {
      taskNotification: true,
      waterReminder: true,
      sleepReminder: false,
      dataSync: true,
      theme: '自动',
      language: '简体中文'
    },
    
    // 应用信息
    appVersion: '1.0.0',
    cacheSize: '12.5MB',
    
    // 编辑弹窗
    showEditModal: false,
    editUserInfo: {
      name: '',
      signature: ''
    }
  },
  
  onLoad() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.userInfo) {
      app.requireLogin();
      return;
    }
    
    this.loadUserInfo();
    this.loadPetInfo();
    this.loadSettings();
    this.calculateCacheSize();
  },
  
  onShow() {
    this.refreshUserData();
  },
  
  // 加载用户信息
  loadUserInfo() {
    const app = getApp();
    const globalUserInfo = app.globalData.userInfo;
    
    if (globalUserInfo) {
      // 从全局数据获取用户信息
      this.setData({
        userInfo: {
          ...this.data.userInfo,
          avatar: globalUserInfo.avatar_url || '/images/default-avatar.png',
          name: globalUserInfo.nickname || '健康达人',
          signature: globalUserInfo.signature || '每天都要健康快乐！'
        }
      });
      
      // 获取用户统计数据
      this.loadUserStats();
    } else {
      // 从本地存储获取
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({
          userInfo: { ...this.data.userInfo, ...userInfo }
        });
      }
    }
  },
  
  // 加载用户统计数据
  loadUserStats() {
    wx.cloud.callFunction({
      name: 'userManager',
      data: {
        action: 'getUserStats'
      },
      success: (res) => {
        if (res.result.success) {
          const stats = res.result.data;
          this.setData({
            'userInfo.totalDays': stats.total_days || 0,
            'userInfo.totalTasks': stats.total_tasks || 0,
            'userInfo.totalExp': stats.total_exp || 0,
            'userInfo.level': stats.level || 1
          });
        }
      },
      fail: (err) => {
        console.error('获取用户统计失败:', err);
      }
    });
  },
  
  // 加载宠物信息
  loadPetInfo() {
    const app = getApp();
    const globalPetInfo = app.globalData.petInfo;
    
    if (globalPetInfo) {
      this.setData({
        petInfo: {
          avatar: globalPetInfo.avatar || '/images/default-pet.png',
          name: globalPetInfo.name || '小绿',
          level: globalPetInfo.level || 1,
          type: globalPetInfo.type || '健康小助手',
          mood: this.getPetMoodText(globalPetInfo)
        }
      });
    }
  },
  
  // 获取宠物心情文本
  getPetMoodText(petInfo) {
    if (petInfo.health >= 80 && petInfo.vitality >= 80) {
      return '非常开心';
    } else if (petInfo.health >= 60 && petInfo.vitality >= 60) {
      return '开心';
    } else if (petInfo.health >= 40 && petInfo.vitality >= 40) {
      return '一般';
    } else {
      return '需要关爱';
    }
  },
  
  // 获取微信用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const { userInfo } = res;
        this.setData({
          'userInfo.avatar': userInfo.avatarUrl,
          'userInfo.name': userInfo.nickName
        });
        
        // 保存到本地存储
        wx.setStorageSync('userInfo', {
          avatar: userInfo.avatarUrl,
          name: userInfo.nickName
        });
      },
      fail: (err) => {
        console.log('获取用户信息失败:', err);
      }
    });
  },
  
  // 加载设置
  loadSettings() {
    const settings = wx.getStorageSync('settings');
    if (settings) {
      this.setData({
        settings: { ...this.data.settings, ...settings }
      });
    }
  },
  
  // 刷新用户数据
  refreshUserData() {
    this.loadUserStats();
    this.loadPetInfo();
  },
  
  // 计算缓存大小
  calculateCacheSize() {
    // 模拟计算缓存大小
    const size = (Math.random() * 20 + 5).toFixed(1);
    this.setData({
      cacheSize: `${size}MB`
    });
  },
  
  // 编辑头像
  editAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // 这里可以上传到服务器
        this.uploadAvatar(tempFilePath);
      },
      fail: (err) => {
        console.log('选择图片失败:', err);
      }
    });
  },
  
  // 上传头像
  uploadAvatar(filePath) {
    wx.showLoading({
      title: '上传中...'
    });
    
    // 模拟上传过程
    setTimeout(() => {
      wx.hideLoading();
      
      this.setData({
        'userInfo.avatar': filePath
      });
      
      // 保存到本地存储
      const userInfo = wx.getStorageSync('userInfo') || {};
      userInfo.avatar = filePath;
      wx.setStorageSync('userInfo', userInfo);
      
      wx.showToast({
        title: '头像更新成功',
        icon: 'success'
      });
    }, 1500);
  },
  
  // 编辑宠物信息
  editPet() {
    wx.navigateTo({
      url: '/pages/pet-edit/pet-edit'
    });
  },
  
  // 显示编辑用户信息弹窗
  showEditUserInfo() {
    this.setData({
      showEditModal: true,
      editUserInfo: {
        name: this.data.userInfo.name,
        signature: this.data.userInfo.signature
      }
    });
  },
  
  // 隐藏编辑弹窗
  hideEditModal() {
    this.setData({
      showEditModal: false
    });
  },
  
  // 输入昵称
  onNameInput(e) {
    this.setData({
      'editUserInfo.name': e.detail.value
    });
  },
  
  // 输入个性签名
  onSignatureInput(e) {
    this.setData({
      'editUserInfo.signature': e.detail.value
    });
  },
  
  // 确认编辑
  confirmEdit() {
    const { name, signature } = this.data.editUserInfo;
    
    if (!name.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({ title: '保存中...' });
    
    // 调用云函数更新用户信息
    wx.cloud.callFunction({
      name: 'userManager',
      data: {
        action: 'updateUserInfo',
        nickname: name,
        signature: signature
      },
      success: (res) => {
        if (res.result.success) {
          this.setData({
            'userInfo.name': name,
            'userInfo.signature': signature,
            showEditModal: false
          });
          
          // 更新全局用户信息
          const app = getApp();
          if (app.globalData.userInfo) {
            app.globalData.userInfo.nickname = name;
            app.globalData.userInfo.signature = signature;
          }
          
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.result.error || '保存失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('更新用户信息失败:', err);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  
  // 任务提醒开关
  onTaskNotificationChange(e) {
    const value = e.detail.value;
    this.setData({
      'settings.taskNotification': value
    });
    this.saveSettings();
    
    if (value) {
      this.requestNotificationPermission();
    }
  },
  
  // 饮水提醒开关
  onWaterReminderChange(e) {
    const value = e.detail.value;
    this.setData({
      'settings.waterReminder': value
    });
    this.saveSettings();
    
    if (value) {
      this.requestNotificationPermission();
    }
  },
  
  // 睡眠提醒开关
  onSleepReminderChange(e) {
    const value = e.detail.value;
    this.setData({
      'settings.sleepReminder': value
    });
    this.saveSettings();
    
    if (value) {
      this.requestNotificationPermission();
    }
  },
  
  // 数据同步开关
  onDataSyncChange(e) {
    const value = e.detail.value;
    this.setData({
      'settings.dataSync': value
    });
    this.saveSettings();
    
    wx.showToast({
      title: value ? '已开启数据同步' : '已关闭数据同步',
      icon: 'success'
    });
  },
  
  // 请求通知权限
  requestNotificationPermission() {
    wx.requestSubscribeMessage({
      tmplIds: ['template_id_1', 'template_id_2'],
      success: (res) => {
        console.log('订阅消息成功:', res);
      },
      fail: (err) => {
        console.log('订阅消息失败:', err);
      }
    });
  },
  
  // 保存设置
  saveSettings() {
    wx.setStorageSync('settings', this.data.settings);
  },
  
  // 打开隐私政策
  openPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    });
  },
  
  // 打开主题设置
  openThemeSettings() {
    const themes = ['自动', '浅色', '深色'];
    
    wx.showActionSheet({
      itemList: themes,
      success: (res) => {
        const selectedTheme = themes[res.tapIndex];
        this.setData({
          'settings.theme': selectedTheme
        });
        this.saveSettings();
        
        wx.showToast({
          title: `已切换到${selectedTheme}主题`,
          icon: 'success'
        });
      }
    });
  },
  
  // 打开语言设置
  openLanguageSettings() {
    const languages = ['简体中文', '繁体中文', 'English'];
    
    wx.showActionSheet({
      itemList: languages,
      success: (res) => {
        const selectedLanguage = languages[res.tapIndex];
        this.setData({
          'settings.language': selectedLanguage
        });
        this.saveSettings();
        
        wx.showToast({
          title: `语言已切换为${selectedLanguage}`,
          icon: 'success'
        });
      }
    });
  },
  
  // 清理缓存
  clearCache() {
    wx.showModal({
      title: '清理缓存',
      content: '确定要清理应用缓存吗？这将删除临时文件和图片缓存。',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '清理中...'
          });
          
          // 模拟清理过程
          setTimeout(() => {
            wx.hideLoading();
            
            this.setData({
              cacheSize: '0.5MB'
            });
            
            wx.showToast({
              title: '缓存清理完成',
              icon: 'success'
            });
          }, 2000);
        }
      }
    });
  },
  
  // 检查更新
  checkUpdate() {
    wx.showLoading({
      title: '检查更新中...'
    });
    
    // 模拟检查更新
    setTimeout(() => {
      wx.hideLoading();
      
      wx.showModal({
        title: '检查更新',
        content: '当前已是最新版本',
        showCancel: false
      });
    }, 1500);
  },
  
  // 打开关于页面
  openAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    });
  },
  
  // 打开意见反馈
  openFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },
  
  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除全局数据
          const app = getApp();
          app.globalData.userInfo = null;
          app.globalData.petInfo = null;
          app.globalData.isLoggedIn = false;
          
          // 清除本地存储
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('petInfo');
          wx.removeStorageSync('isLoggedIn');
          wx.removeStorageSync('chatHistory');
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          
          // 跳转到登录页面
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/login/login'
            });
          }, 1500);
        }
      }
    });
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.refreshUserData();
    this.calculateCacheSize();
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },
  
  // 分享小程序
  onShareAppMessage() {
    return {
      title: '健康宠物伴侣 - 让健康生活更有趣',
      path: '/pages/home/home',
      imageUrl: '/images/share-cover.svg'
    };
  },
  
  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '健康宠物伴侣 - 我的健康档案',
      imageUrl: '/images/share-cover.svg'
    };
  }
});