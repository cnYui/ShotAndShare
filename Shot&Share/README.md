# Shot&Share - 智能朋友圈文案生成小程序

一个基于微信小程序和云开发的智能文案生成工具，帮助用户为图片生成个性化的朋友圈文案。

## 功能特性

### 🎨 多样化文案风格
- **文艺治愈** - 温暖治愈，富有诗意
- **幽默搞笑** - 轻松幽默，引人发笑
- **励志正能量** - 积极向上，充满力量
- **浪漫温馨** - 甜蜜浪漫，温暖人心
- **哲理深度** - 深度思考，富有哲理
- **日常生活** - 贴近生活，真实自然
- **旅行记录** - 记录旅途美好，分享见闻
- **美食分享** - 诱人美食，味蕾享受
- **时尚潮流** - 展现个性，引领潮流
- **运动健身** - 健康生活，活力满满
- **职场励志** - 工作感悟，职场正能量
- **友情岁月** - 珍贵友谊，温暖陪伴
- **家庭温馨** - 家的温暖，亲情无价
- **自然风光** - 大自然之美，心灵净化

### 📱 核心功能
- **智能文案生成** - 基于AI技术，为图片生成个性化文案
- **多图片支持** - 支持最多9张图片同时生成文案
- **历史记录** - 保存生成历史，支持筛选和排序
- **一键复制分享** - 快速复制文案到剪贴板
- **用户登录** - 微信授权登录，个人数据同步

## 技术栈

- **前端**: 微信小程序原生开发
- **后端**: 微信云开发
- **数据库**: 云数据库
- **AI服务**: 通义千问 Qwen-Omni API
- **存储**: 云存储

## 项目结构

```
Shot&Share/
├── miniprogram/              # 小程序前端代码
│   ├── pages/                # 页面文件
│   │   ├── index/           # 首页
│   │   ├── generate/        # 文案生成页
│   │   ├── history/         # 历史记录页
│   │   ├── preview/         # 预览页
│   │   └── profile/         # 个人中心页
│   ├── components/          # 组件
│   ├── images/             # 图片资源
│   ├── app.js              # 小程序入口
│   ├── app.json            # 小程序配置
│   └── app.wxss            # 全局样式
├── cloudfunctions/          # 云函数
│   ├── generateCopywriting/ # 文案生成云函数
│   ├── initDatabase/       # 数据库初始化
│   ├── login/              # 登录云函数
│   └── uploadImage/        # 图片上传云函数
└── project.config.json     # 项目配置
```

## 快速开始

### 环境要求
- 微信开发者工具
- Node.js 14+
- 微信小程序账号
- 微信云开发环境

### 安装部署

1. **克隆项目**
   ```bash
   git clone https://github.com/cnYui/ShotAndShare.git
   cd ShotAndShare
   ```

2. **配置小程序**
   - 在微信开发者工具中导入项目
   - 修改 `project.config.json` 中的 `appid`
   - 开通云开发环境

3. **部署云函数**
   - 右键点击 `cloudfunctions` 文件夹
   - 选择"上传并部署：云端安装依赖"
   - 依次部署所有云函数

4. **初始化数据库**
   - 调用 `initDatabase` 云函数初始化数据库集合

5. **配置API密钥**
   - 在 `generateCopywriting/index.js` 中配置通义千问API密钥

## 数据库设计

### copywriting_records 集合
存储用户生成的文案记录
```javascript
{
  _id: String,
  userId: String,        // 用户ID
  imageUrls: Array,      // 图片URL数组
  description: String,   // 用户描述
  style: String,         // 文案风格
  copywritings: Array,   // 生成的文案数组
  tags: Array,          // 标签
  createTime: Date,     // 创建时间
  updateTime: Date      // 更新时间
}
```

### user_stats 集合
存储用户统计信息
```javascript
{
  _id: String,
  userId: String,           // 用户ID
  totalGenerations: Number, // 总生成次数
  totalCopies: Number,      // 总复制次数
  totalShares: Number,      // 总分享次数
  createTime: Date,         // 创建时间
  updateTime: Date          // 更新时间
}
```

## 页面说明

### 首页 (index)
- 展示小程序介绍和主要功能
- 快速导航到文案生成页面

### 文案生成页 (generate)
- 图片选择和上传
- 文案风格选择
- 文案生成和结果展示
- 复制、保存、分享功能

### 历史记录页 (history)
- 查看历史生成记录
- 按风格筛选
- 按时间排序
- 删除记录功能

### 个人中心页 (profile)
- 用户登录/登出
- 个人统计信息
- 设置和帮助

## 配置说明

### API配置
在 `cloudfunctions/generateCopywriting/index.js` 中配置：
```javascript
const QWEN_API_KEY = 'your-api-key'
const QWEN_BASE_URL = 'https://dashscope.aliyuncs.com'
```

### 云环境配置
在 `miniprogram/app.js` 中配置：
```javascript
cloud.init({
  env: 'your-env-id'
})
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目链接: [https://github.com/cnYui/ShotAndShare](https://github.com/cnYui/ShotAndShare)
- 问题反馈: [Issues](https://github.com/cnYui/ShotAndShare/issues)

## 致谢

- 感谢微信小程序团队提供的开发平台
- 感谢阿里云通义千问提供的AI服务
- 感谢所有贡献者的支持

---

**Shot&Share** - 让每一张图片都有属于它的故事 📸✨