Page({
  data: {
    userInfo: null,
    loading: false
  },

  onLoad() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  // 获取用户信息并登录
  onGetUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({ loading: true });
        this.loginWithUserInfo(res.userInfo);
      },
      fail: () => {
        wx.showToast({
          title: '需要授权才能使用',
          icon: 'none'
        });
      }
    });
  },

  // 调用登录云函数
  async loginWithUserInfo(userInfo) {
    try {
      // 先调用wx.login获取code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        });
      });
      
      console.log('wx.login成功，code:', loginRes.code);
      
      const result = await wx.cloud.callFunction({
        name: 'login',
        data: { 
          userInfo,
          code: loginRes.code
        }
      });

      if (result.result.success) {
        const userData = result.result.data;
        
        // 保存用户信息
        wx.setStorageSync('userInfo', userData.user);
        wx.setStorageSync('petInfo', userData.pet);
        wx.setStorageSync('isLoggedIn', true);
        
        // 更新全局状态
        const app = getApp();
        app.globalData.userInfo = userData.user;
        app.globalData.petInfo = userData.pet;
        app.globalData.isLoggedIn = true;
        
        this.setData({ 
          userInfo: userData.user,
          loading: false 
        });
        
        wx.showToast({
          title: userData.isNewUser ? '注册成功' : '登录成功',
          icon: 'success'
        });
        
        setTimeout(() => this.navigateBack(), 1500);
      } else {
        throw new Error(result.result.error);
      }
    } catch (error) {
      console.error('登录失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    }
  },

  onContinue() {
    this.navigateBack();
  },

  navigateBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/home/home' });
    }
  }
});