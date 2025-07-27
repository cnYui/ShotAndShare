// pages/test/test.js
Page({
  data: {
    testResults: [],
    isLoading: false,
    currentTest: '',
    testProgress: 0,
    totalTests: 6
  },

  onLoad() {
    console.log('后端测试页面加载');
  },

  // 单独调用数据库初始化
  async initDatabaseOnly() {
    wx.showLoading({
      title: '正在初始化数据库...'
    });

    try {
      const result = await wx.cloud.callFunction({
        name: 'initDatabase',
        data: {}
      });

      wx.hideLoading();

      if (result.result && result.result.success) {
        wx.showModal({
          title: '数据库初始化成功',
          content: `创建结果:\n${result.result.data.join('\n')}`,
          showCancel: false
        });
        console.log('数据库初始化成功:', result.result.data);
      } else {
        wx.showModal({
          title: '初始化失败',
          content: result.result?.error || '未知错误',
          showCancel: false
        });
      }
    } catch (error) {
      wx.hideLoading();
      wx.showModal({
        title: '调用失败',
        content: `错误信息: ${error.message}`,
        showCancel: false
      });
      console.error('数据库初始化失败:', error);
    }
  },

  // 开始完整测试
  async startFullTest() {
    this.setData({
      isLoading: true,
      testResults: [],
      testProgress: 0,
      currentTest: '准备开始测试...'
    });

    const tests = [
      { name: '数据库初始化', func: this.testDatabaseInit },
      { name: '用户登录', func: this.testUserLogin },
      { name: '宠物管理', func: this.testPetManager },
      { name: '任务管理', func: this.testTaskManager },
      { name: '智能聊天', func: this.testPetChat },
      { name: '健康数据', func: this.testHealthData }
    ];

    let passedCount = 0;
    let petId = null;

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      this.setData({
        currentTest: `正在测试: ${test.name}`,
        testProgress: Math.round((i / tests.length) * 100)
      });

      try {
        const result = await test.func.call(this, petId);
        const success = result && result.success !== false;
        
        if (success) {
          passedCount++;
          if (test.name === '宠物管理' && result.petId) {
            petId = result.petId;
          }
        }

        this.addTestResult(test.name, success, result.message || (success ? '测试通过' : '测试失败'));
      } catch (error) {
        console.error(`${test.name}测试异常:`, error);
        this.addTestResult(test.name, false, `测试异常: ${error.message}`);
      }

      // 添加延迟，避免请求过快
      await this.sleep(500);
    }

    this.setData({
      isLoading: false,
      currentTest: `测试完成! 通过率: ${passedCount}/${tests.length}`,
      testProgress: 100
    });

    wx.showToast({
      title: `测试完成 ${passedCount}/${tests.length}`,
      icon: passedCount === tests.length ? 'success' : 'none'
    });
  },

  // 测试数据库初始化
  async testDatabaseInit() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'initDatabase'
      });

      if (result.result && result.result.success) {
        return {
          success: true,
          message: `创建了 ${result.result.data.length} 个集合`
        };
      } else {
        return {
          success: false,
          message: result.result?.error || '初始化失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `调用失败: ${error.message}`
      };
    }
  },

  // 测试用户登录
  async testUserLogin() {
    try {
      // 先获取微信登录凭证
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        });
      });

      const result = await wx.cloud.callFunction({
        name: 'login',
        data: {
          code: loginRes.code,
          userInfo: {
            nickName: '测试用户',
            avatarUrl: 'https://example.com/avatar.jpg'
          }
        }
      });

      if (result.result && result.result.success) {
        return {
          success: true,
          message: `用户登录成功，等级: ${result.result.data.user.level}`
        };
      } else {
        return {
          success: false,
          message: result.result?.error || '登录失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `登录异常: ${error.message}`
      };
    }
  },

  // 测试宠物管理
  async testPetManager() {
    try {
      // 创建宠物
      const createResult = await wx.cloud.callFunction({
        name: 'petManager',
        data: {
          action: 'create',
          petData: {
            name: '测试小猫',
            type: 'cat',
            breed: '英短',
            age: 2,
            gender: 'female'
          }
        }
      });

      if (createResult.result && createResult.result.success) {
        // 获取宠物列表
        const listResult = await wx.cloud.callFunction({
          name: 'petManager',
          data: {
            action: 'list'
          }
        });

        if (listResult.result && listResult.result.success) {
          return {
            success: true,
            message: `宠物创建成功，当前有 ${listResult.result.data.length} 只宠物`,
            petId: createResult.result.data._id
          };
        }
      }

      return {
        success: false,
        message: '宠物管理测试失败'
      };
    } catch (error) {
      return {
        success: false,
        message: `宠物管理异常: ${error.message}`
      };
    }
  },

  // 测试任务管理
  async testTaskManager() {
    try {
      // 获取任务列表
      const tasksResult = await wx.cloud.callFunction({
        name: 'taskManager',
        data: {
          action: 'getTasks'
        }
      });

      if (tasksResult.result && tasksResult.result.success) {
        const tasks = tasksResult.result.data;
        
        if (tasks.length > 0) {
          // 尝试完成第一个任务
          const firstTask = tasks[0];
          const completeResult = await wx.cloud.callFunction({
            name: 'taskManager',
            data: {
              action: 'completeTask',
              taskId: firstTask._id,
              value: firstTask.target_value
            }
          });

          if (completeResult.result && completeResult.result.success) {
            return {
              success: true,
              message: `任务测试成功，获得 ${completeResult.result.data.exp_gained} 经验`
            };
          }
        }

        return {
          success: true,
          message: `获取到 ${tasks.length} 个任务`
        };
      }

      return {
        success: false,
        message: '任务管理测试失败'
      };
    } catch (error) {
      return {
        success: false,
        message: `任务管理异常: ${error.message}`
      };
    }
  },

  // 测试智能聊天
  async testPetChat(petId) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'petChat',
        data: {
          message: '你好，小宠物！',
          petId: petId || 'test-pet-id'
        }
      });

      if (result.result && result.result.success) {
        return {
          success: true,
          message: `AI回复: ${result.result.data.reply.substring(0, 20)}...`
        };
      } else {
        return {
          success: false,
          message: result.result?.error || '聊天测试失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `聊天测试异常: ${error.message}`
      };
    }
  },

  // 测试健康数据
  async testHealthData() {
    try {
      // 添加健康数据
      const addResult = await wx.cloud.callFunction({
        name: 'healthDataManager',
        data: {
          action: 'add',
          data: {
            type: 'steps',
            value: 8000,
            date: new Date().toISOString().split('T')[0]
          }
        }
      });

      if (addResult.result && addResult.result.success) {
        // 获取健康数据
        const getResult = await wx.cloud.callFunction({
          name: 'healthDataManager',
          data: {
            action: 'get',
            type: 'steps',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          }
        });

        if (getResult.result && getResult.result.success) {
          return {
            success: true,
            message: `健康数据测试成功，今日步数: 8000`
          };
        }
      }

      return {
        success: false,
        message: '健康数据测试失败'
      };
    } catch (error) {
      return {
        success: false,
        message: `健康数据异常: ${error.message}`
      };
    }
  },

  // 添加测试结果
  addTestResult(testName, success, message) {
    const results = this.data.testResults;
    results.push({
      name: testName,
      success: success,
      message: message,
      time: new Date().toLocaleTimeString()
    });
    
    this.setData({
      testResults: results
    });
  },

  // 清空测试结果
  clearResults() {
    this.setData({
      testResults: [],
      testProgress: 0,
      currentTest: ''
    });
  },

  // 单独测试数据库初始化
  async testDatabaseOnly() {
    this.setData({ isLoading: true, currentTest: '测试数据库初始化...' });
    
    const result = await this.testDatabaseInit();
    this.addTestResult('数据库初始化', result.success, result.message);
    
    this.setData({ isLoading: false, currentTest: '' });
  },

  // 工具函数：延迟
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
});