// app.js
App({
  onLaunch: function () {
    this.globalData = {
      // env 参数说明：
      //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
      //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
      //   如不填则使用默认环境（第一个创建的环境）
      env: "",
      userInfo: null,
      openid: null
    };
    
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
    
    // 获取用户openid
    this.getOpenid();
  },
  
  /**
   * 获取用户openid
   */
  getOpenid: function() {
    return new Promise((resolve, reject) => {
      if (this.globalData.openid) {
        resolve(this.globalData.openid);
        return;
      }
      
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          console.log('获取openid成功:', res.result.openid);
          this.globalData.openid = res.result.openid;
          
          // 用户登录成功后初始化数据库
          wx.cloud.callFunction({
            name: 'initDatabase'
          }).then(() => {
            console.log('数据库初始化成功');
          }).catch(err => {
            console.error('数据库初始化失败:', err);
          });
          
          resolve(res.result.openid);
        },
        fail: err => {
          console.error('获取openid失败:', err);
          reject(err);
        }
      });
    });
  },
  
  /**
   * 获取用户信息
   */
  getUserInfo: function() {
    return new Promise((resolve, reject) => {
      if (this.globalData.userInfo) {
        resolve(this.globalData.userInfo);
        return;
      }
      
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: res => {
          console.log('获取用户信息成功:', res.userInfo);
          this.globalData.userInfo = res.userInfo;
          resolve(res.userInfo);
        },
        fail: err => {
          console.error('获取用户信息失败:', err);
          reject(err);
        }
      });
    });
  },
  
  /**
   * 显示加载提示
   */
  showLoading: function(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    });
  },
  
  /**
   * 隐藏加载提示
   */
  hideLoading: function() {
    wx.hideLoading();
  },
  
  /**
   * 显示提示信息
   */
  showToast: function(title, icon = 'none', duration = 2000) {
    wx.showToast({
      title: title,
      icon: icon,
      duration: duration
    });
  }
});
