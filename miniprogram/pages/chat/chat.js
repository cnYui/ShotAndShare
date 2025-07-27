// 宠物聊天页面逻辑
const i18n = require('../../utils/i18n.js');
const themeManager = require('../../utils/theme.js');

Page({
  data: {
    petInfo: {
      name: '小绿',
      avatar: '/images/pets/default-pet.png',
      mood: 'happy',
      moodText: '开心聊天中'
    },
    userInfo: {
      avatar: '/images/default-user.png'
    },
    messages: [],
    inputText: '',
    scrollTop: 0,
    scrollIntoView: '',
    isTyping: false,
    isSending: false,
    
    // 快捷回复
    quickReplies: [],
    
    // 表情面板
    showEmojiPanel: false,
    emojis: [
      '😊', '😄', '😆', '😁', '😂', '🤣', '😇', '😉',
      '😍', '🥰', '😘', '😗', '😙', '😚', '🤗', '🤔',
      '😎', '🤓', '😏', '😒', '😞', '😔', '😟', '😕',
      '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭',
      '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶',
      '😱', '😨', '😰', '😥', '😓', '🤗', '🤭', '🤫',
      '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦',
      '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵'
    ],
    

    
    // 设置面板
    showSettingsPanel: false,
    settings: {
      smartReply: true,
      voicePlay: false,
      notification: true
    },
    isDarkMode: false,
    themeClass: '',
    texts: {}
  },

  onLoad() {
    const app = getApp();
    if (!app.requireLogin()) {
      return;
    }
    
    this.initThemeAndLanguage();
    this.initChat();
    // 不自动加载聊天历史，每次进入都是新的对话
    this.clearChatHistory();
  },
  
  // 初始化主题和语言
  initThemeAndLanguage() {
    this.loadTexts();
    this.applyCurrentTheme();
  },
  
  // 加载文本
  loadTexts() {
    const texts = i18n.getTexts();
    this.setData({ texts });
  },
  
  // 应用当前主题
  applyCurrentTheme() {
    const theme = themeManager.getCurrentTheme();
    const isDarkMode = themeManager.isDark();
    const themeClass = isDarkMode ? 'dark-theme' : '';
    
    this.setData({
      isDarkMode,
      themeClass
    });
  },

  onShow() {
    this.initThemeAndLanguage();
    this.scrollToBottom();
  },

  // 初始化聊天
  initChat() {
    // 设置宠物状态
    this.updatePetMood();
    
    // 生成快捷回复建议

  },

  // 清空聊天历史
  clearChatHistory() {
    this.setData({ messages: [] });
    // 同时清空本地存储的聊天记录
    wx.removeStorageSync('chatHistory');
  },

  // 加载聊天历史（保留此函数以备将来需要时使用）
  loadChatHistory() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    
    if (!userInfo) {
      this.setData({ messages: [] });
      return;
    }
    
    // 从云数据库加载聊天历史
    const db = wx.cloud.database();
    db.collection('chat_context')
      .where({
        user_id: userInfo.openid
      })
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get()
      .then(res => {
        const chatHistory = res.data.reverse(); // 按时间正序排列
        const messages = [];
        
        chatHistory.forEach(record => {
          // 添加用户消息
          messages.push({
            id: record._id + '_user',
            type: 'user',
            content: record.user_message,
            time: this.formatTime(new Date(record.timestamp)),
            liked: false
          });
          
          // 添加宠物回复
          if (record.pet_reply) {
            messages.push({
              id: record._id + '_pet',
              type: 'pet',
              content: record.pet_reply,
              time: this.formatTime(new Date(record.timestamp + 1000)), // 稍微延后
              liked: false
            });
          }
        });
        
        this.setData({ messages });
        this.scrollToBottom();
      })
      .catch(err => {
        console.error('加载聊天历史失败:', err);
        // 降级到本地存储
        const savedMessages = wx.getStorageSync('chatHistory') || [];
        this.setData({ messages: savedMessages });
        if (savedMessages.length > 0) {
          this.scrollToBottom();
        }
      });
  },

  // 更新宠物心情
  updatePetMood() {
    const hour = new Date().getHours();
    let mood = 'happy';
    let moodText = '开心聊天中';
    
    if (hour >= 6 && hour < 9) {
      mood = 'excited';
      moodText = '精神饱满';
    } else if (hour >= 12 && hour < 14) {
      mood = 'calm';
      moodText = '悠闲放松';
    } else if (hour >= 22 || hour < 6) {
      mood = 'calm';
      moodText = '准备休息';
    }
    
    this.setData({
      'petInfo.mood': mood,
      'petInfo.moodText': moodText
    });
  },



  // 输入框内容变化
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    });
    

  },



  // 发送消息
  sendMessage() {
    const content = this.data.inputText.trim();
    if (!content || this.data.isSending) return;
    
    this.setData({
      isSending: true,
      inputText: '',
      quickReplies: []
    });
    
    // 添加用户消息
    this.addMessage({
      type: 'user',
      content: content,
      time: this.formatTime(new Date())
    });
    
    // 模拟宠物回复
    this.simulatePetReply(content);
  },



  // 添加消息
  addMessage(message) {
    const messages = this.data.messages;
    message.id = Date.now() + Math.random();
    messages.push(message);
    
    this.setData({
      messages: messages
    });
    
    this.scrollToBottom();
    this.saveChatHistory();
  },

  // 调用云函数获取宠物回复
  simulatePetReply(userMessage) {
    this.setData({ isTyping: true });
    
    // 设置超时处理
    const timeoutId = setTimeout(() => {
      console.log('云函数调用超时，使用本地回复');
      this.handleChatError('网络响应超时(4秒)');
    }, 4000); // 4秒超时
    
    wx.cloud.callFunction({
      name: 'petChat',
      data: {
        message: userMessage
      },
      success: (res) => {
        clearTimeout(timeoutId);
        this.setData({
          isTyping: false,
          isSending: false
        });
        
        console.log('云函数调用成功，返回结果:', res);
        
        if (res.result && res.result.success) {
          this.addMessage({
            type: 'pet',
            content: res.result.data.reply,
            time: this.formatTime(new Date()),
            liked: false
          });
          
          // 更新宠物状态
          const petStatus = res.result.data.pet_status;
          if (petStatus) {
            wx.setStorageSync('petInfo', petStatus);
          }
        } else {
          // 显示详细的错误信息
          const errorDetail = res.result ? 
            `${res.result.error || '未知错误'} (调试信息: ${JSON.stringify(res.result.debug || {})})` : 
            '云函数返回格式错误';
          this.handleChatError(errorDetail);
        }
        

      },
      fail: (err) => {
        clearTimeout(timeoutId);
        console.error('云函数调用失败，完整错误信息:', err);
        
        // 构建详细的错误信息
        let errorDetail = '网络连接失败';
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorDetail = `请求超时: ${err.errMsg}`;
          } else if (err.errMsg.includes('fail')) {
            errorDetail = `调用失败: ${err.errMsg}`;
          } else {
            errorDetail = `错误: ${err.errMsg}`;
          }
        }
        
        // 如果有错误码，也包含进去
        if (err.errCode) {
          errorDetail += ` (错误码: ${err.errCode})`;
        }
        
        this.handleChatError(errorDetail);
      }
    });
  },

  handleChatError(errorMsg) {
    // 防止重复调用
    if (this.data.isTyping === false && this.data.isSending === false) {
      return;
    }
    
    this.setData({
      isTyping: false,
      isSending: false
    });
    
    // 显示详细的错误信息到控制台
    console.error('聊天错误详情:', errorMsg);
    
    // 添加错误信息作为系统消息
    this.addMessage({
      type: 'system',
      content: `❌ AI连接失败: ${errorMsg}`,
      time: this.formatTime(new Date()),
      liked: false
    });
    
    // 显示错误提示
    wx.showToast({
      title: `AI连接失败，请稍后重试`,
      icon: 'none',
      duration: 3000
    });
  },



  // 点赞消息
  likeMessage(e) {
    const messageId = e.currentTarget.dataset.id;
    const messages = this.data.messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, liked: !msg.liked };
      }
      return msg;
    });
    
    this.setData({ messages });
    this.saveChatHistory();
    
    wx.vibrateShort();
  },

  // 复制消息
  copyMessage(e) {
    const content = e.currentTarget.dataset.content;
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        });
      }
    });
  },

  // 切换表情面板
  toggleEmojiPanel() {
    this.setData({
      showEmojiPanel: !this.data.showEmojiPanel
    });
  },

  // 插入表情
  insertEmoji(e) {
    const emoji = e.currentTarget.dataset.emoji;
    const inputText = this.data.inputText + emoji;
    this.setData({
      inputText: inputText,
      showEmojiPanel: false
    });
  },



  // 打开聊天设置
  openChatSettings() {
    this.setData({
      showSettingsPanel: true
    });
  },

  // 关闭聊天设置
  closeChatSettings() {
    this.setData({
      showSettingsPanel: false
    });
  },

  // 切换智能回复
  toggleSmartReply(e) {
    this.setData({
      'settings.smartReply': e.detail.value
    });
    this.saveSettings();
  },

  // 切换语音播报
  toggleVoicePlay(e) {
    this.setData({
      'settings.voicePlay': e.detail.value
    });
    this.saveSettings();
  },

  // 切换消息提醒
  toggleNotification(e) {
    this.setData({
      'settings.notification': e.detail.value
    });
    this.saveSettings();
  },

  // 手动清空聊天记录（设置面板中的功能）
  clearChatHistoryManual() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空当前对话记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 只清空当前页面的聊天记录
          this.setData({
            messages: [],
            showSettingsPanel: false
          });
          
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  // 滚动到底部
  scrollToBottom() {
    setTimeout(() => {
      const messages = this.data.messages;
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        this.setData({
          scrollIntoView: `msg-${lastMessage.id}`
        });
      }
    }, 100);
  },

  // 保存聊天记录（已禁用，确保每次进入都是新对话）
  saveChatHistory() {
    // 不再保存聊天记录，确保每次进入都是全新的对话
    // wx.setStorageSync('chatHistory', this.data.messages);
    console.log('聊天记录保存已禁用，确保每次都是新对话');
  },

  // 保存设置
  saveSettings() {
    wx.setStorageSync('chatSettings', this.data.settings);
  },

  // 格式化时间
  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '和我的健康小宠物聊天',
      path: '/pages/chat/chat',
      imageUrl: '/images/share-cover.svg'
    };
  }
});