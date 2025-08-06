# 陪伴天数和总经验值显示问题修复指南

## 问题描述
用户反馈陪伴天数和总经验值在宠物主页面无法正常显示，显示为 0 或 undefined。

## 已修复的问题

### 1. 字段名不匹配问题
**问题**：云函数中计算陪伴天数时使用了错误的字段名
```javascript
// 修复前（错误）
const companionDays = calculateCompanionDays(pet.created_time || pet._createTime);

// 修复后（正确）
const companionDays = calculateCompanionDays(pet.created_at || pet._createTime);
```

### 2. 前端调试信息增强
在 `home.js` 中添加了详细的调试日志，帮助排查数据传递问题：
```javascript
console.log('🔍 检查返回数据中的关键字段:', {
  companionDays: res.result.data?.companionDays,
  totalExp: res.result.data?.totalExp,
  created_at: res.result.data?.created_at,
  _createTime: res.result.data?._createTime
});
```

## 部署步骤

### 方法一：使用部署脚本
```bash
# 在项目根目录运行
bash deploy-petManager.sh
```

### 方法二：手动部署
1. 打开微信开发者工具
2. 进入云开发控制台
3. 选择云函数标签页
4. 右键点击 `petManager` 云函数
5. 选择「上传并部署：云端安装依赖」

## 验证步骤

### 1. 检查云函数部署
- 确认 `petManager` 云函数已成功部署
- 版本时间应该是最新的

### 2. 检查前端日志
1. 在微信开发者工具中打开项目
2. 进入宠物主页面
3. 打开调试器控制台
4. 查找包含 "🔍 检查返回数据中的关键字段" 的日志
5. 确认 `companionDays` 和 `totalExp` 不为 undefined

### 3. 检查数据库
确认以下数据存在：
- `pets` 集合中有用户的宠物记录
- 宠物记录包含 `created_at` 字段
- `task_records` 集合中有已完成的任务记录

## 预期结果

### 陪伴天数计算
```javascript
// 计算公式
const now = new Date();
const created = new Date(createTime);
const timeDiff = now.getTime() - created.getTime();
const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
return Math.max(daysDiff, 0);
```

### 总经验值计算
```javascript
// 从 task_records 集合统计
const taskRecords = await db.collection('task_records')
  .where({
    user_id: userId,
    status: 'completed'
  })
  .get();

let totalExp = 0;
taskRecords.data.forEach(record => {
  if (record.task_info && record.task_info.reward_exp) {
    totalExp += record.task_info.reward_exp;
  }
});
```

## 故障排除

### 如果陪伴天数仍为 0
1. 检查宠物记录的 `created_at` 字段是否存在
2. 确认字段值是有效的日期格式
3. 检查 `calculateCompanionDays` 函数是否正确执行

### 如果总经验值仍为 0
1. 检查 `task_records` 集合是否有数据
2. 确认任务记录的状态为 'completed'
3. 检查任务记录中是否包含 `task_info.reward_exp` 字段

### 如果前端仍显示 0
1. 确认云函数返回的数据结构正确
2. 检查前端 `updatePetDisplay` 函数中的数据绑定
3. 确认 WXML 中的数据绑定语法正确

## 联系支持
如果按照以上步骤仍无法解决问题，请提供：
1. 微信开发者工具控制台的完整日志
2. 云函数调用的返回结果
3. 数据库中相关记录的截图

---

**最后更新时间**：2024年12月19日
**修复版本**：v1.1.0