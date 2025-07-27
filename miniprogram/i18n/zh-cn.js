// 简体中文语言包
module.exports = {
  // 通用
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    edit: '编辑',
    delete: '删除',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    retry: '重试',
    back: '返回'
  },
  
  // 个人设置页面
  profile: {
    title: '个人设置',
    userInfo: {
      level: 'Lv.',
      totalDays: '陪伴天数',
      totalTasks: '完成任务',
      totalExp: '总经验',
      editProfile: '编辑个人信息',
      nickname: '昵称',
      signature: '个性签名',
      nicknamePlaceholder: '请输入昵称',
      signaturePlaceholder: '请输入个性签名',
      avatarUpdateSuccess: '头像更新成功',
      saveSuccess: '保存成功',
      saveFailed: '保存失败'
    },
    pet: {
      title: '我的宠物',
      mood: '心情：',
      veryHappy: '非常开心',
      happy: '开心',
      normal: '一般',
      needCare: '需要关爱'
    },
    settings: {
      title: '设置',
      notification: {
        title: '通知设置',
        taskReminder: '任务提醒',
        waterReminder: '饮水提醒',
        sleepReminder: '睡眠提醒'
      },
      privacy: {
        title: '隐私设置',
        dataSync: '数据同步',
        privacyPolicy: '隐私政策',
        dataSyncEnabled: '已开启数据同步',
        dataSyncDisabled: '已关闭数据同步'
      },
      app: {
        title: '应用设置',
        theme: '主题设置',
        language: '语言设置',
        clearCache: '清理缓存',
        cacheCleared: '缓存清理完成'
      },
      about: {
        title: '关于',
        checkUpdate: '检查更新',
        aboutUs: '关于我们',
        feedback: '意见反馈',
        latestVersion: '当前已是最新版本'
      },
      theme: {
        auto: '自动',
        light: '浅色',
        dark: '深色',
        switched: '已切换到{theme}主题'
      },
      language: {
        simplified: '简体中文',
        traditional: '繁体中文',
        english: 'English',
        switched: '语言已切换为{language}'
      }
    },
    logout: {
      title: '退出登录',
      confirm: '确定要退出登录吗？',
      success: '已退出登录'
    }
  },
  
  // 主页
  home: {
    title: '健康宠物伴侣',
    welcome: '欢迎回来',
    todayTasks: '今日任务',
    petStatus: '宠物状态',
    healthData: '健康数据'
  },
  
  // 任务页面
  tasks: {
    title: '健康任务',
    today: '今日任务',
    completed: '已完成',
    pending: '待完成',
    noTasks: '暂无任务'
  },
  
  // 聊天页面
  chat: {
    title: '智能助手',
    inputPlaceholder: '输入您的问题...',
    send: '发送',
    thinking: '思考中...',
    error: '发送失败，请重试'
  }
};