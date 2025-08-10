// history.js
Page({
  data: {
    records: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    total: 0,
    filterStyle: 'all', // 筛选风格
    filterStyleName: '全部风格', // 当前筛选风格的名称
    sortBy: 'time', // 排序方式: time, style
    styles: [
      { id: 'all', name: '全部风格' },
      { id: 'literary', name: '文艺治愈' },
      { id: 'humorous', name: '幽默搞笑' },
      { id: 'inspirational', name: '励志正能量' },
      { id: 'romantic', name: '浪漫温馨' },
      { id: 'philosophical', name: '哲理深度' },
      { id: 'daily', name: '日常生活' },
      { id: 'travel', name: '旅行记录' },
      { id: 'food', name: '美食分享' },
      { id: 'fashion', name: '时尚潮流' },
      { id: 'fitness', name: '运动健身' },
      { id: 'work', name: '职场励志' },
      { id: 'friendship', name: '友情岁月' },
      { id: 'family', name: '家庭温馨' },
      { id: 'nature', name: '自然风光' }
    ]
  },

  onLoad: function () {
    console.log('历史记录页面加载')
    this.checkUserLogin()
  },

  /**
   * 检查用户登录状态
   */
  checkUserLogin: function() {
    const app = getApp()
    if (!app.globalData.openid) {
      wx.showModal({
        title: '需要登录',
        content: '请先登录后再查看历史记录',
        showCancel: false,
        confirmText: '去登录',
        success: () => {
          wx.switchTab({
            url: '/pages/profile/index'
          })
        }
      })
      return false
    }
    this.loadRecords()
    return true
  },

  onShow: function () {
    // 页面显示时刷新数据
    this.refreshRecords()
  },

  onPullDownRefresh: function () {
    this.refreshRecords()
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreRecords()
    }
  },

  /**
   * 加载记录
   */
  loadRecords: function() {
    const app = getApp()
    
    if (!app.globalData.openid) {
      wx.showModal({
        title: '需要登录',
        content: '请先登录后再查看历史记录',
        showCancel: false,
        confirmText: '去登录',
        success: () => {
          wx.switchTab({
            url: '/pages/profile/index'
          })
        }
      })
      return
    }
    
    this.setData({ loading: true })
    
    // 先确保数据库集合存在
    wx.cloud.callFunction({
      name: 'initDatabase'
    }).then(() => {
      const db = wx.cloud.database()
      let query = db.collection('copywriting_records')
        .where({
          userId: app.globalData.openid
        })
    
      // 添加风格筛选
      if (this.data.filterStyle !== 'all') {
        query = query.where({
          userId: app.globalData.openid,
          style: this.data.filterStyle
        })
      }
      
      // 添加排序
      if (this.data.sortBy === 'time') {
        query = query.orderBy('createdAt', 'desc')
      } else if (this.data.sortBy === 'style') {
        query = query.orderBy('style', 'asc').orderBy('createdAt', 'desc')
      }
      
      query.limit(this.data.pageSize)
        .get()
        .then(async res => {
          console.log('加载记录成功:', res.data.length)
          
          // 预处理数据，添加格式化时间和转换图片链接
          const processedRecords = await Promise.all(res.data.map(async record => {
            record.formattedTime = this.formatTime(record.createdAt)
            
            // 处理图片URL（支持多图片）
            if (record.imageUrls && Array.isArray(record.imageUrls) && record.imageUrls.length > 0) {
              // 新版本：处理多图片
              try {
                const cloudFileIds = record.imageUrls.filter(url => url && url.startsWith('cloud://'))
                if (cloudFileIds.length > 0) {
                  const tempUrlRes = await wx.cloud.getTempFileURL({
                    fileList: cloudFileIds
                  })
                  if (tempUrlRes.fileList) {
                    // 创建URL映射
                    const urlMap = {}
                    tempUrlRes.fileList.forEach(file => {
                      if (file.tempFileURL) {
                        urlMap[file.fileID] = file.tempFileURL
                      }
                    })
                    // 替换云存储URL为临时URL
                    record.imageUrls = record.imageUrls.map(url => urlMap[url] || url)
                  }
                }
                // 设置主图为第一张图片（向后兼容）
                record.imageUrl = record.imageUrls[0]
              } catch (error) {
                console.warn('获取多图片临时链接失败:', error)
                record.imageUrl = record.imageUrls[0] // 使用原始URL
              }
            } else if (record.imageUrl && record.imageUrl.startsWith('cloud://')) {
              // 兼容旧版本：单图片处理
              try {
                const tempUrlRes = await wx.cloud.getTempFileURL({
                  fileList: [record.imageUrl]
                })
                if (tempUrlRes.fileList && tempUrlRes.fileList[0] && tempUrlRes.fileList[0].tempFileURL) {
                  record.imageUrl = tempUrlRes.fileList[0].tempFileURL
                  record.imageUrls = [record.imageUrl] // 转换为数组格式
                }
              } catch (error) {
                console.warn('获取图片临时链接失败:', error)
                record.imageUrls = [record.imageUrl] // 保持原有格式
              }
            }
            
            return record
          }))
          
          this.setData({
            records: processedRecords,
            loading: false,
            hasMore: res.data.length >= this.data.pageSize,
            page: 1,
            total: res.data.length
          })
          
          wx.stopPullDownRefresh()
        })
        .catch(err => {
          console.error('加载记录失败:', err)
          this.setData({ loading: false })
          getApp().showToast('加载失败')
          wx.stopPullDownRefresh()
        })
    }).catch(err => {
      console.error('初始化数据库失败:', err)
      this.setData({ loading: false })
      getApp().showToast('初始化失败')
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 刷新记录
   */
  refreshRecords: function() {
    this.setData({
      page: 1,
      hasMore: true,
      records: []
    })
    this.loadRecords()
  },

  /**
   * 加载更多记录
   */
  loadMoreRecords: function() {
    const app = getApp()
    
    if (!app.globalData.openid || this.data.loading) {
      return
    }
    
    this.setData({ loading: true })
    
    // 先确保数据库集合存在
    wx.cloud.callFunction({
      name: 'initDatabase'
    }).then(() => {
      const db = wx.cloud.database()
      let query = db.collection('copywriting_records')
        .where({
          userId: app.globalData.openid
        })
    
      // 添加风格筛选
      if (this.data.filterStyle !== 'all') {
        query = query.where({
          userId: app.globalData.openid,
          style: this.data.filterStyle
        })
      }
      
      // 添加排序
      if (this.data.sortBy === 'time') {
        query = query.orderBy('createdAt', 'desc')
      } else if (this.data.sortBy === 'style') {
        query = query.orderBy('style', 'asc').orderBy('createdAt', 'desc')
      }
      
      query.skip(this.data.page * this.data.pageSize)
        .limit(this.data.pageSize)
        .get()
        .then(async res => {
          console.log('加载更多记录成功:', res.data.length)
          
          // 预处理新数据，添加格式化时间和转换图片链接
          const processedNewRecords = await Promise.all(res.data.map(async record => {
            record.formattedTime = this.formatTime(record.createdAt)
            
            // 如果imageUrl是云存储fileId，转换为临时链接
            if (record.imageUrl && record.imageUrl.startsWith('cloud://')) {
              try {
                const tempUrlRes = await wx.cloud.getTempFileURL({
                  fileList: [record.imageUrl]
                })
                if (tempUrlRes.fileList && tempUrlRes.fileList[0] && tempUrlRes.fileList[0].tempFileURL) {
                  record.imageUrl = tempUrlRes.fileList[0].tempFileURL
                }
              } catch (error) {
                console.warn('获取图片临时链接失败:', error)
                // 保持原有的fileId，让小程序尝试直接显示
              }
            }
            
            return record
          }))
          
          this.setData({
            records: this.data.records.concat(processedNewRecords),
            loading: false,
            hasMore: res.data.length >= this.data.pageSize,
            page: this.data.page + 1
          })
        })
        .catch(err => {
          console.error('加载更多记录失败:', err)
          this.setData({ loading: false })
          getApp().showToast('加载失败')
        })
    }).catch(err => {
      console.error('初始化数据库失败:', err)
      this.setData({ loading: false })
      getApp().showToast('初始化失败')
    })
  },

  /**
   * 筛选风格
   */
  filterByStyle: function() {
    const styleNames = this.data.styles.map(style => style.name)
    
    wx.showActionSheet({
      itemList: styleNames,
      success: (res) => {
        const selectedStyle = this.data.styles[res.tapIndex]
        this.setData({
          filterStyle: selectedStyle.id,
          filterStyleName: selectedStyle.name
        })
        this.refreshRecords()
      }
    })
  },

  /**
   * 排序方式
   */
  sortRecords: function() {
    wx.showActionSheet({
      itemList: ['按时间排序', '按风格排序'],
      success: (res) => {
        const sortBy = res.tapIndex === 0 ? 'time' : 'style'
        this.setData({ sortBy })
        this.refreshRecords()
      }
    })
  },

  /**
   * 查看记录详情
   */
  viewRecord: function(e) {
    const { index } = e.currentTarget.dataset
    const record = this.data.records[index]
    
    if (!record) {
      return
    }
    
    // 跳转到预览页面
    wx.navigateTo({
      url: `/pages/preview/preview?recordId=${record._id}`
    })
  },

  /**
   * 复制文案
   */
  copyContent: function(e) {
    e.stopPropagation()
    const { index } = e.currentTarget.dataset
    const record = this.data.records[index]
    
    if (!record || !record.content) {
      getApp().showToast('复制内容为空')
      return
    }
    
    wx.setClipboardData({
      data: record.content,
      success: () => {
        getApp().showToast('已复制到剪贴板', 'success')
      },
      fail: () => {
        getApp().showToast('复制失败')
      }
    })
  },

  /**
   * 分享文案
   */
  shareContent: function(e) {
    e.stopPropagation()
    const { index } = e.currentTarget.dataset
    const record = this.data.records[index]
    
    if (!record || !record.content) {
      getApp().showToast('分享内容为空')
      return
    }
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
      success: () => {
        console.log('分享菜单显示成功')
      },
      fail: () => {
        getApp().showToast('分享失败')
      }
    })
  },

  /**
   * 删除记录
   */
  deleteRecord: function(e) {
    e.stopPropagation()
    const { index } = e.currentTarget.dataset
    const record = this.data.records[index]
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.performDelete(record._id, index)
        }
      }
    })
  },

  /**
   * 执行删除操作
   */
  performDelete: function(recordId, index) {
    getApp().showLoading('删除中...')
    
    // 调用删除记录云函数
    wx.cloud.callFunction({
      name: 'deleteRecord',
      data: {
        recordId: recordId
      }
    }).then(res => {
      console.log('删除记录云函数调用结果:', res)
      getApp().hideLoading()
      
      if (res.result.success) {
        getApp().showToast('删除成功', 'success')
        
        // 从本地数据中移除
        const records = this.data.records
        records.splice(index, 1)
        this.setData({
          records: records,
          total: this.data.total - 1
        })
      } else {
        getApp().showToast(res.result.error || '删除失败')
      }
    }).catch(err => {
      console.error('删除记录失败:', err)
      getApp().hideLoading()
      getApp().showToast('删除失败，请重试')
    })
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
   * 跳转到文案生成页面
   */
  goToGenerate: function() {
    wx.navigateTo({
      url: '/pages/generate/index'
    })
  },

  /**
   * 分享页面
   */
  onShareAppMessage: function() {
    return {
      title: 'Shot&Share - 智能朋友圈配文助手',
      desc: '查看我的文案创作历史',
      path: '/pages/index/index'
    }
  }
})