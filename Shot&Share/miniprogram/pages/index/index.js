// index.js
Page({
  data: {
    userInfo: null,
    hasUserInfo: false,

    stats: {
      totalGenerated: 0,
      totalSaved: 0,
      totalShared: 0
    },
    loading: false
  },

  onLoad: function () {
    console.log('首页加载')
    this.checkUserInfo()
    this.loadUserStats()
  },

  onShow: function () {
    // 页面显示时刷新用户统计
    this.loadUserStats()
  },

  /**
   * 检查用户信息
   */
  checkUserInfo: function() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function() {
    const app = getApp()
    
    app.showLoading('获取用户信息中...')
    
    app.getUserInfo()
      .then(userInfo => {
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })
        
        // 同时更新用户登录信息
        return wx.cloud.callFunction({
          name: 'login',
          data: {
            userInfo: userInfo
          }
        })
      })
      .then(res => {
        console.log('用户信息更新成功:', res)
        app.hideLoading()
        app.showToast('登录成功', 'success')
        
        // 重新加载用户统计
        this.loadUserStats()
      })
      .catch(err => {
        console.error('获取用户信息失败:', err)
        app.hideLoading()
        app.showToast('获取用户信息失败')
      })
  },

  /**
   * 加载用户统计数据
   */
  loadUserStats: function() {
    const app = getApp()
    
    if (!app.globalData.openid) {
      console.log('用户未登录，跳过统计数据加载')
      return
    }
    
    // 先初始化数据库（确保集合存在）
    wx.cloud.callFunction({
      name: 'initDatabase'
    }).then(() => {
      // 数据库初始化完成后，查询用户统计
      return wx.cloud.database().collection('users')
        .where({
          openid: app.globalData.openid
        })
        .get()
    }).then(res => {
      if (res.data.length > 0) {
        const user = res.data[0]
        this.setData({
          stats: user.statistics || {
            totalGenerated: 0,
            totalSaved: 0,
            totalShared: 0
          }
        })
      }
    }).catch(err => {
      console.error('加载用户统计失败:', err)
      // 静默处理错误，不影响页面正常显示
    })
  },



  /**
   * 跳转到文案生成页面
   */
  goToGenerate: function() {
    wx.navigateTo({
      url: '/pages/generate/index'
    })
  },

  /**
   * 跳转到历史记录页面
   */
  goToHistory: function() {
    wx.navigateTo({
      url: '/pages/history/index'
    })
  },

  /**
   * 跳转到个人中心页面
   */
  goToProfile: function() {
    wx.navigateTo({
      url: '/pages/profile/index'
    })
  },



  /**
   * 分享页面
   */
  onShareAppMessage: function() {
    return {
      title: 'Shot&Share - 智能朋友圈配文助手',
      desc: '上传图片，AI为你生成精美文案',
      path: '/pages/index/index'
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline: function() {
    return {
      title: 'Shot&Share - 智能朋友圈配文助手',
      query: '',
      imageUrl: ''
    }
  }
})
