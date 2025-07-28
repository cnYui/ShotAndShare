// English language pack
module.exports = {
  // Common
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    retry: 'Retry',
    back: 'Back'
  },
  
  // Profile page
  profile: {
    title: 'Profile Settings',
    userInfo: {
      level: 'Lv.',
      totalDays: 'Days Together',
      totalTasks: 'Tasks Completed',
      totalExp: 'Total Experience',
      editProfile: 'Edit Profile',
      nickname: 'Nickname',
      signature: 'Signature',
      nicknamePlaceholder: 'Enter nickname',
      signaturePlaceholder: 'Enter signature',
      avatarUpdateSuccess: 'Avatar updated successfully',
      saveSuccess: 'Saved successfully',
      saveFailed: 'Save failed'
    },
    pet: {
      title: 'My Pet',
      mood: 'Mood: ',
      veryHappy: 'Very Happy',
      happy: 'Happy',
      normal: 'Normal',
      needCare: 'Needs Care'
    },
    settings: {
      title: 'Settings',
      notification: {
        title: 'Notification Settings',
        taskReminder: 'Task Reminder',
        waterReminder: 'Water Reminder',
        sleepReminder: 'Sleep Reminder'
      },
      privacy: {
        title: 'Privacy Settings',
        dataSync: 'Data Sync',
        privacyPolicy: 'Privacy Policy',
        dataSyncEnabled: 'Data sync enabled',
        dataSyncDisabled: 'Data sync disabled'
      },
      app: {
        title: 'App Settings',
        theme: 'Theme Settings',
        language: 'Language Settings',
        clearCache: 'Clear Cache',
        cacheCleared: 'Cache cleared successfully'
      },
      about: {
        title: 'About',
        checkUpdate: 'Check Update',
        aboutUs: 'About Us',
        feedback: 'Feedback',
        latestVersion: 'You have the latest version'
      },
      theme: {
        auto: 'Auto',
        light: 'Light',
        dark: 'Dark',
        switched: 'Switched to {theme} theme'
      },
      language: {
        simplified: '简体中文',
        traditional: '繁體中文',
        english: 'English',
        switched: 'Language switched to {language}'
      }
    },
    logout: {
      title: 'Logout',
      confirm: 'Are you sure you want to logout?',
      success: 'Logged out successfully'
    }
  },
  
  // Home page
  home: {
    title: 'Healthy Pet Companion',
    welcome: 'Welcome Back',
    petName: 'Green',
    petLevel: 'Lv.{level}',
    petStatus: 'Pet Status',
    petMood: {
      veryHappy: 'Very Happy',
      happy: 'Happy',
      normal: 'Normal',
      needCare: 'Needs Care'
    },
    stats: {
      health: 'Health',
      happiness: 'Happiness',
      energy: 'Energy',
      experience: 'Experience'
    },
    actions: {
      feed: 'Feed',
      play: 'Play',
      exercise: 'Exercise',
      rest: 'Rest'
    },
    todayData: 'Today\'s Data',
    quickActions: 'Quick Actions'
  },
  
  // Health Data page
  data: {
    title: 'Health Data',
    overview: 'Data Overview',
    today: 'Today',
    categories: {
      steps: 'Steps',
      water: 'Water',
      sleep: 'Sleep',
      exercise: 'Exercise'
    },
    ranges: {
      day: 'Today',
      week: 'This Week',
      month: 'This Month'
    },
    stats: {
      steps: '{count} steps',
      water: '{amount} ml',
      sleep: '{hours} hours',
      exercise: '{minutes} minutes'
    },
    insights: {
      stepsGood: 'Great job on reaching your step goal today!',
      stepsLow: 'You need more steps today, try to walk more',
      waterGood: 'Excellent hydration, keep it up!',
      waterLow: 'You need more water, remember to stay hydrated',
      sleepGood: 'Good sleep duration',
      sleepLow: 'Insufficient sleep, get more rest'
    },
    edit: {
      title: 'Edit Data',
      water: 'Water Intake (ml)',
      sleep: 'Sleep Duration (hours)',
      exercise: 'Exercise Duration (minutes)',
      placeholder: 'Enter value',
      saveSuccess: 'Saved successfully',
      saveFailed: 'Save failed'
    },
    quickAdd: {
      water: '+250ml',
      addSuccess: 'Added successfully'
    }
  },
  
  // Tasks page
  tasks: {
    title: 'Health Tasks',
    todayCompleted: 'Today Completed',
    weeklyCompleted: 'Weekly Completed',
    totalExp: 'Total EXP',
    stats: {
      total: 'Total Tasks',
      completed: 'Completed',
      pending: 'Pending'
    },
    categories: {
      all: 'All',
      daily: 'Daily',
      exercise: 'Exercise',
      diet: 'Diet',
      sleep: 'Sleep',
      weekly: 'Weekly',
      special: 'Special'
    },
    groups: {
      daily: 'Daily Tasks',
      weekly: 'Weekly Tasks',
      special: 'Special Tasks'
    },
    status: {
      completed: 'Completed',
      pending: 'Pending',
      inProgress: 'In Progress'
    },
    rewards: {
      exp: '+{exp} EXP',
      coins: '+{coins} Coins'
    },
    noTasks: 'No tasks available',
    completeTask: 'Complete Task',
    taskCompleted: 'Task Completed!'
  },
  
  // Chat page
  chat: {
    title: 'AI Assistant',
    petName: 'Green',
    petMood: {
      happy: 'Happy chatting',
      excited: 'Excited to talk',
      calm: 'Calmly listening',
      sleepy: 'A bit sleepy'
    },
    welcome: {
      title: 'Hello! I\'m your health assistant',
      subtitle: 'What health questions do you have?',
      topics: [
        'Today\'s Health Data',
        'Exercise Advice',
        'Diet Guidance',
        'Sleep Improvement',
        'Mental Health'
      ]
    },
    input: {
      placeholder: 'Enter your question...',
      send: 'Send',
      sending: 'Sending...',
      thinking: 'Thinking...',
      error: 'Send failed, please retry'
    },
    quickReplies: [
      'How is my data today?',
      'Give me exercise advice',
      'How to improve sleep?',
      'Healthy diet suggestions'
    ],
    settings: {
      title: 'Chat Settings',
      smartReply: 'Smart Reply',
      voicePlay: 'Voice Playback',
      notification: 'Message Notifications',
      clearHistory: 'Clear Chat History',
      confirmClear: 'Are you sure you want to clear chat history?',
      cleared: 'Chat history cleared'
    }
  }
};