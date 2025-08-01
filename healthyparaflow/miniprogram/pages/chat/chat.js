// pages/chat/chat.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    petName: '小橘',
    currentDate: '',
    scrollToMessage: '',
    inputMessage: '',
    isVoiceInput: false,
    isRecording: false,
    isTyping: false,
    showQuickReplies: true,
    recordingTip: '正在录音...',
    userInfo: {
      avatarUrl: '/images/default-avatar.png'
    },
    petInfo: {
      imageUrl: '/images/pet-cat.png',
      mood: 'happy',
      moodText: '开心'
    },
    messages: [],
    quickReplies: [
      { id: 1, content: '你好呀！' },
      { id: 2, content: '今天感觉怎么样？' },
      { id: 3, content: '我们一起玩吧！' },
      { id: 4, content: '你想吃什么？' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initDate();
    this.loadChatHistory();
    this.loadUserInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.scrollToBottom();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadChatHistory();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '我正在和我的宠物聊天，快来看看吧！',
      path: '/pages/chat/chat'
    };
  },

  /**
   * 初始化日期
   */
  initDate() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    this.setData({
      currentDate: `${month}月${day}日`
    });
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      });
    }
  },

  /**
   * 加载聊天历史
   */
  loadChatHistory() {
    // 模拟聊天历史数据
    const messages = [
      {
        id: 1,
        sender: 'pet',
        content: '主人，你好呀！我是小橘，很高兴见到你！',
        time: '09:30'
      },
      {
        id: 2,
        sender: 'user',
        content: '你好小橘！今天感觉怎么样？',
        time: '09:31'
      },
      {
        id: 3,
        sender: 'pet',
        content: '我今天感觉很棒！刚刚完成了晨间散步，现在精力充沛呢！主人今天有什么计划吗？',
        time: '09:32'
      },
      {
        id: 4,
        sender: 'user',
        content: '那太好了！我们今天一起完成健康任务吧',
        time: '09:33'
      },
      {
        id: 5,
        sender: 'pet',
        content: '好的！我最喜欢和主人一起做任务了。我们可以先从运动开始，然后记录饮食，你觉得怎么样？',
        time: '09:34'
      }
    ];
    
    this.setData({
      messages: messages
    });
    
    // 滚动到底部
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  },

  /**
   * 输入内容变化
   */
  onInputChange(e) {
    this.setData({
      inputMessage: e.detail.value
    });
  },

  /**
   * 发送消息
   */
  sendMessage() {
    const { inputMessage, messages } = this.data;
    
    if (!inputMessage.trim()) {
      return;
    }
    
    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: inputMessage.trim(),
      time: this.getCurrentTime()
    };
    
    const newMessages = [...messages, userMessage];
    
    this.setData({
      messages: newMessages,
      inputMessage: '',
      showQuickReplies: false
    });
    
    // 滚动到底部
    this.scrollToBottom();
    
    // 模拟宠物回复
    this.simulatePetReply(inputMessage.trim());
  },

  /**
   * 模拟宠物回复
   */
  simulatePetReply(userMessage) {
    // 显示正在输入
    this.setData({
      isTyping: true
    });
    
    setTimeout(() => {
      const petReply = this.generatePetReply(userMessage);
      const petMessage = {
        id: Date.now(),
        sender: 'pet',
        content: petReply,
        time: this.getCurrentTime()
      };
      
      const newMessages = [...this.data.messages, petMessage];
      
      this.setData({
        messages: newMessages,
        isTyping: false,
        showQuickReplies: true
      });
      
      this.scrollToBottom();
    }, 1500);
  },

  /**
   * 生成宠物回复
   */
  generatePetReply(userMessage) {
    const replies = {
      '你好': '主人好！我很开心见到你！',
      '今天': '今天是美好的一天！我们一起度过吧！',
      '任务': '太好了！完成任务可以让我们都变得更健康呢！',
      '运动': '我最喜欢运动了！跑步、散步都很棒！',
      '吃': '我想吃美味的食物！营养均衡很重要哦！',
      '睡觉': '充足的睡眠对健康很重要呢！',
      '玩': '我们一起玩游戏吧！这样很有趣！',
      '累': '如果累了就休息一下吧，我会陪着你的！',
      '开心': '看到主人开心，我也很开心！',
      '难过': '不要难过，我会一直陪伴着你的！'
    };
    
    // 简单的关键词匹配
    for (let keyword in replies) {
      if (userMessage.includes(keyword)) {
        return replies[keyword];
      }
    }
    
    // 默认回复
    const defaultReplies = [
      '主人说得对！我很赞同你的想法！',
      '这听起来很有趣呢！告诉我更多吧！',
      '我明白了！我们一起努力吧！',
      '真的吗？这太棒了！',
      '主人，你总是这么聪明！',
      '我学到了新东西！谢谢主人！'
    ];
    
    return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
  },

  /**
   * 获取当前时间
   */
  getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    const { messages } = this.data;
    if (messages.length > 0) {
      const lastMessageId = `msg-${messages[messages.length - 1].id}`;
      this.setData({
        scrollToMessage: lastMessageId
      });
    }
  },

  /**
   * 切换语音输入
   */
  toggleVoiceInput() {
    this.setData({
      isVoiceInput: !this.data.isVoiceInput
    });
  },

  /**
   * 开始录音
   */
  startVoiceRecord() {
    this.setData({
      isRecording: true,
      recordingTip: '正在录音...'
    });
    
    // 这里应该调用微信录音API
    // wx.startRecord({
    //   success: (res) => {
    //     // 录音成功
    //   }
    // });
  },

  /**
   * 结束录音
   */
  endVoiceRecord() {
    if (!this.data.isRecording) return;
    
    this.setData({
      isRecording: false
    });
    
    // 模拟语音转文字
    setTimeout(() => {
      const voiceText = '这是语音转换的文字内容';
      this.setData({
        inputMessage: voiceText
      });
      this.sendMessage();
    }, 500);
    
    // 这里应该调用微信停止录音API
    // wx.stopRecord();
  },

  /**
   * 取消录音
   */
  cancelVoiceRecord() {
    if (this.data.isRecording) {
      this.setData({
        isRecording: false,
        recordingTip: '录音已取消'
      });
    }
  },

  /**
   * 选择快捷回复
   */
  selectQuickReply(e) {
    const reply = e.currentTarget.dataset.reply;
    this.setData({
      inputMessage: reply
    });
    this.sendMessage();
  }
});