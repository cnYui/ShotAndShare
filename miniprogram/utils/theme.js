// 主题管理器
class ThemeManager {
  constructor() {
    this.themes = {
      'auto': '自动',
      'light': '浅色',
      'dark': '深色'
    };
    
    this.currentTheme = 'auto';
    this.isDarkMode = false;
    
    // 从本地存储加载主题设置
    this.loadTheme();
    
    // 监听系统主题变化
    this.watchSystemTheme();
  }
  
  // 加载主题设置
  loadTheme() {
    try {
      const settings = wx.getStorageSync('settings');
      if (settings && settings.theme) {
        const themeCode = this.getThemeCode(settings.theme);
        if (themeCode && this.themes[themeCode]) {
          this.currentTheme = themeCode;
        }
      }
      
      // 应用主题
      this.applyTheme();
    } catch (error) {
      console.error('加载主题设置失败:', error);
    }
  }
  
  // 获取主题代码
  getThemeCode(themeName) {
    const codeMap = {
      '自动': 'auto',
      '浅色': 'light',
      '深色': 'dark'
    };
    return codeMap[themeName] || 'auto';
  }
  
  // 设置主题
  setTheme(themeCode) {
    if (this.themes[themeCode]) {
      this.currentTheme = themeCode;
      
      // 保存到本地存储
      try {
        const settings = wx.getStorageSync('settings') || {};
        settings.theme = this.themes[themeCode];
        wx.setStorageSync('settings', settings);
      } catch (error) {
        console.error('保存主题设置失败:', error);
      }
      
      // 应用主题
      this.applyTheme();
    }
  }
  
  // 应用主题
  applyTheme() {
    let isDark = false;
    
    if (this.currentTheme === 'dark') {
      isDark = true;
    } else if (this.currentTheme === 'auto') {
      // 获取系统主题
      try {
        const systemInfo = wx.getSystemInfoSync();
        isDark = systemInfo.theme === 'dark';
      } catch (error) {
        console.error('获取系统主题失败:', error);
      }
    }
    
    this.isDarkMode = isDark;
    
    // 设置页面主题类名
    this.updatePageTheme();
  }
  
  // 更新页面主题
  updatePageTheme() {
    try {
      // 获取当前页面
      const pages = getCurrentPages();
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1];
        
        // 设置页面数据
        if (currentPage.setData) {
          currentPage.setData({
            isDarkMode: this.isDarkMode,
            themeClass: this.isDarkMode ? 'dark-theme' : 'light-theme'
          });
        }
      }
    } catch (error) {
      console.error('更新页面主题失败:', error);
    }
  }
  
  // 监听系统主题变化
  watchSystemTheme() {
    try {
      wx.onThemeChange && wx.onThemeChange((res) => {
        if (this.currentTheme === 'auto') {
          this.applyTheme();
        }
      });
    } catch (error) {
      console.error('监听系统主题变化失败:', error);
    }
  }
  
  // 获取当前主题
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  // 获取当前主题名称
  getCurrentThemeName() {
    return this.themes[this.currentTheme];
  }
  
  // 是否为深色模式
  isDark() {
    return this.isDarkMode;
  }
  
  // 获取所有可用主题
  getAvailableThemes() {
    return Object.keys(this.themes).map(code => ({
      code,
      name: this.themes[code]
    }));
  }
  
  // 获取主题样式变量
  getThemeVars() {
    if (this.isDarkMode) {
      return {
        // 深色主题变量
        '--bg-color': '#1a1a1a',
        '--card-bg': '#2d2d2d',
        '--text-primary': '#ffffff',
        '--text-secondary': '#cccccc',
        '--text-tertiary': '#999999',
        '--border-color': '#404040',
        '--primary-color': '#7fb069',
        '--secondary-color': '#d4a574',
        '--accent-color': '#e67e22',
        '--success-color': '#27ae60',
        '--warning-color': '#f39c12',
        '--error-color': '#e74c3c',
        '--shadow': '0 4rpx 12rpx rgba(0, 0, 0, 0.3)',
        '--gradient-bg': 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)'
      };
    } else {
      return {
        // 浅色主题变量
        '--bg-color': '#f6f6f6',
        '--card-bg': '#ffffff',
        '--text-primary': '#333333',
        '--text-secondary': '#666666',
        '--text-tertiary': '#999999',
        '--border-color': '#e0e0e0',
        '--primary-color': '#A3D39C',
        '--secondary-color': '#F6D03A',
        '--accent-color': '#FF9F55',
        '--success-color': '#27ae60',
        '--warning-color': '#f39c12',
        '--error-color': '#e74c3c',
        '--shadow': '0 4rpx 12rpx rgba(0, 0, 0, 0.1)',
        '--gradient-bg': 'linear-gradient(135deg, #A3D39C 0%, #F6D03A 50%, #FF9F55 100%)'
      };
    }
  }
}

// 创建全局实例
const themeManager = new ThemeManager();

module.exports = themeManager;