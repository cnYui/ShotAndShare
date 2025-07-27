// app.js
const i18n = require('./utils/i18n.js');
const themeManager = require('./utils/theme.js');

App({
  globalData: {
    env: "cloud1-6g4qsd2kcddd1be0",
    userInfo: null,
    petInfo: null,
    isLoggedIn: false,
    i18n: null,
    themeManager: null
  },

  onLaunch() {
    this.initCloudBase();
    this.initThemeAndLanguage();
    this.checkLoginStatus();
  },
  
  // 初始化主题和语言
  initThemeAndLanguage() {
    // 初始化主题管理器
    themeManager.loadTheme();
    
    // 初始化国际化
    i18n.loadLanguage();
    
    // 将管理器实例添加到全局数据
    this.globalData.i18n = i18n;
    this.globalData.themeManager = themeManager;
  },

  initCloudBase() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
  },

  async checkLoginStatus() {
    // 先检查本地存储
    const localUserInfo = wx.getStorageSync('userInfo');
    const localPetInfo = wx.getStorageSync('petInfo');
    const localLoginStatus = wx.getStorageSync('isLoggedIn');
    
    if (localUserInfo && localPetInfo && localLoginStatus) {
      this.globalData.userInfo = localUserInfo;
      this.globalData.petInfo = localPetInfo;
      this.globalData.isLoggedIn = true;
      return;
    }
    
    // 如果本地没有，尝试云端验证
    try {
      // 先调用wx.login获取code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        });
      });
      
      const result = await wx.cloud.callFunction({
        name: 'login',
        data: {
          code: loginRes.code
        }
      });

      if (result.result.success) {
        const userData = result.result.data;
        this.globalData.userInfo = userData.user;
        this.globalData.petInfo = userData.pet;
        this.globalData.isLoggedIn = true;
        
        // 保存到本地存储
        wx.setStorageSync('userInfo', userData.user);
        wx.setStorageSync('petInfo', userData.pet);
        wx.setStorageSync('isLoggedIn', true);
      } else {
        this.globalData.isLoggedIn = false;
      }
    } catch (error) {
      console.log('用户未登录或登录检查失败');
      this.globalData.isLoggedIn = false;
    }
  },

  // 全局登录方法
  requireLogin() {
    if (!this.globalData.isLoggedIn) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return false;
    }
    return true;
  }
});
