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
  
  // 登录页面
  login: {
    appName: '健康宠物伴侣',
    wechatLogin: '微信登录',
    continueUse: '继续使用',
    loggingIn: '登录中...',
    authRequired: '需要授权才能使用',
    loginSuccess: '登录成功',
    registerSuccess: '注册成功',
    loginFailed: '登录失败，请重试'
  },
  
  // 主页
  home: {
    title: '健康宠物伴侣',
    welcome: '欢迎回来',
    petName: '小绿',
    petLevel: 'Lv.{level}',
    petStatus: '宠物状态',
    petMood: {
      veryHappy: '非常开心',
      happy: '开心',
      normal: '一般',
      needCare: '需要关爱'
    },
    stats: {
      health: '健康值',
      happiness: '快乐值',
      energy: '活力值',
      experience: '经验值'
    },
    actions: {
      feed: '喂食',
      play: '玩耍',
      exercise: '运动',
      rest: '休息'
    },
    todayData: '今日数据',
    quickActions: '快捷操作'
  },
  
  // 健康数据页面
  data: {
    title: '健康数据',
    overview: '数据概览',
    todayOverview: '今日数据',
    today: '今日',
    categories: {
      steps: '步数',
      water: '饮水',
      sleep: '睡眠',
      exercise: '运动'
    },
    ranges: {
      day: '今日',
      week: '本周',
      month: '本月'
    },
    stats: {
      steps: '{count} 步',
      water: '{amount} ml',
      sleep: '{hours} 小时',
      exercise: '{minutes} 分钟'
    },
    insights: {
      stepsGood: '今日步数达标，继续保持！',
      stepsLow: '今日步数偏少，建议多走动',
      waterGood: '饮水量充足，很棒！',
      waterLow: '饮水量不足，记得多喝水',
      sleepGood: '睡眠时间充足',
      sleepLow: '睡眠不足，注意休息'
    },
    edit: {
      title: '编辑数据',
      water: '饮水量 (ml)',
      sleep: '睡眠时长 (小时)',
      exercise: '运动时长 (分钟)',
      placeholder: '请输入数值',
      saveSuccess: '保存成功',
      saveFailed: '保存失败'
    },
    quickAdd: {
      water: '+250ml',
      addSuccess: '添加成功'
    }
  },
  
  // 任务页面
  tasks: {
    title: '健康任务',
    todayCompleted: '今日完成',
    weeklyCompleted: '本周完成',
    totalExp: '总经验',
    stats: {
      total: '总任务',
      completed: '已完成',
      pending: '待完成'
    },
    categories: {
      all: '全部',
      daily: '日常',
      exercise: '运动',
      diet: '饮食',
      sleep: '睡眠',
      weekly: '每周',
      special: '特殊'
    },
    groups: {
      daily: '日常任务',
      weekly: '每周任务',
      special: '特殊任务'
    },
    status: {
      completed: '已完成',
      pending: '待完成',
      inProgress: '进行中'
    },
    rewards: {
      exp: '+{exp} 经验',
      coins: '+{coins} 金币'
    },
    noTasks: '暂无任务',
    completeTask: '完成任务',
    taskCompleted: '任务完成！'
  },
  
  // 聊天页面
  chat: {
    title: '智能助手',
    petName: '小绿',
    petMood: {
      happy: '开心聊天中',
      excited: '兴奋交流中',
      calm: '平静倾听中',
      sleepy: '有点困了'
    },
    welcome: {
      title: '你好！我是你的健康小助手',
      subtitle: '有什么健康问题想要咨询吗？',
      topics: [
        '今日健康数据',
        '运动建议',
        '饮食指导',
        '睡眠改善',
        '心理健康'
      ]
    },
    input: {
      placeholder: '输入您的问题...',
      send: '发送',
      sending: '发送中...',
      thinking: '思考中...',
      error: '发送失败，请重试'
    },
    quickReplies: [
      '我今天的数据怎么样？',
      '给我一些运动建议',
      '如何改善睡眠？',
      '健康饮食建议'
    ],
    settings: {
      title: '聊天设置',
      smartReply: '智能回复',
      voicePlay: '语音播放',
      notification: '消息通知',
      clearHistory: '清空聊天记录',
      confirmClear: '确定要清空聊天记录吗？',
      cleared: '聊天记录已清空'
    }
  }
};