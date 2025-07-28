// 测试蛋破碎动画页面
Page({
  data: {
    testPetData: {
      level: 0,
      stage: 'egg',
      mood: 'happy',
      action: 'idle',
      health: 100,
      vitality: 100,
      intimacy: 50
    },
    statusText: '等待孵化'
  },

  onLoad() {
    console.log('🧪 测试页面加载');
    this.updateStatusText();
  },

  // 处理孵化事件
  onTestHatch(e) {
    console.log('🥚 测试孵化事件:', e.detail);
    const { newStage, newLevel } = e.detail;
    
    this.setData({
      'testPetData.stage': newStage,
      'testPetData.level': newLevel,
      statusText: '孵化成功！'
    });
    
    wx.showToast({
      title: '🎉 孵化成功！',
      icon: 'success',
      duration: 2000
    });
    
    // 触觉反馈
    wx.vibrateShort();
  },

  // 重置为蛋
  resetToEgg() {
    const newPetData = {
      ...this.data.testPetData,
      stage: 'egg',
      level: 0
    };
    
    this.setData({
      testPetData: newPetData,
      statusText: '等待孵化'
    });
    
    wx.showToast({
      title: '已重置为蛋',
      icon: 'success'
    });
  },

  // 设置为幼猫
  setBaby() {
    const newPetData = {
      ...this.data.testPetData,
      stage: 'baby',
      level: 1
    };
    
    this.setData({
      testPetData: newPetData,
      statusText: '幼猫阶段'
    });
    this.updateStatusText();
  },

  // 设置为少年猫
  setChild() {
    const newPetData = {
      ...this.data.testPetData,
      stage: 'child',
      level: 10
    };
    
    this.setData({
      testPetData: newPetData,
      statusText: '少年猫阶段'
    });
    this.updateStatusText();
  },

  // 设置为成年猫
  setAdult() {
    const newPetData = {
      ...this.data.testPetData,
      stage: 'adult',
      level: 20
    };
    
    this.setData({
      testPetData: newPetData,
      statusText: '成年猫阶段'
    });
    this.updateStatusText();
  },

  // 设置为老年猫
  setElder() {
    const newPetData = {
      ...this.data.testPetData,
      stage: 'elder',
      level: 30
    };
    
    this.setData({
      testPetData: newPetData,
      statusText: '老年猫阶段'
    });
    this.updateStatusText();
  },

  // 测试跳跃动作
  testJump() {
    const petComponent = this.selectComponent('#testPet');
    if (petComponent) {
      petComponent.jump();
    }
  },

  // 测试趴下动作
  testLayDown() {
    const petComponent = this.selectComponent('#testPet');
    if (petComponent) {
      petComponent.layDown();
    }
  },

  // 测试走动动作
  testWalk() {
    const petComponent = this.selectComponent('#testPet');
    if (petComponent) {
      petComponent.walk();
    }
  },

  // 手动触发孵化
  triggerHatch() {
    const petComponent = this.selectComponent('#testPet');
    if (petComponent && petComponent.data.stage === 'egg') {
      petComponent.onEggTap();
    } else {
      wx.showToast({
        title: '请先重置为蛋状态',
        icon: 'none'
      });
    }
  },

  // 更新状态文本
  updateStatusText() {
    const stage = this.data.testPetData.stage;
    let statusText = '';
    
    switch(stage) {
      case 'egg':
        statusText = '蛋状态 - 等待孵化';
        break;
      case 'baby':
        statusText = '幼猫状态 (1-3级)';
        break;
      case 'child':
        statusText = '小猫状态 (4-10级)';
        break;
      case 'adult':
        statusText = '成年猫状态 (10-15级)';
        break;
      case 'elder':
        statusText = '老年猫状态 (15+级)';
        break;
      default:
        statusText = '未知状态';
    }
    
    this.setData({ statusText });
  },

  // 返回首页
  goBack() {
    wx.navigateBack();
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '宠物蛋孵化测试',
      path: '/pages/test-egg/test-egg'
    };
  }
});