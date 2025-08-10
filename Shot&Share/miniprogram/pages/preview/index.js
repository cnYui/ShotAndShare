// preview.js
Page({
  data: {
    record: null,
    loading: true,
    recordId: '',
    imageLoaded: false
  },

  onLoad: function (options) {
    console.log('预览页面加载:', options)
    
    const { recordId } = options
    if (recordId) {
      this.setData({ recordId })
      this.loadRecord(recordId)
    } else {
      getApp().showToast('记录ID不能为空')
      wx.navigateBack()
    }
  },

  /**
   * 加载记录详情
   */
  loadRecord: function(recordId) {
    this.setData({ loading: true })
    
    const db = wx.cloud.database()
    db.collection('copywriting_records')
      .doc(recordId)
      .get()
      .then(res => {
        console.log('记录详情:', res.data)
        
        if (res.data) {
          const record = res.data
          
          // 如果imageUrl是云存储fileId，转换为临时链接
          if (record.imageUrl && record.imageUrl.startsWith('cloud://')) {
            wx.cloud.getTempFileURL({
              fileList: [record.imageUrl]
            }).then(tempUrlRes => {
              if (tempUrlRes.fileList && tempUrlRes.fileList[0] && tempUrlRes.fileList[0].tempFileURL) {
                record.imageUrl = tempUrlRes.fileList[0].tempFileURL
              }
              
              this.setData({
                record: record,
                loading: false
              })
            }).catch(error => {
              console.warn('获取图片临时链接失败:', error)
              // 保持原有的fileId，让小程序尝试直接显示
              this.setData({
                record: record,
                loading: false
              })
            })
          } else {
            this.setData({
              record: record,
              loading: false
            })
          }
          
          // 设置页面标题
          wx.setNavigationBarTitle({
            title: `${record.styleName || '文案'}详情`
          })
        } else {
          throw new Error('记录不存在')
        }
      })
      .catch(err => {
        console.error('加载记录失败:', err)
        this.setData({ loading: false })
        getApp().showToast('加载失败')
        
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      })
  },

  /**
   * 图片加载完成
   */
  onImageLoad: function() {
    this.setData({ imageLoaded: true })
  },

  /**
   * 图片加载失败
   */
  onImageError: function() {
    console.error('图片加载失败')
    getApp().showToast('图片加载失败')
  },

  /**
   * 预览图片
   */
  previewImage: function() {
    if (!this.data.record || !this.data.record.imageUrl) {
      return
    }
    
    wx.previewImage({
      urls: [this.data.record.imageUrl],
      current: this.data.record.imageUrl
    })
  },

  /**
   * 复制文案
   */
  copyContent: function() {
    if (!this.data.record || !this.data.record.content) {
      getApp().showToast('复制内容为空')
      return
    }
    
    wx.setClipboardData({
      data: this.data.record.content,
      success: () => {
        getApp().showToast('已复制到剪贴板', 'success')
      },
      fail: () => {
        getApp().showToast('复制失败')
      }
    })
  },

  /**
   * 保存记录
   */
  saveRecord: function() {
    if (!this.data.record) {
      return
    }
    
    const record = this.data.record
    
    if (record.saved) {
      getApp().showToast('已经保存过了')
      return
    }
    
    getApp().showLoading('保存中...')
    
    const db = wx.cloud.database()
    db.collection('copywriting_records')
      .doc(this.data.recordId)
      .update({
        data: {
          saved: true,
          savedAt: new Date()
        }
      })
      .then(res => {
        console.log('保存成功:', res)
        
        // 更新本地数据
        this.setData({
          'record.saved': true,
          'record.savedAt': new Date()
        })
        
        getApp().hideLoading()
        getApp().showToast('保存成功', 'success')
        
        // 更新用户统计
        this.updateUserStats('saved')
      })
      .catch(err => {
        console.error('保存失败:', err)
        getApp().hideLoading()
        getApp().showToast('保存失败')
      })
  },

  /**
   * 分享文案
   */
  shareContent: function() {
    if (!this.data.record || !this.data.record.content) {
      getApp().showToast('分享内容为空')
      return
    }
    
    wx.setClipboardData({
      data: this.data.record.content,
      success: () => {
        wx.showModal({
          title: '分享成功',
          content: '文案已复制到剪贴板，可以粘贴到朋友圈或其他应用',
          showCancel: false,
          confirmText: '知道了',
          success: () => {
            // 更新分享状态
            this.updateShareStatus()
          }
        })
      },
      fail: () => {
        getApp().showToast('分享失败')
      }
    })
  },

  /**
   * 更新分享状态
   */
  updateShareStatus: function() {
    if (!this.data.record || this.data.record.shared) {
      return
    }
    
    const db = wx.cloud.database()
    db.collection('copywriting_records')
      .doc(this.data.recordId)
      .update({
        data: {
          shared: true,
          sharedAt: new Date()
        }
      })
      .then(res => {
        console.log('分享状态更新成功:', res)
        
        // 更新本地数据
        this.setData({
          'record.shared': true,
          'record.sharedAt': new Date()
        })
        
        // 更新用户统计
        this.updateUserStats('shared')
      })
      .catch(err => {
        console.error('分享状态更新失败:', err)
      })
  },

  /**
   * 删除记录
   */
  deleteRecord: function() {
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这条记录吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          this.performDelete()
        }
      }
    })
  },

  /**
   * 执行删除
   */
  performDelete: function() {
    getApp().showLoading('删除中...')
    
    const db = wx.cloud.database()
    db.collection('copywriting_records')
      .doc(this.data.recordId)
      .remove()
      .then(res => {
        console.log('删除成功:', res)
        
        getApp().hideLoading()
        getApp().showToast('删除成功', 'success')
        
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      })
      .catch(err => {
        console.error('删除失败:', err)
        getApp().hideLoading()
        getApp().showToast('删除失败')
      })
  },

  /**
   * 重新生成文案
   */
  regenerate: function() {
    if (!this.data.record) {
      return
    }
    
    const record = this.data.record
    
    // 跳转到生成页面，传递参数
    wx.navigateTo({
      url: `/pages/generate/index?imageUrl=${encodeURIComponent(record.imageUrl)}&description=${encodeURIComponent(record.description || '')}&style=${record.style}`
    })
  },

  /**
   * 更新用户统计
   */
  updateUserStats: function(action) {
    const app = getApp()
    
    if (!app.globalData.openid) {
      return
    }
    
    // 这里可以调用云函数更新用户统计
    console.log('更新用户统计:', action)
  },

  /**
   * 格式化时间
   */
  formatTime: function(date) {
    if (!date) return ''
    
    const now = new Date()
    const target = new Date(date)
    const diff = now - target
    
    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`
    } else if (diff < 604800000) { // 1周内
      return `${Math.floor(diff / 86400000)}天前`
    } else {
      return target.toLocaleDateString()
    }
  },

  /**
   * 分享页面
   */
  onShareAppMessage: function() {
    const record = this.data.record
    
    return {
      title: record ? `${record.styleName}风格文案` : 'Shot&Share文案',
      desc: record ? record.content.substring(0, 50) + '...' : '智能朋友圈配文助手',
      path: '/pages/index/index'
    }
  }
})