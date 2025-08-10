// generate.js
Page({
  data: {
    // 图片相关
    selectedImages: [], // 改为数组支持多张图片
    imageUrls: [], // 对应的URL数组
    maxImages: 9, // 最大图片数量
    
    // 文字描述
    description: '',
    descriptionPlaceholder: '请描述图片内容或想要表达的情感（可选）',
    
    // 文案风格
    styles: [
      { id: 'literary', name: '文艺治愈', desc: '温暖治愈，富有诗意', selected: true },
      { id: 'humorous', name: '幽默搞笑', desc: '轻松幽默，引人发笑', selected: false },
      { id: 'inspirational', name: '励志正能量', desc: '积极向上，充满力量', selected: false },
      { id: 'romantic', name: '浪漫温馨', desc: '甜蜜浪漫，温暖人心', selected: false },
      { id: 'philosophical', name: '哲理深度', desc: '深度思考，富有哲理', selected: false },
      { id: 'daily', name: '日常生活', desc: '贴近生活，真实自然', selected: false },
      { id: 'travel', name: '旅行记录', desc: '记录旅途美好，分享见闻', selected: false },
      { id: 'food', name: '美食分享', desc: '诱人美食，味蕾享受', selected: false },
      { id: 'fashion', name: '时尚潮流', desc: '展现个性，引领潮流', selected: false },
      { id: 'fitness', name: '运动健身', desc: '健康生活，活力满满', selected: false },
      { id: 'work', name: '职场励志', desc: '工作感悟，职场正能量', selected: false },
      { id: 'friendship', name: '友情岁月', desc: '珍贵友谊，温暖陪伴', selected: false },
      { id: 'family', name: '家庭温馨', desc: '家的温暖，亲情无价', selected: false },
      { id: 'nature', name: '自然风光', desc: '大自然之美，心灵净化', selected: false }
    ],
    selectedStyle: 'literary',
    
    // 生成状态
    generating: false,
    generatedCopywriting: [],
    showResult: false,
    
    // 登录状态
    checkingLogin: false,
    
    // 其他状态
    uploading: false
  },

  onLoad: function () {
    console.log('文案生成页面加载')
    this.setData({ checkingLogin: true })
    this.checkUserLogin()
  },

  /**
   * 检查用户登录状态
   */
  checkUserLogin: function() {
    const app = getApp()
    
    // 检查是否有用户信息和openid
    if (app.globalData.openid && app.globalData.userInfo) {
      this.setData({ checkingLogin: false })
      return Promise.resolve(true)
    }
    
    // 如果没有登录，跳转到个人中心页面
    this.setData({ checkingLogin: false })
    wx.showModal({
      title: '需要登录',
      content: '请先登录后再使用创作功能',
      showCancel: false,
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/profile/index'
          })
        }
      }
    })
    return Promise.resolve(false)
  },

  /**
   * 选择图片
   */
  chooseImage: function() {
    const that = this
    const currentCount = this.data.selectedImages.length
    const remainingCount = this.data.maxImages - currentCount
    
    if (remainingCount <= 0) {
      getApp().showToast(`最多只能选择${this.data.maxImages}张图片`)
      return
    }
    
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: function(res) {
        const sourceType = res.tapIndex === 0 ? ['album'] : ['camera']
        
        wx.chooseMedia({
          count: remainingCount,
          mediaType: ['image'],
          sourceType: sourceType,
          maxDuration: 30,
          camera: 'back',
          success: function(res) {
            const newImages = res.tempFiles.map(file => file.tempFilePath)
            const updatedImages = [...that.data.selectedImages, ...newImages]
            const updatedUrls = [...that.data.imageUrls, ...newImages]
            
            that.setData({
              selectedImages: updatedImages,
              imageUrls: updatedUrls,
              showResult: false,
              generatedCopywriting: []
            })
            console.log('选择图片成功，当前图片数量:', updatedImages.length)
          },
          fail: function(err) {
            console.error('选择图片失败:', err)
            getApp().showToast('选择图片失败')
          }
        })
      }
    })
  },

  /**
   * 删除单张图片
   */
  removeImage: function(e) {
    const index = e.currentTarget.dataset.index
    const selectedImages = [...this.data.selectedImages]
    const imageUrls = [...this.data.imageUrls]
    
    selectedImages.splice(index, 1)
    imageUrls.splice(index, 1)
    
    this.setData({
      selectedImages: selectedImages,
      imageUrls: imageUrls,
      showResult: false,
      generatedCopywriting: []
    })
  },
  
  /**
   * 清空所有图片
   */
  clearAllImages: function() {
    this.setData({
      selectedImages: [],
      imageUrls: [],
      showResult: false,
      generatedCopywriting: []
    })
  },

  /**
   * 输入描述文字
   */
  onDescriptionInput: function(e) {
    this.setData({
      description: e.detail.value
    })
  },

  /**
   * 选择文案风格
   */
  selectStyle: function(e) {
    const { id } = e.currentTarget.dataset
    const styles = this.data.styles.map(style => ({
      ...style,
      selected: style.id === id
    }))
    
    this.setData({
      styles: styles,
      selectedStyle: id
    })
  },

  /**
   * 生成文案
   */
  generateCopywriting: function() {
    const app = getApp()
    
    // 检查登录状态
    if (!app.globalData.openid || !app.globalData.userInfo) {
      wx.showModal({
        title: '需要登录',
        content: '请先登录后再使用创作功能',
        showCancel: false,
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/profile/index'
            })
          }
        }
      })
      return
    }
    
    // 检查是否选择了图片
    if (!this.data.selectedImages || this.data.selectedImages.length === 0) {
      getApp().showToast('请先选择图片')
      return
    }
    
    // 检查是否选择了风格
    if (!this.data.selectedStyle) {
      getApp().showToast('请选择文案风格')
      return
    }
    
    if (this.data.generating) {
      return
    }
    
    this.setData({ generating: true })
    this.startGenerating()
  },
  
  /**
   * 开始生成文案
   */
  startGenerating: function() {
     const app = getApp()
     
     getApp().showLoading('正在初始化...')
    
    // 先确保数据库集合存在
    wx.cloud.callFunction({
      name: 'initDatabase'
    }).then(() => {
      getApp().showLoading('正在上传图片...')
    
      // 先上传图片到云存储
      return this.uploadImageToCloud()
      .then(imageUrls => {
        getApp().showLoading('正在生成文案...')
        
        // 调用文案生成云函数
        return this.callGenerateFunction(imageUrls)
      })
      .then(res => {
        console.log('文案生成结果:', res)
        
        if (res.success) {
          const result = res.data
          
          // 处理多条文案结果
          let copywritingArray = []
          if (result.copywritings && Array.isArray(result.copywritings)) {
            // 新的多条文案格式
            copywritingArray = result.copywritings.map((item, index) => ({
              content: item.content,
              tags: item.tags || [],
              recordId: item.recordId,
              style: result.style,
              createdAt: item.createdAt,
              index: index + 1
            }))
          } else {
            // 兼容旧的单条文案格式
            copywritingArray = [{
              content: result.content,
              tags: result.tags || [],
              recordId: result.recordId,
              style: result.style,
              createdAt: result.createdAt,
              index: 1
            }]
          }
          
          this.setData({
             generating: false,
             generatedCopywriting: copywritingArray,
             showResult: true
           })
          
          getApp().hideLoading()
          getApp().showToast('文案生成成功', 'success')
          
          // 更新用户统计
           this.updateUserStats('generated')
           
           // 滚动到结果区域
           setTimeout(() => {
             wx.pageScrollTo({
               selector: '.results-section',
               duration: 300
             })
           }, 100)
        } else {
          throw new Error(res.result.error || '文案生成失败')
        }
      })
      .catch(err => {
        console.error('文案生成失败:', err)
        
        this.setData({ generating: false })
        getApp().hideLoading()
        getApp().showToast(err.message || '文案生成失败，请重试')
      })
    }).catch(err => {
      console.error('初始化数据库失败:', err)
      this.setData({ generating: false })
      getApp().hideLoading()
      getApp().showToast('初始化失败，请重试')
    })
  },

  /**
   * 上传图片到云存储
   */
  uploadImageToCloud: function() {
    return new Promise(async (resolve, reject) => {
      const app = getApp()
      const filePaths = this.data.selectedImages
      const uploadedUrls = []
      
      try {
        for (let i = 0; i < filePaths.length; i++) {
          const filePath = filePaths[i]
          
          // 读取文件内容
          const fileData = await new Promise((fileResolve, fileReject) => {
            wx.getFileSystemManager().readFile({
              filePath: filePath,
              encoding: 'base64',
              success: (res) => fileResolve(res.data),
              fail: (err) => fileReject(err)
            })
          })
          
          // 调用上传云函数
          const uploadRes = await wx.cloud.callFunction({
            name: 'uploadImage',
            data: {
              fileBuffer: fileData,
              fileName: `image_${i + 1}.jpg`,
              userId: app.globalData.openid
            }
          })
          
          console.log(`第${i + 1}张图片上传结果:`, uploadRes)
          
          if (uploadRes.result.success) {
            // 保存fileId而不是tempUrl，确保图片链接永久有效
            uploadedUrls.push(uploadRes.result.data.fileId)
          } else {
            throw new Error(uploadRes.result.error || `第${i + 1}张图片上传失败`)
          }
        }
        
        console.log('所有图片上传成功，数量:', uploadedUrls.length)
        resolve(uploadedUrls)
        
      } catch (error) {
        console.error('图片上传失败:', error)
        reject(error)
      }
    })
  },

  /**
   * 调用文案生成云函数
   */
  callGenerateFunction: function(imageUrls) {
    return new Promise((resolve, reject) => {
      const app = getApp()
      
      wx.cloud.callFunction({
        name: 'generateCopywriting',
        data: {
          imageUrls: imageUrls,
          description: this.data.description,
          style: this.data.selectedStyle,
          userId: app.globalData.openid
        },
        success: res => {
          console.log('云函数调用结果:', res)
          
          // 检查返回结果的结构
          if (!res || !res.result) {
            reject(new Error('云函数返回结果格式错误'))
            return
          }
          
          if (res.result.success) {
            resolve(res.result)
          } else {
            reject(new Error(res.result.error || '生成失败'))
          }
        },
        fail: err => {
          console.error('云函数调用失败:', err)
          reject(err)
        }
      })
    })
  },

  /**
   * 处理生成成功
   */
  handleGenerateSuccess: function(result) {
    this.setData({
      generatedCopywriting: result.copywriting || [],
      showResult: true
    })
    
    getApp().showToast('文案生成成功！', 'success')
    
    // 滚动到结果区域
    setTimeout(() => {
      wx.pageScrollTo({
        selector: '.result-section',
        duration: 300
      })
    }, 100)
  },

  /**
   * 处理生成错误
   */
  handleGenerateError: function(error) {
    console.error('生成文案错误:', error)
    let errorMsg = '生成失败，请重试'
    
    if (error.message) {
      if (error.message.includes('网络')) {
        errorMsg = '网络连接失败，请检查网络'
      } else if (error.message.includes('图片')) {
        errorMsg = '图片处理失败，请重新选择图片'
      } else if (error.message.includes('API')) {
        errorMsg = 'AI服务暂时不可用，请稍后重试'
      }
    }
    
    getApp().showToast(errorMsg)
  },

  /**
   * 复制文案
   */
  copyCopywriting: function(e) {
    const { index } = e.currentTarget.dataset
    const copywriting = this.data.generatedCopywriting[index]
    
    if (!copywriting || !copywriting.content) {
      getApp().showToast('复制内容为空')
      return
    }
    
    wx.setClipboardData({
      data: copywriting.content,
      success: () => {
        getApp().showToast('已复制到剪贴板', 'success')
      },
      fail: () => {
        getApp().showToast('复制失败')
      }
    })
  },

  /**
   * 保存文案
   */
  saveCopywriting: function(e) {
    const { index } = e.currentTarget.dataset
    const copywriting = this.data.generatedCopywriting[index]
    
    if (!copywriting) {
      getApp().showToast('保存内容为空')
      return
    }
    
    const app = getApp()
    app.showLoading('保存中...')
    
    // 先确保数据库集合存在，然后保存
    wx.cloud.callFunction({
      name: 'initDatabase'
    }).then(() => {
      return wx.cloud.database().collection('copywriting_records').add({
      data: {
        userId: app.globalData.openid,
        imageUrl: this.data.imageUrl,
        description: this.data.description,
        style: this.data.selectedStyle,
        content: copywriting.content,
        tags: copywriting.tags || [],
        isFavorite: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      success: res => {
        console.log('保存文案成功:', res)
        app.hideLoading()
        app.showToast('保存成功', 'success')
        
        // 更新用户统计
        this.updateUserStats('totalSaved')
      },
      fail: err => {
        console.error('保存文案失败:', err)
        app.hideLoading()
        app.showToast('保存失败')
      }
      })
    }).catch(err => {
      console.error('初始化数据库失败:', err)
      app.hideLoading()
      app.showToast('保存失败')
    })
  },

  /**
   * 分享文案
   */
  shareCopywriting: function(e) {
    const { index } = e.currentTarget.dataset
    const copywriting = this.data.generatedCopywriting[index]
    
    if (!copywriting) {
      getApp().showToast('分享内容为空')
      return
    }
    
    // 先复制到剪贴板
    wx.setClipboardData({
      data: copywriting.content,
      success: () => {
        // 更新分享统计
        this.updateUserStats('totalShared')
        
        wx.showModal({
          title: '分享成功',
          content: '文案已复制到剪贴板，可以粘贴到朋友圈或其他应用',
          showCancel: false,
          confirmText: '知道了'
        })
      },
      fail: () => {
        getApp().showToast('分享失败')
      }
    })
  },

  /**
   * 更新用户统计
   */
  updateUserStats: function(field) {
    const app = getApp()
    if (!app.globalData.openid) return
    
    // 先确保数据库集合存在
    wx.cloud.callFunction({
      name: 'initDatabase'
    }).then(() => {
      return wx.cloud.database().collection('users')
        .where({ openid: app.globalData.openid })
        .get()
    }).then(res => {
      if (res.data.length > 0) {
        const user = res.data[0]
        const stats = user.statistics || {}
        stats[field] = (stats[field] || 0) + 1
        
        return wx.cloud.database().collection('users')
          .doc(user._id)
          .update({
            data: {
              statistics: stats,
              updatedAt: new Date()
            }
          })
      }
    }).catch(err => {
      console.error('更新用户统计失败:', err)
    })
  },

  /**
   * 重新生成
   */
  regenerate: function() {
    this.setData({
      showResult: false,
      generatedCopywriting: []
    })
    
    setTimeout(() => {
      this.generateCopywriting()
    }, 100)
  },

  /**
   * 清空重置
   */
  reset: function() {
    this.setData({
      selectedImage: null,
      imageUrl: '',
      description: '',
      selectedStyle: 'literary',
      styles: this.data.styles.map((style, index) => ({
        ...style,
        selected: index === 0
      })),
      showResult: false,
      generatedCopywriting: []
    })
  },

  /**
   * 分享页面
   */
  onShareAppMessage: function() {
    return {
      title: 'Shot&Share - 智能朋友圈配文助手',
      desc: '上传图片，AI为你生成精美文案',
      path: '/pages/generate/index'
    }
  }
})