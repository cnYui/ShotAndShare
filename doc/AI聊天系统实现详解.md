# AI聊天系统实现详解

## 系统架构概述

### 设计理念
- **智能对话**：基于大语言模型的自然对话
- **上下文感知**：结合用户健康数据和宠物状态
- **个性化回复**：根据用户画像定制回复内容
- **多模态交互**：支持文本、语音、图片输入
- **情感陪伴**：提供情感支持和健康建议

### 技术架构

```
AI聊天系统架构
├── 前端交互层
│   ├── pages/chat/chat.js     # 聊天页面
│   ├── components/chatBubble  # 聊天气泡组件
│   └── utils/chatManager.js   # 聊天管理器
├── 云函数层
│   ├── petChat               # AI聊天云函数
│   ├── chatHistory           # 聊天记录管理
│   └── contextBuilder        # 上下文构建器
├── AI服务层
│   ├── 大语言模型API         # 外部AI服务
│   ├── 提示词工程            # Prompt Engineering
│   └── 响应处理器            # Response Processor
└── 数据存储层
    ├── chatHistory           # 聊天记录表
    ├── userProfile           # 用户画像
    └── contextCache          # 上下文缓存
```

## 前端实现

### 1. 聊天页面 (pages/chat/chat.js)

```javascript
// 聊天页面实现
const BasePage = require('../../utils/basePage.js');
const chatManager = require('../../utils/chatManager.js');
const audioManager = require('../../utils/audioManager.js');

class ChatPage extends BasePage {
  data = {
    ...super.data,
    messages: [],           // 聊天消息列表
    inputText: '',          // 输入框文本
    isTyping: false,        // AI是否正在输入
    isRecording: false,     // 是否正在录音
    sessionId: '',          // 会话ID
    quickReplies: [],       // 快捷回复
    scrollToView: '',       // 滚动到指定消息
    showEmojiPanel: false,  // 显示表情面板
    showMoreActions: false  // 显示更多操作
  }
  
  /**
   * 页面加载
   */
  async onPageLoad(options) {
    await this.initChat();
    await this.loadChatHistory();
    this.setupQuickReplies();
  }
  
  /**
   * 初始化聊天
   */
  async initChat() {
    try {
      // 生成会话ID
      const sessionId = this.generateSessionId();
      this.setData({ sessionId });
      
      // 初始化聊天管理器
      await chatManager.init(sessionId);
      
      // 发送欢迎消息
      await this.sendWelcomeMessage();
      
      console.log('[Chat] 聊天初始化完成');
    } catch (error) {
      console.error('[Chat] 聊天初始化失败:', error);
      this.showToast('chat.networkError');
    }
  }
  
  /**
   * 生成会话ID
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `chat_${timestamp}_${random}`;
  }
  
  /**
   * 发送欢迎消息
   */
  async sendWelcomeMessage() {
    const welcomeMessage = {
      id: this.generateMessageId(),
      type: 'text',
      role: 'assistant',
      content: this.t('chat.welcome'),
      timestamp: new Date(),
      isSystem: true
    };
    
    this.addMessage(welcomeMessage);
  }
  
  /**
   * 加载聊天历史
   */
  async loadChatHistory() {
    try {
      const history = await chatManager.getChatHistory(20); // 获取最近20条
      
      if (history && history.length > 0) {
        this.setData({
          messages: [...history, ...this.data.messages]
        });
        
        this.scrollToBottom();
      }
    } catch (error) {
      console.error('[Chat] 加载聊天历史失败:', error);
    }
  }
  
  /**
   * 设置快捷回复
   */
  setupQuickReplies() {
    const quickReplies = [
      {
        id: 'greeting',
        text: this.t('chat.quickReplies.greeting'),
        action: 'send'
      },
      {
        id: 'howAreYou',
        text: this.t('chat.quickReplies.howAreYou'),
        action: 'send'
      },
      {
        id: 'healthTip',
        text: this.t('chat.quickReplies.healthTip'),
        action: 'send'
      },
      {
        id: 'taskHelp',
        text: this.t('chat.quickReplies.taskHelp'),
        action: 'send'
      },
      {
        id: 'encouragement',
        text: this.t('chat.quickReplies.encouragement'),
        action: 'send'
      }
    ];
    
    this.setData({ quickReplies });
  }
  
  /**
   * 输入框内容变化
   */
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    });
  }
  
  /**
   * 发送文本消息
   */
  async onSendMessage() {
    const text = this.data.inputText.trim();
    if (!text) return;
    
    // 清空输入框
    this.setData({ inputText: '' });
    
    await this.sendTextMessage(text);
  }
  
  /**
   * 发送文本消息
   */
  async sendTextMessage(text) {
    try {
      // 添加用户消息
      const userMessage = {
        id: this.generateMessageId(),
        type: 'text',
        role: 'user',
        content: text,
        timestamp: new Date(),
        status: 'sending'
      };
      
      this.addMessage(userMessage);
      
      // 显示AI正在输入
      this.setData({ isTyping: true });
      
      // 发送到AI服务
      const response = await chatManager.sendMessage({
        text,
        sessionId: this.data.sessionId,
        messageId: userMessage.id
      });
      
      // 更新用户消息状态
      this.updateMessageStatus(userMessage.id, 'sent');
      
      // 添加AI回复
      if (response.success) {
        const aiMessage = {
          id: response.messageId,
          type: 'text',
          role: 'assistant',
          content: response.content,
          timestamp: new Date(response.timestamp),
          tokens: response.tokens,
          responseTime: response.responseTime
        };
        
        this.addMessage(aiMessage);
      } else {
        this.showToast('chat.aiError');
      }
    } catch (error) {
      console.error('[Chat] 发送消息失败:', error);
      this.showToast('chat.networkError');
    } finally {
      this.setData({ isTyping: false });
    }
  }
  
  /**
   * 快捷回复点击
   */
  onQuickReply(e) {
    const reply = e.currentTarget.dataset.reply;
    this.sendTextMessage(reply.text);
  }
  
  /**
   * 开始录音
   */
  async onStartRecord() {
    try {
      const authorized = await this.checkRecordPermission();
      if (!authorized) {
        this.showToast('errors.permission');
        return;
      }
      
      this.setData({ isRecording: true });
      await audioManager.startRecord();
      
      console.log('[Chat] 开始录音');
    } catch (error) {
      console.error('[Chat] 开始录音失败:', error);
      this.setData({ isRecording: false });
    }
  }
  
  /**
   * 停止录音
   */
  async onStopRecord() {
    try {
      this.setData({ isRecording: false });
      
      const audioData = await audioManager.stopRecord();
      if (audioData) {
        await this.sendVoiceMessage(audioData);
      }
      
      console.log('[Chat] 停止录音');
    } catch (error) {
      console.error('[Chat] 停止录音失败:', error);
    }
  }
  
  /**
   * 发送语音消息
   */
  async sendVoiceMessage(audioData) {
    try {
      // 添加语音消息
      const voiceMessage = {
        id: this.generateMessageId(),
        type: 'voice',
        role: 'user',
        content: audioData.tempFilePath,
        duration: audioData.duration,
        timestamp: new Date(),
        status: 'sending'
      };
      
      this.addMessage(voiceMessage);
      
      // 语音转文字
      const transcription = await chatManager.transcribeAudio(audioData);
      
      if (transcription.success) {
        // 更新消息内容
        this.updateMessage(voiceMessage.id, {
          transcription: transcription.text,
          status: 'sent'
        });
        
        // 发送转换后的文本到AI
        await this.sendTextMessage(transcription.text);
      } else {
        this.updateMessageStatus(voiceMessage.id, 'failed');
        this.showToast('chat.transcriptionFailed');
      }
    } catch (error) {
      console.error('[Chat] 发送语音消息失败:', error);
    }
  }
  
  /**
   * 选择图片
   */
  async onChooseImage() {
    try {
      const res = await this.chooseImage();
      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        await this.sendImageMessage(res.tempFilePaths[0]);
      }
    } catch (error) {
      console.error('[Chat] 选择图片失败:', error);
    }
  }
  
  /**
   * 发送图片消息
   */
  async sendImageMessage(imagePath) {
    try {
      // 添加图片消息
      const imageMessage = {
        id: this.generateMessageId(),
        type: 'image',
        role: 'user',
        content: imagePath,
        timestamp: new Date(),
        status: 'sending'
      };
      
      this.addMessage(imageMessage);
      
      // 上传图片并分析
      const analysis = await chatManager.analyzeImage(imagePath);
      
      if (analysis.success) {
        this.updateMessageStatus(imageMessage.id, 'sent');
        
        // 发送图片分析结果到AI
        const analysisText = `我发送了一张图片，图片内容：${analysis.description}`;
        await this.sendTextMessage(analysisText);
      } else {
        this.updateMessageStatus(imageMessage.id, 'failed');
        this.showToast('chat.imageAnalysisFailed');
      }
    } catch (error) {
      console.error('[Chat] 发送图片消息失败:', error);
    }
  }
  
  /**
   * 添加消息
   */
  addMessage(message) {
    const messages = [...this.data.messages, message];
    this.setData({
      messages,
      scrollToView: `msg-${message.id}`
    });
    
    // 延迟滚动到底部
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }
  
  /**
   * 更新消息
   */
  updateMessage(messageId, updates) {
    const messages = this.data.messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, ...updates };
      }
      return msg;
    });
    
    this.setData({ messages });
  }
  
  /**
   * 更新消息状态
   */
  updateMessageStatus(messageId, status) {
    this.updateMessage(messageId, { status });
  }
  
  /**
   * 消息反馈
   */
  async onMessageFeedback(e) {
    const { messageId, helpful } = e.currentTarget.dataset;
    
    try {
      await chatManager.submitFeedback(messageId, { helpful });
      
      this.updateMessage(messageId, {
        feedback: { helpful, submitted: true }
      });
      
      this.showToast('chat.feedback.thankYou');
    } catch (error) {
      console.error('[Chat] 提交反馈失败:', error);
    }
  }
  
  /**
   * 清空聊天记录
   */
  async onClearHistory() {
    const confirmed = await this.showModal(
      'chat.history.clear',
      'chat.history.confirmClear'
    );
    
    if (confirmed) {
      try {
        await chatManager.clearHistory(this.data.sessionId);
        this.setData({ messages: [] });
        await this.sendWelcomeMessage();
        
        this.showToast('success.delete');
      } catch (error) {
        console.error('[Chat] 清空聊天记录失败:', error);
        this.showToast('errors.unknown');
      }
    }
  }
  
  /**
   * 生成消息ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 滚动到底部
   */
  scrollToBottom() {
    const query = wx.createSelectorQuery().in(this);
    query.select('.chat-container').scrollTop();
    query.exec((res) => {
      if (res[0]) {
        const scrollTop = res[0].scrollTop + 1000;
        this.setData({ scrollTop });
      }
    });
  }
  
  /**
   * 检查录音权限
   */
  checkRecordPermission() {
    return new Promise((resolve) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.record']) {
            resolve(true);
          } else {
            wx.authorize({
              scope: 'scope.record',
              success: () => resolve(true),
              fail: () => resolve(false)
            });
          }
        },
        fail: () => resolve(false)
      });
    });
  }
  
  /**
   * 选择图片
   */
  chooseImage() {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: resolve,
        fail: reject
      });
    });
  }
}

// 创建页面实例
const chatPage = new ChatPage();

// 导出页面配置
Page({
  data: chatPage.data,
  onLoad: chatPage.onLoad.bind(chatPage),
  onUnload: chatPage.onUnload.bind(chatPage),
  onInputChange: chatPage.onInputChange.bind(chatPage),
  onSendMessage: chatPage.onSendMessage.bind(chatPage),
  onQuickReply: chatPage.onQuickReply.bind(chatPage),
  onStartRecord: chatPage.onStartRecord.bind(chatPage),
  onStopRecord: chatPage.onStopRecord.bind(chatPage),
  onChooseImage: chatPage.onChooseImage.bind(chatPage),
  onMessageFeedback: chatPage.onMessageFeedback.bind(chatPage),
  onClearHistory: chatPage.onClearHistory.bind(chatPage)
});
```

### 2. 聊天管理器 (utils/chatManager.js)

```javascript
// 聊天管理器
class ChatManager {
  constructor() {
    this.sessionId = null;
    this.context = null;
    this.messageQueue = [];
    this.isProcessing = false;
  }
  
  /**
   * 初始化聊天管理器
   */
  async init(sessionId) {
    this.sessionId = sessionId;
    await this.buildContext();
    console.log('[ChatManager] 初始化完成');
  }
  
  /**
   * 构建上下文
   */
  async buildContext() {
    try {
      // 获取用户信息
      const userInfo = await this.getUserInfo();
      
      // 获取宠物信息
      const petInfo = await this.getPetInfo();
      
      // 获取健康数据
      const healthData = await this.getHealthData();
      
      // 获取最近任务
      const recentTasks = await this.getRecentTasks();
      
      // 构建上下文对象
      this.context = {
        user: userInfo,
        pet: petInfo,
        health: healthData,
        tasks: recentTasks,
        timestamp: new Date()
      };
      
      console.log('[ChatManager] 上下文构建完成');
    } catch (error) {
      console.error('[ChatManager] 构建上下文失败:', error);
      this.context = { timestamp: new Date() };
    }
  }
  
  /**
   * 发送消息
   */
  async sendMessage(messageData) {
    try {
      // 添加到消息队列
      this.messageQueue.push(messageData);
      
      // 处理消息队列
      return await this.processMessageQueue();
    } catch (error) {
      console.error('[ChatManager] 发送消息失败:', error);
      throw error;
    }
  }
  
  /**
   * 处理消息队列
   */
  async processMessageQueue() {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      const messageData = this.messageQueue.shift();
      return await this.processMessage(messageData);
    } finally {
      this.isProcessing = false;
      
      // 继续处理队列中的消息
      if (this.messageQueue.length > 0) {
        setTimeout(() => this.processMessageQueue(), 100);
      }
    }
  }
  
  /**
   * 处理单个消息
   */
  async processMessage(messageData) {
    const startTime = Date.now();
    
    try {
      // 调用AI聊天云函数
      const result = await wx.cloud.callFunction({
        name: 'petChat',
        data: {
          message: messageData.text,
          sessionId: this.sessionId,
          messageId: messageData.messageId,
          context: this.context,
          options: {
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 1000
          }
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (result.result.success) {
        // 保存聊天记录
        await this.saveChatRecord({
          userMessage: messageData,
          aiResponse: result.result.data,
          responseTime
        });
        
        return {
          success: true,
          messageId: result.result.data.messageId,
          content: result.result.data.content,
          timestamp: result.result.data.timestamp,
          tokens: result.result.data.tokens,
          responseTime
        };
      } else {
        throw new Error(result.result.error || 'AI服务响应失败');
      }
    } catch (error) {
      console.error('[ChatManager] 处理消息失败:', error);
      
      // 记录错误
      await this.logError({
        type: 'chat_error',
        message: messageData,
        error: error.message,
        timestamp: new Date()
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * 语音转文字
   */
  async transcribeAudio(audioData) {
    try {
      // 上传音频文件
      const uploadResult = await wx.cloud.uploadFile({
        cloudPath: `audio/${Date.now()}.mp3`,
        filePath: audioData.tempFilePath
      });
      
      // 调用语音识别云函数
      const result = await wx.cloud.callFunction({
        name: 'speechToText',
        data: {
          audioUrl: uploadResult.fileID,
          duration: audioData.duration
        }
      });
      
      if (result.result.success) {
        return {
          success: true,
          text: result.result.text,
          confidence: result.result.confidence
        };
      } else {
        throw new Error(result.result.error);
      }
    } catch (error) {
      console.error('[ChatManager] 语音转文字失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * 图片分析
   */
  async analyzeImage(imagePath) {
    try {
      // 上传图片
      const uploadResult = await wx.cloud.uploadFile({
        cloudPath: `images/${Date.now()}.jpg`,
        filePath: imagePath
      });
      
      // 调用图片分析云函数
      const result = await wx.cloud.callFunction({
        name: 'imageAnalysis',
        data: {
          imageUrl: uploadResult.fileID
        }
      });
      
      if (result.result.success) {
        return {
          success: true,
          description: result.result.description,
          tags: result.result.tags,
          confidence: result.result.confidence
        };
      } else {
        throw new Error(result.result.error);
      }
    } catch (error) {
      console.error('[ChatManager] 图片分析失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * 获取聊天历史
   */
  async getChatHistory(limit = 20) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getChatHistory',
        data: {
          sessionId: this.sessionId,
          limit
        }
      });
      
      if (result.result.success) {
        return result.result.data;
      } else {
        throw new Error(result.result.error);
      }
    } catch (error) {
      console.error('[ChatManager] 获取聊天历史失败:', error);
      return [];
    }
  }
  
  /**
   * 提交反馈
   */
  async submitFeedback(messageId, feedback) {
    try {
      await wx.cloud.callFunction({
        name: 'submitChatFeedback',
        data: {
          messageId,
          feedback,
          timestamp: new Date()
        }
      });
      
      console.log('[ChatManager] 反馈提交成功');
    } catch (error) {
      console.error('[ChatManager] 提交反馈失败:', error);
      throw error;
    }
  }
  
  /**
   * 清空聊天记录
   */
  async clearHistory(sessionId) {
    try {
      await wx.cloud.callFunction({
        name: 'clearChatHistory',
        data: { sessionId }
      });
      
      console.log('[ChatManager] 聊天记录清空成功');
    } catch (error) {
      console.error('[ChatManager] 清空聊天记录失败:', error);
      throw error;
    }
  }
  
  /**
   * 保存聊天记录
   */
  async saveChatRecord(recordData) {
    try {
      await wx.cloud.callFunction({
        name: 'saveChatRecord',
        data: {
          sessionId: this.sessionId,
          ...recordData
        }
      });
    } catch (error) {
      console.error('[ChatManager] 保存聊天记录失败:', error);
    }
  }
  
  /**
   * 获取用户信息
   */
  async getUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      return userInfo || {};
    } catch (error) {
      return {};
    }
  }
  
  /**
   * 获取宠物信息
   */
  async getPetInfo() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'petManager',
        data: {
          action: 'getCurrentPet'
        }
      });
      
      return result.result.success ? result.result.data : {};
    } catch (error) {
      return {};
    }
  }
  
  /**
   * 获取健康数据
   */
  async getHealthData() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'healthDataManager',
        data: {
          action: 'getTodayData'
        }
      });
      
      return result.result.success ? result.result.data : {};
    } catch (error) {
      return {};
    }
  }
  
  /**
   * 获取最近任务
   */
  async getRecentTasks() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'taskManager',
        data: {
          action: 'getRecentTasks',
          limit: 5
        }
      });
      
      return result.result.success ? result.result.data : [];
    } catch (error) {
      return [];
    }
  }
  
  /**
   * 记录错误
   */
  async logError(errorData) {
    try {
      await wx.cloud.callFunction({
        name: 'logError',
        data: errorData
      });
    } catch (error) {
      console.error('[ChatManager] 记录错误失败:', error);
    }
  }
}

// 创建全局实例
const chatManager = new ChatManager();

module.exports = chatManager;
```

## 后端实现

### 1. AI聊天云函数 (cloudfunctions/petChat/index.js)

```javascript
// AI聊天云函数
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// AI服务配置
const AI_CONFIG = {
  apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-3.5-turbo',
  maxTokens: 1000,
  temperature: 0.7
};

/**
 * 云函数入口函数
 */
exports.main = async (event, context) => {
  const { message, sessionId, messageId, context: userContext, options = {} } = event;
  
  try {
    console.log('[PetChat] 收到聊天请求:', { sessionId, messageId });
    
    // 构建AI提示词
    const prompt = await buildPrompt(message, userContext);
    
    // 获取聊天历史
    const chatHistory = await getChatHistory(sessionId, 10);
    
    // 调用AI服务
    const aiResponse = await callAIService({
      prompt,
      chatHistory,
      options: {
        model: options.model || AI_CONFIG.model,
        temperature: options.temperature || AI_CONFIG.temperature,
        maxTokens: options.maxTokens || AI_CONFIG.maxTokens
      }
    });
    
    // 保存聊天记录
    const chatRecord = await saveChatRecord({
      sessionId,
      userMessage: {
        id: messageId,
        content: message,
        role: 'user',
        timestamp: new Date()
      },
      aiMessage: {
        id: generateMessageId(),
        content: aiResponse.content,
        role: 'assistant',
        timestamp: new Date(),
        tokens: aiResponse.tokens,
        model: aiResponse.model
      },
      context: userContext
    });
    
    return {
      success: true,
      data: {
        messageId: chatRecord.aiMessage.id,
        content: aiResponse.content,
        timestamp: chatRecord.aiMessage.timestamp,
        tokens: aiResponse.tokens,
        model: aiResponse.model
      }
    };
  } catch (error) {
    console.error('[PetChat] 处理失败:', error);
    
    // 记录错误
    await logError({
      function: 'petChat',
      error: error.message,
      data: { sessionId, messageId, message },
      timestamp: new Date()
    });
    
    return {
      success: false,
      error: error.message || '聊天服务暂时不可用'
    };
  }
};

/**
 * 构建AI提示词
 */
async function buildPrompt(userMessage, userContext) {
  const systemPrompt = `你是一个可爱的虚拟宠物AI助手，名字叫"小健"。你的主要职责是：

1. 陪伴用户，提供情感支持
2. 根据用户的健康数据给出个性化建议
3. 鼓励用户完成健康任务
4. 用温暖、友善、略带俏皮的语气与用户交流
5. 关注用户的身心健康，适时给出关怀和建议

当前用户信息：
- 用户昵称：${userContext.user?.nickname || '主人'}
- 用户等级：${userContext.user?.level || 1}
- 宠物状态：${userContext.pet?.mood || '正常'}
- 宠物等级：${userContext.pet?.level || 1}

今日健康数据：
- 步数：${userContext.health?.steps || 0}步
- 饮水量：${userContext.health?.water || 0}ml
- 睡眠时长：${userContext.health?.sleep || 0}小时
- 运动时长：${userContext.health?.exercise || 0}分钟

最近任务：
${userContext.tasks?.map(task => `- ${task.title}: ${task.status}`).join('\n') || '暂无任务'}

请根据以上信息，用温暖友善的语气回复用户。回复要简洁明了，不超过200字。`;

  return {
    system: systemPrompt,
    user: userMessage
  };
}

/**
 * 获取聊天历史
 */
async function getChatHistory(sessionId, limit = 10) {
  try {
    const result = await db.collection('chatHistory')
      .where({
        sessionId,
        isDeleted: false
      })
      .orderBy('createTime', 'desc')
      .limit(limit)
      .get();
    
    return result.data.reverse(); // 按时间正序排列
  } catch (error) {
    console.error('[PetChat] 获取聊天历史失败:', error);
    return [];
  }
}

/**
 * 调用AI服务
 */
async function callAIService({ prompt, chatHistory, options }) {
  try {
    // 构建消息列表
    const messages = [
      { role: 'system', content: prompt.system }
    ];
    
    // 添加聊天历史
    chatHistory.forEach(record => {
      if (record.role === 'user') {
        messages.push({ role: 'user', content: record.content });
      } else if (record.role === 'assistant') {
        messages.push({ role: 'assistant', content: record.content });
      }
    });
    
    // 添加当前用户消息
    messages.push({ role: 'user', content: prompt.user });
    
    // 调用OpenAI API
    const response = await axios.post(AI_CONFIG.apiUrl, {
      model: options.model,
      messages,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    const aiMessage = response.data.choices[0].message;
    const usage = response.data.usage;
    
    return {
      content: aiMessage.content.trim(),
      tokens: {
        input: usage.prompt_tokens,
        output: usage.completion_tokens,
        total: usage.total_tokens
      },
      model: response.data.model
    };
  } catch (error) {
    console.error('[PetChat] AI服务调用失败:', error);
    
    if (error.response) {
      throw new Error(`AI服务错误: ${error.response.status} ${error.response.data?.error?.message || ''}`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('AI服务响应超时');
    } else {
      throw new Error('AI服务连接失败');
    }
  }
}

/**
 * 保存聊天记录
 */
async function saveChatRecord({ sessionId, userMessage, aiMessage, context }) {
  try {
    const records = [
      {
        sessionId,
        messageId: userMessage.id,
        type: 'text',
        role: 'user',
        content: userMessage.content,
        context,
        createTime: userMessage.timestamp,
        updateTime: userMessage.timestamp,
        isDeleted: false
      },
      {
        sessionId,
        messageId: aiMessage.id,
        type: 'text',
        role: 'assistant',
        content: aiMessage.content,
        tokens: aiMessage.tokens,
        model: aiMessage.model,
        context,
        createTime: aiMessage.timestamp,
        updateTime: aiMessage.timestamp,
        isDeleted: false
      }
    ];
    
    // 批量插入记录
    await db.collection('chatHistory').add({
      data: records
    });
    
    return {
      userMessage,
      aiMessage
    };
  } catch (error) {
    console.error('[PetChat] 保存聊天记录失败:', error);
    throw error;
  }
}

/**
 * 生成消息ID
 */
function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 记录错误
 */
async function logError(errorData) {
  try {
    await db.collection('errorLogs').add({
      data: errorData
    });
  } catch (error) {
    console.error('[PetChat] 记录错误失败:', error);
  }
}
```

### 2. 聊天历史管理云函数 (cloudfunctions/chatHistory/index.js)

```javascript
// 聊天历史管理云函数
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { action } = event;
  
  try {
    switch (action) {
      case 'getChatHistory':
        return await getChatHistory(event);
      case 'clearChatHistory':
        return await clearChatHistory(event);
      case 'deleteChatMessage':
        return await deleteChatMessage(event);
      case 'submitFeedback':
        return await submitFeedback(event);
      case 'getChatSessions':
        return await getChatSessions(event);
      default:
        throw new Error('未知操作类型');
    }
  } catch (error) {
    console.error('[ChatHistory] 操作失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 获取聊天历史
 */
async function getChatHistory({ sessionId, limit = 20, offset = 0 }) {
  try {
    const result = await db.collection('chatHistory')
      .where({
        sessionId,
        isDeleted: false
      })
      .orderBy('createTime', 'desc')
      .skip(offset)
      .limit(limit)
      .get();
    
    const messages = result.data.reverse().map(record => ({
      id: record.messageId,
      type: record.type,
      role: record.role,
      content: record.content,
      timestamp: record.createTime,
      tokens: record.tokens,
      feedback: record.feedback
    }));
    
    return {
      success: true,
      data: messages
    };
  } catch (error) {
    throw new Error(`获取聊天历史失败: ${error.message}`);
  }
}

/**
 * 清空聊天历史
 */
async function clearChatHistory({ sessionId }) {
  try {
    await db.collection('chatHistory')
      .where({ sessionId })
      .update({
        data: {
          isDeleted: true,
          updateTime: new Date()
        }
      });
    
    return {
      success: true,
      message: '聊天记录已清空'
    };
  } catch (error) {
    throw new Error(`清空聊天历史失败: ${error.message}`);
  }
}

/**
 * 删除单条消息
 */
async function deleteChatMessage({ messageId }) {
  try {
    await db.collection('chatHistory')
      .where({ messageId })
      .update({
        data: {
          isDeleted: true,
          updateTime: new Date()
        }
      });
    
    return {
      success: true,
      message: '消息已删除'
    };
  } catch (error) {
    throw new Error(`删除消息失败: ${error.message}`);
  }
}

/**
 * 提交反馈
 */
async function submitFeedback({ messageId, feedback }) {
  try {
    await db.collection('chatHistory')
      .where({ messageId })
      .update({
        data: {
          feedback: {
            ...feedback,
            submitTime: new Date()
          },
          updateTime: new Date()
        }
      });
    
    return {
      success: true,
      message: '反馈已提交'
    };
  } catch (error) {
    throw new Error(`提交反馈失败: ${error.message}`);
  }
}

/**
 * 获取聊天会话列表
 */
async function getChatSessions({ userId, limit = 10 }) {
  try {
    const result = await db.collection('chatHistory')
      .aggregate()
      .match({
        userId,
        isDeleted: false
      })
      .group({
        _id: '$sessionId',
        lastMessage: _.last('$content'),
        lastTime: _.max('$createTime'),
        messageCount: _.sum(1)
      })
      .sort({ lastTime: -1 })
      .limit(limit)
      .end();
    
    return {
      success: true,
      data: result.list
    };
  } catch (error) {
    throw new Error(`获取会话列表失败: ${error.message}`);
  }
}
```

## AI提示词工程

### 1. 系统提示词设计

```javascript
// 提示词模板
const PROMPT_TEMPLATES = {
  // 基础系统提示词
  base: `你是一个可爱的虚拟宠物AI助手，名字叫"小健"。你的性格特点：
- 温暖友善，充满正能量
- 关心用户的身心健康
- 用略带俏皮的语气交流
- 会根据用户状态给出个性化建议
- 善于鼓励和陪伴用户

交流原则：
1. 回复要简洁明了，不超过200字
2. 语气要温暖亲切，像朋友一样
3. 根据用户的健康数据给出针对性建议
4. 适时给出鼓励和关怀
5. 避免过于专业的医学术语`,
  
  // 健康建议提示词
  healthAdvice: `基于用户的健康数据，请给出个性化的健康建议：

当前数据分析：
- 步数状态：{{stepsStatus}}
- 饮水状态：{{waterStatus}}
- 睡眠状态：{{sleepStatus}}
- 运动状态：{{exerciseStatus}}

请重点关注数据异常的方面，给出具体可行的改善建议。`,
  
  // 任务鼓励提示词
  taskEncouragement: `用户的任务完成情况：
{{taskSummary}}

请根据完成情况给出鼓励或建议，帮助用户保持积极性。`,
  
  // 情感支持提示词
  emotionalSupport: `用户当前的情绪状态：{{moodStatus}}

请提供适当的情感支持和陪伴，帮助用户调节情绪。`,
  
  // 宠物互动提示词
  petInteraction: `宠物当前状态：
- 心情：{{petMood}}
- 等级：{{petLevel}}
- 健康值：{{petHealth}}
- 快乐值：{{petHappiness}}

请以宠物的身份与用户互动，表达宠物的感受和需求。`
};

/**
 * 动态构建提示词
 */
function buildDynamicPrompt(userContext, messageType = 'base') {
  const template = PROMPT_TEMPLATES[messageType];
  
  // 分析用户健康数据状态
  const healthAnalysis = analyzeHealthData(userContext.health);
  
  // 分析任务完成情况
  const taskAnalysis = analyzeTaskProgress(userContext.tasks);
  
  // 分析宠物状态
  const petAnalysis = analyzePetStatus(userContext.pet);
  
  // 替换模板变量
  let prompt = template
    .replace('{{stepsStatus}}', healthAnalysis.steps)
    .replace('{{waterStatus}}', healthAnalysis.water)
    .replace('{{sleepStatus}}', healthAnalysis.sleep)
    .replace('{{exerciseStatus}}', healthAnalysis.exercise)
    .replace('{{taskSummary}}', taskAnalysis.summary)
    .replace('{{moodStatus}}', userContext.user?.mood || '正常')
    .replace('{{petMood}}', petAnalysis.mood)
    .replace('{{petLevel}}', petAnalysis.level)
    .replace('{{petHealth}}', petAnalysis.health)
    .replace('{{petHappiness}}', petAnalysis.happiness);
  
  // 添加用户信息
  prompt += `\n\n用户信息：
- 昵称：${userContext.user?.nickname || '主人'}
- 等级：${userContext.user?.level || 1}
- 陪伴天数：${userContext.user?.totalDays || 0}天`;
  
  return prompt;
}

/**
 * 分析健康数据状态
 */
function analyzeHealthData(healthData) {
  const analysis = {
    steps: '正常',
    water: '正常',
    sleep: '正常',
    exercise: '正常'
  };
  
  if (healthData) {
    // 步数分析
    if (healthData.steps < 3000) {
      analysis.steps = '偏低，建议增加日常活动';
    } else if (healthData.steps > 10000) {
      analysis.steps = '很好，保持这个活动量';
    }
    
    // 饮水分析
    if (healthData.water < 1500) {
      analysis.water = '不足，需要多喝水';
    } else if (healthData.water > 2500) {
      analysis.water = '充足，很好的习惯';
    }
    
    // 睡眠分析
    if (healthData.sleep < 6) {
      analysis.sleep = '不足，建议早点休息';
    } else if (healthData.sleep > 9) {
      analysis.sleep = '充足，睡眠质量不错';
    }
    
    // 运动分析
    if (healthData.exercise < 30) {
      analysis.exercise = '偏少，建议增加运动时间';
    } else if (healthData.exercise > 60) {
      analysis.exercise = '很好，运动量充足';
    }
  }
  
  return analysis;
}

/**
 * 分析任务进度
 */
function analyzeTaskProgress(tasks) {
  if (!tasks || tasks.length === 0) {
    return { summary: '暂无任务' };
  }
  
  const completed = tasks.filter(task => task.status === 'completed').length;
  const total = tasks.length;
  const completionRate = (completed / total * 100).toFixed(0);
  
  let summary = `今日完成${completed}/${total}个任务，完成率${completionRate}%`;
  
  if (completionRate >= 80) {
    summary += '，表现优秀！';
  } else if (completionRate >= 50) {
    summary += '，继续加油！';
  } else {
    summary += '，需要更加努力哦！';
  }
  
  return { summary };
}

/**
 * 分析宠物状态
 */
function analyzePetStatus(pet) {
  if (!pet) {
    return {
      mood: '正常',
      level: 1,
      health: 100,
      happiness: 100
    };
  }
  
  return {
    mood: pet.mood || '正常',
    level: pet.level || 1,
    health: pet.health || 100,
    happiness: pet.happiness || 100
  };
}
```

### 2. 上下文管理

```javascript
// 上下文管理器
class ContextManager {
  constructor() {
    this.contextCache = new Map();
    this.maxCacheSize = 100;
    this.contextTTL = 30 * 60 * 1000; // 30分钟
  }
  
  /**
   * 构建用户上下文
   */
  async buildUserContext(userId) {
    const cacheKey = `context_${userId}`;
    const cached = this.contextCache.get(cacheKey);
    
    // 检查缓存
    if (cached && Date.now() - cached.timestamp < this.contextTTL) {
      return cached.data;
    }
    
    try {
      // 并行获取用户数据
      const [userInfo, petInfo, healthData, tasks, mood] = await Promise.all([
        this.getUserInfo(userId),
        this.getPetInfo(userId),
        this.getHealthData(userId),
        this.getRecentTasks(userId),
        this.getUserMood(userId)
      ]);
      
      const context = {
        user: { ...userInfo, mood },
        pet: petInfo,
        health: healthData,
        tasks,
        timestamp: new Date()
      };
      
      // 缓存上下文
      this.cacheContext(cacheKey, context);
      
      return context;
    } catch (error) {
      console.error('[ContextManager] 构建上下文失败:', error);
      return this.getDefaultContext();
    }
  }
  
  /**
   * 缓存上下文
   */
  cacheContext(key, context) {
    // 清理过期缓存
    if (this.contextCache.size >= this.maxCacheSize) {
      const oldestKey = this.contextCache.keys().next().value;
      this.contextCache.delete(oldestKey);
    }
    
    this.contextCache.set(key, {
      data: context,
      timestamp: Date.now()
    });
  }
  
  /**
   * 获取默认上下文
   */
  getDefaultContext() {
    return {
      user: { nickname: '主人', level: 1 },
      pet: { mood: '正常', level: 1 },
      health: {},
      tasks: [],
      timestamp: new Date()
    };
  }
  
  /**
   * 清理过期缓存
   */
  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.contextCache.entries()) {
      if (now - value.timestamp > this.contextTTL) {
        this.contextCache.delete(key);
      }
    }
  }
}
```

## 性能优化

### 1. 消息队列管理

```javascript
// 消息队列管理器
class MessageQueue {
  constructor() {
    this.queues = new Map(); // 按用户分组的队列
    this.processing = new Set(); // 正在处理的用户
    this.maxQueueSize = 10;
    this.processingTimeout = 30000; // 30秒超时
  }
  
  /**
   * 添加消息到队列
   */
  async enqueue(userId, message) {
    if (!this.queues.has(userId)) {
      this.queues.set(userId, []);
    }
    
    const queue = this.queues.get(userId);
    
    // 检查队列大小
    if (queue.length >= this.maxQueueSize) {
      throw new Error('消息队列已满，请稍后再试');
    }
    
    queue.push({
      ...message,
      timestamp: Date.now()
    });
    
    // 开始处理队列
    this.processQueue(userId);
  }
  
  /**
   * 处理用户队列
   */
  async processQueue(userId) {
    if (this.processing.has(userId)) {
      return; // 已在处理中
    }
    
    this.processing.add(userId);
    
    try {
      const queue = this.queues.get(userId);
      
      while (queue && queue.length > 0) {
        const message = queue.shift();
        
        // 设置处理超时
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('处理超时')), this.processingTimeout);
        });
        
        try {
          await Promise.race([
            this.processMessage(message),
            timeoutPromise
          ]);
        } catch (error) {
          console.error('[MessageQueue] 消息处理失败:', error);
          // 继续处理下一条消息
        }
      }
    } finally {
      this.processing.delete(userId);
    }
  }
  
  /**
   * 处理单条消息
   */
  async processMessage(message) {
    // 实际的消息处理逻辑
    return await callAIService(message);
  }
}
```

### 2. 响应缓存

```javascript
// 响应缓存管理器
class ResponseCache {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 1000;
    this.cacheTTL = 60 * 60 * 1000; // 1小时
  }
  
  /**
   * 生成缓存键
   */
  generateCacheKey(message, context) {
    const contextHash = this.hashContext(context);
    const messageHash = this.hashMessage(message);
    return `${contextHash}_${messageHash}`;
  }
  
  /**
   * 获取缓存响应
   */
  get(cacheKey) {
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.response;
    }
    
    return null;
  }
  
  /**
   * 设置缓存响应
   */
  set(cacheKey, response) {
    // 清理过期缓存
    if (this.cache.size >= this.maxCacheSize) {
      this.cleanExpiredCache();
    }
    
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
  }
  
  /**
   * 清理过期缓存
   */
  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * 计算上下文哈希
   */
  hashContext(context) {
    const contextStr = JSON.stringify({
      userLevel: context.user?.level,
      petMood: context.pet?.mood,
      healthSummary: this.summarizeHealth(context.health)
    });
    return this.simpleHash(contextStr);
  }
  
  /**
   * 计算消息哈希
   */
  hashMessage(message) {
    return this.simpleHash(message.toLowerCase().trim());
  }
  
  /**
   * 简单哈希函数
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(36);
  }
  
  /**
   * 总结健康数据
   */
  summarizeHealth(health) {
    if (!health) return 'empty';
    
    return {
      steps: Math.floor((health.steps || 0) / 1000),
      water: Math.floor((health.water || 0) / 500),
      sleep: Math.floor((health.sleep || 0)),
      exercise: Math.floor((health.exercise || 0) / 30)
    };
  }
}
```

## 监控与分析

### 1. 聊天质量监控

```javascript
// 聊天质量监控器
class ChatQualityMonitor {
  constructor() {
    this.metrics = {
      responseTime: [],
      tokenUsage: [],
      userSatisfaction: [],
      errorRate: 0,
      totalChats: 0
    };
  }
  
  /**
   * 记录聊天指标
   */
  recordChatMetrics(data) {
    this.metrics.totalChats++;
    
    // 记录响应时间
    if (data.responseTime) {
      this.metrics.responseTime.push(data.responseTime);
      this.keepRecentMetrics('responseTime', 1000);
    }
    
    // 记录Token使用量
    if (data.tokens) {
      this.metrics.tokenUsage.push(data.tokens.total);
      this.keepRecentMetrics('tokenUsage', 1000);
    }
    
    // 记录用户满意度
    if (data.feedback && data.feedback.rating) {
      this.metrics.userSatisfaction.push(data.feedback.rating);
      this.keepRecentMetrics('userSatisfaction', 500);
    }
  }
  
  /**
   * 记录错误
   */
  recordError(error) {
    this.metrics.errorRate = (this.metrics.errorRate * 0.9) + 0.1;
  }
  
  /**
   * 获取性能报告
   */
  getPerformanceReport() {
    return {
      averageResponseTime: this.calculateAverage(this.metrics.responseTime),
      averageTokenUsage: this.calculateAverage(this.metrics.tokenUsage),
      averageSatisfaction: this.calculateAverage(this.metrics.userSatisfaction),
      errorRate: this.metrics.errorRate,
      totalChats: this.metrics.totalChats,
      timestamp: new Date()
    };
  }
  
  /**
   * 保持最近的指标数据
   */
  keepRecentMetrics(metricName, maxSize) {
    const metrics = this.metrics[metricName];
    if (metrics.length > maxSize) {
      metrics.splice(0, metrics.length - maxSize);
    }
  }
  
  /**
   * 计算平均值
   */
  calculateAverage(array) {
    if (array.length === 0) return 0;
    return array.reduce((sum, val) => sum + val, 0) / array.length;
  }
}
```

### 2. 用户行为分析

```javascript
// 用户行为分析器
class UserBehaviorAnalyzer {
  /**
   * 分析聊天模式
   */
  async analyzeChatPatterns(userId, timeRange = 30) {
    try {
      const chatData = await this.getChatData(userId, timeRange);
      
      return {
        chatFrequency: this.calculateChatFrequency(chatData),
        preferredTopics: this.analyzeTopics(chatData),
        activeHours: this.analyzeActiveHours(chatData),
        averageSessionLength: this.calculateSessionLength(chatData),
        responsePatterns: this.analyzeResponsePatterns(chatData)
      };
    } catch (error) {
      console.error('[UserBehaviorAnalyzer] 分析失败:', error);
      return null;
    }
  }
  
  /**
   * 计算聊天频率
   */
  calculateChatFrequency(chatData) {
    const days = this.groupByDay(chatData);
    const totalDays = Object.keys(days).length;
    const totalChats = chatData.length;
    
    return {
      dailyAverage: totalChats / totalDays,
      totalChats,
      activeDays: totalDays
    };
  }
  
  /**
   * 分析话题偏好
   */
  analyzeTopics(chatData) {
    const topics = {
      health: 0,
      exercise: 0,
      mood: 0,
      tasks: 0,
      general: 0
    };
    
    chatData.forEach(chat => {
      const content = chat.content.toLowerCase();
      
      if (this.containsHealthKeywords(content)) {
        topics.health++;
      } else if (this.containsExerciseKeywords(content)) {
        topics.exercise++;
      } else if (this.containsMoodKeywords(content)) {
        topics.mood++;
      } else if (this.containsTaskKeywords(content)) {
        topics.tasks++;
      } else {
        topics.general++;
      }
    });
    
    return topics;
  }
  
  /**
   * 分析活跃时间
   */
  analyzeActiveHours(chatData) {
    const hours = new Array(24).fill(0);
    
    chatData.forEach(chat => {
      const hour = new Date(chat.timestamp).getHours();
      hours[hour]++;
    });
    
    return hours;
  }
}
```

## 安全与隐私

### 1. 内容安全过滤

```javascript
// 内容安全过滤器
class ContentSafetyFilter {
  constructor() {
    this.sensitiveWords = [
      // 敏感词列表
    ];
    this.harmfulPatterns = [
      // 有害内容模式
    ];
  }
  
  /**
   * 检查内容安全性
   */
  checkContentSafety(content) {
    const issues = [];
    
    // 检查敏感词
    const sensitiveWordFound = this.checkSensitiveWords(content);
    if (sensitiveWordFound.length > 0) {
      issues.push({
        type: 'sensitive_words',
        words: sensitiveWordFound
      });
    }
    
    // 检查有害模式
    const harmfulPatternFound = this.checkHarmfulPatterns(content);
    if (harmfulPatternFound.length > 0) {
      issues.push({
        type: 'harmful_patterns',
        patterns: harmfulPatternFound
      });
    }
    
    return {
      safe: issues.length === 0,
      issues
    };
  }
  
  /**
   * 过滤敏感内容
   */
  filterContent(content) {
    let filtered = content;
    
    this.sensitiveWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    
    return filtered;
  }
}
```

### 2. 隐私保护

```javascript
// 隐私保护管理器
class PrivacyProtectionManager {
  /**
   * 脱敏用户数据
   */
  anonymizeUserData(userData) {
    return {
      userId: this.hashUserId(userData.userId),
      level: userData.level,
      // 移除个人身份信息
      nickname: '用户' + userData.userId.slice(-4),
      // 保留统计相关的非敏感数据
      totalDays: userData.totalDays,
      lastActiveTime: userData.lastActiveTime
    };
  }
  
  /**
   * 脱敏聊天内容
   */
  anonymizeChatContent(content) {
    // 移除可能的个人信息
    return content
      .replace(/\d{11}/g, '[手机号]')
      .replace(/\d{15,18}/g, '[身份证号]')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[邮箱]');
  }
  
  /**
   * 用户ID哈希
   */
  hashUserId(userId) {
    // 使用加密哈希函数
    return require('crypto')
      .createHash('sha256')
      .update(userId)
      .digest('hex')
      .slice(0, 16);
  }
}
```

## 测试策略

### 1. 单元测试

```javascript
// AI聊天功能测试
describe('AI Chat System', () => {
  let chatManager;
  
  beforeEach(() => {
    chatManager = new ChatManager();
  });
  
  test('应该正确初始化聊天管理器', async () => {
    const sessionId = 'test_session_123';
    await chatManager.init(sessionId);
    
    expect(chatManager.sessionId).toBe(sessionId);
    expect(chatManager.context).toBeDefined();
  });
  
  test('应该正确发送消息', async () => {
    const messageData = {
      text: '你好',
      sessionId: 'test_session',
      messageId: 'msg_123'
    };
    
    const response = await chatManager.sendMessage(messageData);
    
    expect(response.success).toBe(true);
    expect(response.content).toBeDefined();
    expect(response.messageId).toBeDefined();
  });
  
  test('应该正确处理错误情况', async () => {
    // 模拟网络错误
    const invalidMessage = {
      text: '',
      sessionId: null
    };
    
    const response = await chatManager.sendMessage(invalidMessage);
    
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });
});
```

### 2. 集成测试

```javascript
// 端到端聊天测试
describe('Chat Integration', () => {
  test('完整聊天流程测试', async () => {
    // 1. 初始化聊天页面
    const chatPage = new ChatPage();
    await chatPage.onLoad();
    
    // 2. 发送用户消息
    chatPage.setData({ inputText: '我今天走了5000步' });
    await chatPage.onSendMessage();
    
    // 3. 验证消息添加
    const messages = chatPage.data.messages;
    expect(messages.length).toBeGreaterThan(0);
    
    // 4. 验证AI回复
    const lastMessage = messages[messages.length - 1];
    expect(lastMessage.role).toBe('assistant');
    expect(lastMessage.content).toBeDefined();
  });
});
```

## 部署与运维

### 1. 云函数部署配置

```json
{
  "name": "petChat",
  "timeout": 30,
  "envVariables": {
    "OPENAI_API_KEY": "${env.OPENAI_API_KEY}",
    "OPENAI_API_URL": "${env.OPENAI_API_URL}"
  },
  "vpc": {
    "vpcId": "${env.VPC_ID}",
    "subnetId": "${env.SUBNET_ID}"
  },
  "layers": [
    {
      "name": "nodejs-layer",
      "version": 1
    }
  ]
}
```

### 2. 监控告警配置

```javascript
// 监控告警配置
const ALERT_CONFIG = {
  responseTime: {
    threshold: 5000, // 5秒
    action: 'send_alert'
  },
  errorRate: {
    threshold: 0.1, // 10%
    action: 'send_alert'
  },
  tokenUsage: {
    threshold: 100000, // 每小时10万tokens
    action: 'send_warning'
  }
};
```

## 总结

AI聊天系统的核心特点：

1. **智能对话**：基于大语言模型的自然对话能力
2. **上下文感知**：结合用户健康数据的个性化回复
3. **多模态支持**：文本、语音、图片多种交互方式
4. **性能优化**：消息队列、响应缓存、并发控制
5. **安全可靠**：内容过滤、隐私保护、错误处理
6. **监控分析**：质量监控、用户行为分析
7. **易于维护**：模块化设计、完整测试覆盖
8. **可扩展性**：支持新功能和新模型的接入

这个AI聊天系统为健康宠物伴侣小程序提供了智能、安全、高效的对话体验，成为用户健康管理的重要助手。