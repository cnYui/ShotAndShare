// 繁體中文語言包
module.exports = {
  // 通用
  common: {
    confirm: '確認',
    cancel: '取消',
    save: '儲存',
    edit: '編輯',
    delete: '刪除',
    loading: '載入中...',
    success: '成功',
    error: '錯誤',
    retry: '重試',
    back: '返回'
  },
  
  // 個人設定頁面
  profile: {
    title: '個人設定',
    userInfo: {
      level: 'Lv.',
      totalDays: '陪伴天數',
      totalTasks: '完成任務',
      totalExp: '總經驗',
      editProfile: '編輯個人資訊',
      nickname: '暱稱',
      signature: '個性簽名',
      nicknamePlaceholder: '請輸入暱稱',
      signaturePlaceholder: '請輸入個性簽名',
      avatarUpdateSuccess: '頭像更新成功',
      saveSuccess: '儲存成功',
      saveFailed: '儲存失敗'
    },
    pet: {
      title: '我的寵物',
      mood: '心情：',
      veryHappy: '非常開心',
      happy: '開心',
      normal: '一般',
      needCare: '需要關愛'
    },
    settings: {
      title: '設定',
      notification: {
        title: '通知設定',
        taskReminder: '任務提醒',
        waterReminder: '飲水提醒',
        sleepReminder: '睡眠提醒'
      },
      privacy: {
        title: '隱私設定',
        dataSync: '資料同步',
        privacyPolicy: '隱私政策',
        dataSyncEnabled: '已開啟資料同步',
        dataSyncDisabled: '已關閉資料同步'
      },
      app: {
        title: '應用程式設定',
        theme: '主題設定',
        language: '語言設定',
        clearCache: '清理快取',
        cacheCleared: '快取清理完成'
      },
      about: {
        title: '關於',
        checkUpdate: '檢查更新',
        aboutUs: '關於我們',
        feedback: '意見回饋',
        latestVersion: '目前已是最新版本'
      },
      theme: {
        auto: '自動',
        light: '淺色',
        dark: '深色',
        switched: '已切換到{theme}主題'
      },
      language: {
        simplified: '簡體中文',
        traditional: '繁體中文',
        english: 'English',
        switched: '語言已切換為{language}'
      }
    },
    logout: {
      title: '登出',
      confirm: '確定要登出嗎？',
      success: '已登出'
    }
  },
  
  // 主頁
  home: {
    title: '健康寵物伴侶',
    welcome: '歡迎回來',
    petName: '小綠',
    petLevel: 'Lv.{level}',
    petStatus: '寵物狀態',
    petMood: {
      veryHappy: '非常開心',
      happy: '開心',
      normal: '一般',
      needCare: '需要關愛'
    },
    stats: {
      health: '健康值',
      happiness: '快樂值',
      energy: '活力值',
      experience: '經驗值'
    },
    actions: {
      feed: '餵食',
      play: '玩耍',
      exercise: '運動',
      rest: '休息'
    },
    todayData: '今日資料',
    quickActions: '快捷操作'
  },
  
  // 健康資料頁面
  data: {
    title: '健康資料',
    overview: '資料概覽',
    today: '今日',
    categories: {
      steps: '步數',
      water: '飲水',
      sleep: '睡眠',
      exercise: '運動'
    },
    ranges: {
      day: '今日',
      week: '本週',
      month: '本月'
    },
    stats: {
      steps: '{count} 步',
      water: '{amount} ml',
      sleep: '{hours} 小時',
      exercise: '{minutes} 分鐘'
    },
    insights: {
      stepsGood: '今日步數達標，繼續保持！',
      stepsLow: '今日步數偏少，建議多走動',
      waterGood: '飲水量充足，很棒！',
      waterLow: '飲水量不足，記得多喝水',
      sleepGood: '睡眠時間充足',
      sleepLow: '睡眠不足，注意休息'
    },
    edit: {
      title: '編輯資料',
      water: '飲水量 (ml)',
      sleep: '睡眠時長 (小時)',
      exercise: '運動時長 (分鐘)',
      placeholder: '請輸入數值',
      saveSuccess: '儲存成功',
      saveFailed: '儲存失敗'
    },
    quickAdd: {
      water: '+250ml',
      addSuccess: '新增成功'
    }
  },
  
  // 任務頁面
  tasks: {
    title: '健康任務',
    todayCompleted: '今日完成',
    weeklyCompleted: '本週完成',
    totalExp: '總經驗',
    stats: {
      total: '總任務',
      completed: '已完成',
      pending: '待完成'
    },
    categories: {
      all: '全部',
      daily: '日常',
      exercise: '運動',
      diet: '飲食',
      sleep: '睡眠',
      weekly: '每週',
      special: '特殊'
    },
    groups: {
      daily: '日常任務',
      weekly: '每週任務',
      special: '特殊任務'
    },
    status: {
      completed: '已完成',
      pending: '待完成',
      inProgress: '進行中'
    },
    rewards: {
      exp: '+{exp} 經驗',
      coins: '+{coins} 金幣'
    },
    noTasks: '暫無任務',
    completeTask: '完成任務',
    taskCompleted: '任務完成！'
  },
  
  // 聊天頁面
  chat: {
    title: '智能助手',
    petName: '小綠',
    petMood: {
      happy: '開心聊天中',
      excited: '興奮交流中',
      calm: '平靜傾聽中',
      sleepy: '有點困了'
    },
    welcome: {
      title: '你好！我是你的健康小助手',
      subtitle: '有什麼健康問題想要諮詢嗎？',
      topics: [
        '今日健康資料',
        '運動建議',
        '飲食指導',
        '睡眠改善',
        '心理健康'
      ]
    },
    input: {
      placeholder: '輸入您的問題...',
      send: '發送',
      sending: '發送中...',
      thinking: '思考中...',
      error: '發送失敗，請重試'
    },
    quickReplies: [
      '我今天的資料怎麼樣？',
      '給我一些運動建議',
      '如何改善睡眠？',
      '健康飲食建議'
    ],
    settings: {
      title: '聊天設定',
      smartReply: '智能回覆',
      voicePlay: '語音播放',
      notification: '訊息通知',
      clearHistory: '清空聊天記錄',
      confirmClear: '確定要清空聊天記錄嗎？',
      cleared: '聊天記錄已清空'
    }
  }
};