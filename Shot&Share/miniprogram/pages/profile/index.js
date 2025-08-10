// profile.js
Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    stats: {
      totalGenerated: 0,
      totalSaved: 0,
      totalShared: 0
    },
    preferences: {
      favoriteStyles: [],
      defaultStyle: '文艺治愈',
      autoSave: true
    },
    menuItems: [
      {
        id: 'history',
        title: '历史记录',
        desc: '查看生成的文案记录',
        icon: '📝',
        arrow: true
      },
      {
        id: 'favorites',
        title: '收藏文案',
        desc: '查看收藏的文案',
        icon: '❤️',
        arrow: true
      },
      {
        id: 'settings',
        title: '偏好设置',
        desc: '个性化设置',
        icon: '⚙️',
        arrow: true
      },
      {
        id: 'feedback',
        title: '意见反馈',
        desc: '帮助我们改进',
        icon: '💬',
        arrow: true
      },
      {
        id: 'about',
        title: '关于我们',
        desc: '了解Shot&Share',
        icon: 'ℹ️',
        arrow: true
      }
    ]
  },

  onLoad: function () {
    console.log('个人中心页面加载')
    this.loadUserInfo()
  },

  onShow: function () {
    this.loadUserInfo()
  },

  /**
   * 加载用户信息
   */
  loadUserInfo: function() {
    const app = getApp()
    
    // 检查用户信息
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
    
    // 加载用户数据
    if (app.globalData.openid) {
      this.loadUserData()
    }
  },

  /**
   * 加载用户数据
   */
  loadUserData: function() {
    const app = getApp()
    
    if (!app.globalData.openid) {
      console.log('用户未登录，跳过数据加载')
      return
    }
    
    // 先初始化数据库（确保集合存在）
    wx.cloud.callFunction({
      name: 'initDatabase'
    }).then(() => {
      // 数据库初始化完成后，查询用户数据
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
          },
          preferences: user.preferences || {
            favoriteStyles: [],
            defaultStyle: '文艺治愈',
            autoSave: true
          }
        })
      } else {
        // 用户不存在，创建新用户记录
        this.createUserRecord()
      }
    }).catch(err => {
      console.error('加载用户数据失败:', err)
      if (err.errCode === -502005) {
        app.showToast('正在初始化数据库，请稍后重试')
        // 延迟重试
        setTimeout(() => {
          this.loadUserData()
        }, 2000)
      } else {
        app.showToast('加载用户数据失败')
      }
    })
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function() {
    const app = getApp()
    
    app.showLoading('登录中...')
    
    app.getUserInfo()
      .then(userInfo => {
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })
        
        // 更新用户登录信息
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
        this.loadUserData()
      })
      .catch(err => {
        console.error('获取用户信息失败:', err)
        app.hideLoading()
        app.showToast('获取用户信息失败')
      })
  },

  /**
   * 创建用户记录
   */
  createUserRecord: function() {
    const app = getApp()
    
    if (!app.globalData.openid || !app.globalData.userInfo) {
      return
    }
    
    const userData = {
      openid: app.globalData.openid,
      nickname: app.globalData.userInfo.nickName || '微信用户',
      avatar: app.globalData.userInfo.avatarUrl || '',
      gender: app.globalData.userInfo.gender || 0,
      city: app.globalData.userInfo.city || '',
      province: app.globalData.userInfo.province || '',
      country: app.globalData.userInfo.country || '',
      language: app.globalData.userInfo.language || 'zh_CN',
      preferences: {
        favoriteStyles: [],
        defaultStyle: '文艺治愈',
        autoSave: true
      },
      statistics: {
        totalGenerated: 0,
        totalSaved: 0,
        totalShared: 0
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date()
    }
    
    wx.cloud.database().collection('users')
      .add({
        data: userData
      })
      .then(res => {
        console.log('用户记录创建成功:', res._id)
        this.setData({
          stats: userData.statistics,
          preferences: userData.preferences
        })
      })
      .catch(err => {
        console.error('创建用户记录失败:', err)
      })
  },

  /**
   * 菜单项点击
   */
  onMenuClick: function(e) {
    const { id } = e.currentTarget.dataset
    
    switch (id) {
      case 'history':
        wx.navigateTo({
          url: '/pages/history/index'
        })
        break
      case 'favorites':
        this.showFavorites()
        break
      case 'settings':
        this.showSettings()
        break
      case 'feedback':
        this.showFeedback()
        break
      case 'about':
        this.showAbout()
        break
      default:
        console.log('未知菜单项:', id)
    }
  },

  /**
   * 显示收藏文案
   */
  showFavorites: function() {
    const app = getApp()
    
    if (!app.globalData.openid) {
      app.showToast('请先登录')
      return
    }
    
    wx.navigateTo({
      url: '/pages/favorites/index'
    })
  },

  /**
   * 显示设置页面
   */
  showSettings: function() {
    wx.showActionSheet({
      itemList: ['默认文案风格', '自动保存设置', '清除缓存'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.showStyleSettings()
            break
          case 1:
            this.toggleAutoSave()
            break
          case 2:
            this.clearCache()
            break
        }
      }
    })
  },

  /**
   * 显示风格设置
   */
  showStyleSettings: function() {
    const styles = ['文艺治愈', '幽默搞笑', '励志正能量', '浪漫温馨', '哲理深度', '日常生活']
    
    wx.showActionSheet({
      itemList: styles,
      success: (res) => {
        const selectedStyle = styles[res.tapIndex]
        this.updatePreferences({
          defaultStyle: selectedStyle
        })
        getApp().showToast(`默认风格已设置为：${selectedStyle}`, 'success')
      }
    })
  },

  /**
   * 切换自动保存
   */
  toggleAutoSave: function() {
    const newAutoSave = !this.data.preferences.autoSave
    
    this.updatePreferences({
      autoSave: newAutoSave
    })
    
    getApp().showToast(`自动保存已${newAutoSave ? '开启' : '关闭'}`, 'success')
  },

  /**
   * 更新用户偏好
   */
  updatePreferences: function(updates) {
    const app = getApp()
    
    if (!app.globalData.openid) {
      return
    }
    
    const newPreferences = {
      ...this.data.preferences,
      ...updates
    }
    
    this.setData({
      preferences: newPreferences
    })
    
    // 更新数据库
    wx.cloud.database().collection('users')
      .where({ openid: app.globalData.openid })
      .get()
      .then(res => {
        if (res.data.length > 0) {
          return wx.cloud.database().collection('users')
            .doc(res.data[0]._id)
            .update({
              data: {
                preferences: newPreferences,
                updatedAt: new Date()
              }
            })
        }
      })
      .catch(err => {
        console.error('更新用户偏好失败:', err)
      })
  },

  /**
   * 清除缓存
   */
  clearCache: function() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？这将删除本地保存的临时文件。',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage({
            success: () => {
              getApp().showToast('缓存清除成功', 'success')
            },
            fail: () => {
              getApp().showToast('缓存清除失败')
            }
          })
        }
      }
    })
  },

  /**
   * 显示意见反馈
   */
  showFeedback: function() {
    wx.showModal({
      title: '意见反馈',
      content: '如有问题或建议，请通过以下方式联系我们：\n\n微信：shotshare2024\n邮箱：feedback@shotshare.com',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  /**
   * 显示关于我们
   */
  showAbout: function() {
    wx.showModal({
      title: '关于Shot&Share',
      content: 'Shot&Share是一款智能朋友圈配文助手，基于先进的AI技术，为您的图片生成精美的文案。\n\n版本：1.0.0\n开发者：Shot&Share团队',
      showCancel: false,
      confirmText: '知道了'
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
  }
})