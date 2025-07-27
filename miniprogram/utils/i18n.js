// 国际化管理器
const zhCN = require('../i18n/zh-cn.js');
const zhTW = require('../i18n/zh-tw.js');
const en = require('../i18n/en.js');

class I18n {
  constructor() {
    this.languages = {
      'zh-cn': zhCN,
      'zh-tw': zhTW,
      'en': en
    };
    
    this.languageNames = {
      'zh-cn': '简体中文',
      'zh-tw': '繁體中文',
      'en': 'English'
    };
    
    // 默认语言
    this.currentLanguage = 'zh-cn';
    
    // 从本地存储加载语言设置
    this.loadLanguage();
  }
  
  // 加载语言设置
  loadLanguage() {
    try {
      const settings = wx.getStorageSync('settings');
      if (settings && settings.language) {
        const langCode = this.getLanguageCode(settings.language);
        if (langCode && this.languages[langCode]) {
          this.currentLanguage = langCode;
        }
      }
    } catch (error) {
      console.error('加载语言设置失败:', error);
    }
  }
  
  // 获取语言代码
  getLanguageCode(languageName) {
    const codeMap = {
      '简体中文': 'zh-cn',
      '繁體中文': 'zh-tw',
      'English': 'en'
    };
    return codeMap[languageName] || 'zh-cn';
  }
  
  // 设置语言
  setLanguage(languageCode) {
    if (this.languages[languageCode]) {
      this.currentLanguage = languageCode;
      
      // 保存到本地存储
      try {
        const settings = wx.getStorageSync('settings') || {};
        settings.language = this.languageNames[languageCode];
        wx.setStorageSync('settings', settings);
      } catch (error) {
        console.error('保存语言设置失败:', error);
      }
    }
  }
  
  // 获取文本
  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.languages[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && value[k] !== undefined) {
        value = value[k];
      } else {
        // 如果当前语言没有找到，尝试使用默认语言
        value = this.languages['zh-cn'];
        for (const k2 of keys) {
          if (value && typeof value === 'object' && value[k2] !== undefined) {
            value = value[k2];
          } else {
            return key; // 如果都没找到，返回key本身
          }
        }
        break;
      }
    }
    
    // 如果是字符串，进行参数替换
    if (typeof value === 'string') {
      return this.interpolate(value, params);
    }
    
    return value || key;
  }
  
  // 字符串插值
  interpolate(template, params) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }
  
  // 获取当前语言
  getCurrentLanguage() {
    return this.currentLanguage;
  }
  
  // 获取当前语言名称
  getCurrentLanguageName() {
    return this.languageNames[this.currentLanguage];
  }
  
  // 获取所有可用语言
  getAvailableLanguages() {
    return Object.keys(this.languageNames).map(code => ({
      code,
      name: this.languageNames[code]
    }));
  }
  
  // 获取当前语言的所有文本
  getTexts() {
    return this.languages[this.currentLanguage] || this.languages['zh-cn'];
  }
}

// 创建全局实例
const i18n = new I18n();

module.exports = i18n;