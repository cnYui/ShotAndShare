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
    todayTasks: '今日任務',
    petStatus: '寵物狀態',
    healthData: '健康資料'
  },
  
  // 任務頁面
  tasks: {
    title: '健康任務',
    today: '今日任務',
    completed: '已完成',
    pending: '待完成',
    noTasks: '暫無任務'
  },
  
  // 聊天頁面
  chat: {
    title: '智慧助手',
    inputPlaceholder: '輸入您的問題...',
    send: '傳送',
    thinking: '思考中...',
    error: '傳送失敗，請重試'
  }
};