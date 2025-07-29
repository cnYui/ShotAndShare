# 健康宠物伴侣小程序 🐾

一个基于微信小程序的智能宠物健康管理平台，集虚拟宠物养成、健康数据管理、AI智能咨询于一体。

[![Powered by CloudBase](https://7463-tcb-advanced-a656fc-1257967285.tcb.qcloud.la/mcp/powered-by-cloudbase-badge.svg)](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit)

## 📱 项目简介

健康宠物伴侣是一款创新的微信小程序，旨在为宠物主人提供全方位的宠物健康管理服务。通过虚拟宠物养成系统，用户可以在照顾虚拟宠物的过程中学习宠物护理知识，同时记录和管理真实宠物的健康数据。

## ✨ 核心功能

### 🎮 虚拟宠物系统
- **宠物养成**: 喂食、清洁、玩耍等互动功能
- **成长系统**: 宠物等级、经验值、属性成长
- **个性化**: 多种宠物类型和外观定制
- **情感互动**: 宠物情绪状态和反馈系统

### 📊 健康数据管理
- **体重记录**: 定期体重监测和趋势分析
- **疫苗管理**: 疫苗接种提醒和记录
- **医疗档案**: 就诊记录和病历管理
- **健康报告**: 数据可视化和健康评估

### 🤖 AI智能咨询
- **智能问答**: 基于AI的宠物健康咨询
- **症状分析**: 宠物异常行为和症状解读
- **护理建议**: 个性化的宠物护理指导
- **紧急处理**: 宠物急救知识和应急指南

### 🌐 社交功能
- **宠物社区**: 用户交流和经验分享
- **照片分享**: 宠物照片展示和点赞
- **专家咨询**: 在线兽医咨询服务
- **活动推荐**: 本地宠物活动和服务推荐

## 🛠 技术栈

### 前端技术
- **微信小程序**: 原生小程序开发框架
- **JavaScript**: ES6+ 语法
- **WXSS**: 微信小程序样式语言
- **Canvas**: 图表绘制和数据可视化

### 后端技术
- **腾讯云开发**: 云函数 + 云数据库 + 云存储
- **Node.js**: 云函数运行环境
- **MongoDB**: 云数据库存储
- **AI服务**: 腾讯云AI接口集成

### 开发工具
- **微信开发者工具**: 小程序开发和调试
- **CloudBase AI ToolKit**: AI辅助开发工具
- **Git**: 版本控制
- **ESLint**: 代码规范检查

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0.0
- 微信开发者工具
- 腾讯云账号（用于云开发）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/cnYui/healthy-pet-companion.git
cd healthy-pet-companion
```

2. **安装依赖**
```bash
npm install
```

3. **配置云开发**
- 在微信开发者工具中打开项目
- 配置云开发环境ID
- 部署云函数和数据库

4. **启动项目**
- 在微信开发者工具中编译运行
- 或使用真机预览功能

### 配置说明

1. **修改云开发环境ID**
```javascript
// miniprogram/app.js
wx.cloud.init({
  env: 'your-env-id' // 替换为你的云开发环境ID
})
```

2. **部署云函数**
```bash
# 部署所有云函数
npm run deploy:functions

# 或单独部署
npm run deploy:petchat
```

## 📁 项目结构

```
healthy-pet-companion/
├── miniprogram/              # 小程序前端代码
│   ├── pages/               # 页面文件
│   │   ├── index/          # 首页
│   │   ├── pet/            # 虚拟宠物
│   │   ├── health/         # 健康管理
│   │   ├── chat/           # AI咨询
│   │   └── profile/        # 个人中心
│   ├── components/         # 自定义组件
│   ├── utils/              # 工具函数
│   ├── images/             # 图片资源
│   └── i18n/               # 国际化文件
├── cloudfunctions/          # 云函数
│   ├── petchat/            # AI聊天功能
│   ├── health/             # 健康数据处理
│   └── user/               # 用户管理
├── doc/                     # 项目文档
├── rules/                   # 数据库安全规则
└── scripts/                 # 构建脚本
```

## 📖 功能文档

- [虚拟宠物系统实现详解](./doc/虚拟宠物系统实现详解.md)
- [AI聊天系统实现详解](./doc/AI聊天系统实现详解.md)
- [数据库设计与数据流](./doc/数据库设计与数据流.md)
- [云函数部署问题解决方案](./doc/云函数部署问题解决方案.md)

## 🎯 开发计划

- [ ] 增加更多宠物品种
- [ ] 实现宠物社交功能
- [ ] 添加宠物健康预警系统
- [ ] 集成更多AI服务
- [ ] 开发管理后台
- [ ] 支持多语言国际化

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [CloudBase AI ToolKit](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit) - AI辅助开发工具
- [腾讯云开发](https://cloud.tencent.com/product/tcb) - 云端一体化开发平台
- [微信小程序](https://developers.weixin.qq.com/miniprogram/dev/framework/) - 小程序开发框架

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/cnYui/healthy-pet-companion/issues)
- 发送邮件至项目维护者

---

**让科技为宠物健康护航，让爱心在数字世界延续！** 🐾❤️