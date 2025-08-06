# 喂食功能云函数调用失败解决方案

## 🚨 问题描述
喂食按钮点击时出现错误：
```
cloud.callFunction:fail Error: Failed to fetch
```

## 🔍 可能原因
1. **云函数未正确部署**
2. **网络连接问题**
3. **云开发环境配置错误**
4. **云函数超时或内存不足**

## ✅ 解决步骤

### 1. 检查云函数部署状态
在微信开发者工具中：
- 打开「云开发」控制台
- 查看「云函数」列表
- 确认 `petManager` 云函数已部署且状态正常

### 2. 重新部署云函数
```bash
# 在项目根目录执行
bash deploy-cloudfunctions.sh
```

### 3. 检查网络连接
- 确保设备连接到互联网
- 检查微信开发者工具的网络设置
- 尝试在真机上测试（而非模拟器）

### 4. 验证云开发环境
在 `app.js` 中确认环境ID正确：
```javascript
env: "cloud1-6g4qsd2kcddd1be0"
```

### 5. 临时解决方案（本地模拟）
如果云函数暂时无法使用，可以添加本地模拟：

```javascript
// 在 home.js 的 feedPet 方法中添加
feedPet() {
  // 防止重复点击
  if (this.data.isFeeding) {
    return;
  }
  
  this.setData({ isFeeding: true });
  
  // 临时本地模拟（仅用于测试）
  const isLocalTest = true; // 设置为 false 使用云函数
  
  if (isLocalTest) {
    // 本地模拟喂食逻辑
    const currentPetInfo = this.data.petInfo;
    const newHealth = Math.min(currentPetInfo.health + 15, 100);
    const newVitality = Math.min(currentPetInfo.vitality + 10, 100);
    
    // 触发宠物喂食动画
    const petComponent = this.selectComponent('#mainPet');
    if (petComponent) {
      petComponent.feed(false);
    }
    
    // 更新本地状态
    this.setData({
      'petInfo.health': newHealth,
      'petInfo.vitality': newVitality,
      petMessage: '谢谢主人！好好吃！',
      isFeeding: false
    });
    
    wx.showToast({
      title: '喂食成功！',
      icon: 'success'
    });
    
    setTimeout(() => {
      this.setData({ petMessage: '' });
    }, 3000);
    
    return;
  }
  
  // 原有的云函数调用逻辑...
}
```

### 6. 检查云函数日志
在微信开发者工具的云开发控制台中：
- 查看「云函数」→「日志」
- 检查是否有错误信息
- 确认函数是否被正确调用

## 🎯 推荐操作顺序
1. 首先尝试重新部署云函数
2. 检查网络连接和环境配置
3. 如果问题持续，使用临时本地模拟方案
4. 在云函数问题解决后，移除本地模拟代码

## 📝 注意事项
- 本地模拟方案仅用于测试，不会同步到云端数据库
- 生产环境必须使用云函数确保数据一致性
- 定期检查云函数的运行状态和日志