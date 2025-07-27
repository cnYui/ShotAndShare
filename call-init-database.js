/**
 * 手动调用initDatabase云函数的脚本
 * 用于创建数据库集合和插入默认任务数据
 */

// 在小程序中调用此函数来初始化数据库
function callInitDatabase() {
  wx.cloud.callFunction({
    name: 'initDatabase',
    data: {},
    success: res => {
      console.log('数据库初始化成功:', res.result);
      if (res.result.success) {
        wx.showToast({
          title: '数据库初始化成功',
          icon: 'success'
        });
        console.log('创建结果:', res.result.data);
      } else {
        wx.showToast({
          title: '初始化失败',
          icon: 'error'
        });
        console.error('初始化失败:', res.result.error);
      }
    },
    fail: err => {
      console.error('调用云函数失败:', err);
      wx.showToast({
        title: '调用失败',
        icon: 'error'
      });
    }
  });
}

// 导出函数供其他页面使用
module.exports = {
  callInitDatabase
};

// 使用说明：
// 1. 在小程序页面中引入此文件
// 2. 调用 callInitDatabase() 函数
// 3. 查看控制台输出和数据库变化

// 示例用法：
// const { callInitDatabase } = require('../../call-init-database.js');
// callInitDatabase();