# 任务页面文字消失问题修复

## 问题描述
用户反映任务页面有部分文字消失了。

## 问题原因
1. 国际化文件中缺少 `todayCompleted`、`weeklyCompleted`、`totalExp` 等字段
2. 任务分类缺少 `exercise`、`diet`、`sleep` 等字段
3. JavaScript代码中的 `categoryNames` 使用硬编码中文，没有使用国际化文本

## 修复内容
1. 在所有语言包（zh-cn.js, en.js, zh-tw.js）中添加了缺失的字段：
   - `todayCompleted`: 今日完成
   - `weeklyCompleted`: 本周完成  
   - `totalExp`: 总经验
   - `exercise`: 运动
   - `diet`: 饮食
   - `sleep`: 睡眠

2. 修改了 tasks.js 中的代码：
   - 将硬编码的 `categoryNames` 改为使用国际化文本
   - 修改 `getCategoryText` 方法使用国际化文本
   - 在 `loadTexts` 方法中动态设置 `categoryNames`

## 测试建议
请在微信开发者工具中打开项目，导航到任务页面，检查：
1. 顶部统计区域的文字是否正常显示
2. 任务分类标签是否完整显示
3. 切换不同语言时文字是否正确显示