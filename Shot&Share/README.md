# Shot&Share - 智能朋友圈配文助手

一个基于微信小程序的智能配文生成工具，使用Qwen-Omni多模态AI模型，帮助用户为图片生成个性化的朋友圈文案。

## 功能特色

### 🎨 智能配文生成
- 支持多种文案风格：文艺治愈、幽默搞笑、励志正能量、浪漫温馨、哲理深度、日常生活
- 基于Qwen-Omni多模态AI模型，理解图片内容并生成相应文案
- 支持用户自定义描述，提升文案个性化程度

### 📱 完整的小程序体验
- **首页**：功能介绍、快速入口、用户统计展示
- **创作页面**：图片上传、风格选择、文案生成
- **历史记录**：查看、管理、筛选历史文案
- **个人中心**：用户信息、统计数据、偏好设置
- **预览页面**：文案详情展示、操作管理

### ☁️ 云端服务
- 微信云开发支持，无需自建服务器
- 云存储管理图片文件
- 云数据库存储用户数据和文案记录
- 云函数处理AI接口调用

## 技术架构

### 前端技术
- **框架**：微信小程序原生开发
- **样式**：WXSS + 响应式设计
- **状态管理**：页面级数据管理
- **组件化**：模块化页面结构

### 后端服务
- **云开发**：微信云开发平台
- **数据库**：云数据库（NoSQL）
- **存储**：云存储服务
- **函数**：云函数（Node.js）

### AI服务
- **模型**：阿里云Qwen-Omni多模态大模型
- **能力**：图像理解 + 文本生成
- **接口**：OpenAI兼容API

## 项目结构

```
Shot&Share/
├── miniprogram/                 # 小程序前端代码
│   ├── pages/                   # 页面文件
│   │   ├── index/              # 首页
│   │   ├── generate/           # 文案生成页
│   │   ├── history/            # 历史记录页
│   │   ├── profile/            # 个人中心页
│   │   └── preview/            # 预览页
│   ├── app.js                  # 小程序入口文件
│   ├── app.json               # 小程序配置文件
│   └── app.wxss               # 全局样式文件
├── cloudfunctions/             # 云函数代码
│   ├── login/                 # 用户登录函数
│   ├── generateCopywriting/   # 文案生成函数
│   └── uploadImage/           # 图片上传函数
└── .trae/documents/           # 项目文档
    ├── 产品需求文档.md
    └── 技术架构文档.md
```

## 快速开始

### 环境要求
- 微信开发者工具
- 微信小程序账号
- 微信云开发环境
- 阿里云Qwen-Omni API密钥

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd Shot&Share
   ```

2. **配置云开发**
   - 在微信开发者工具中打开项目
   - 开通云开发服务
   - 创建云开发环境
   - 记录环境ID

3. **配置API密钥**
   - 在 `cloudfunctions/generateCopywriting/config.json` 中配置Qwen-Omni API密钥
   - 确保API密钥有效且有足够的调用额度

4. **部署云函数**
   ```bash
   # 在微信开发者工具中
   # 右键点击各个云函数文件夹
   # 选择"上传并部署：云端安装依赖"
   ```

5. **配置数据库**
   - 在云开发控制台创建以下集合：
     - `users` - 用户信息
     - `copywriting_records` - 文案记录
     - `upload_records` - 上传记录

6. **运行项目**
   - 在微信开发者工具中编译运行
   - 在真机上预览测试

## 核心功能说明

### 文案生成流程
1. 用户选择或拍摄图片
2. 选择文案风格（可选添加描述）
3. 图片上传到云存储
4. 调用Qwen-Omni API分析图片并生成文案
5. 返回生成结果并保存到数据库
6. 用户可复制、保存、分享文案

### 数据库设计

#### users 集合
```javascript
{
  _id: "用户openid",
  nickName: "用户昵称",
  avatarUrl: "头像URL",
  stats: {
    generatedCount: 0,  // 生成次数
    savedCount: 0,      // 保存次数
    sharedCount: 0      // 分享次数
  },
  preferences: {
    defaultStyle: "literary",  // 默认风格
    autoSave: true             // 自动保存
  },
  createdAt: Date,
  lastActiveAt: Date
}
```

#### copywriting_records 集合
```javascript
{
  _id: "记录ID",
  userId: "用户openid",
  imageUrl: "图片URL",
  description: "用户描述",
  style: "文案风格",
  styleName: "风格名称",
  content: "生成的文案内容",
  tags: ["标签1", "标签2"],
  saved: false,
  shared: false,
  createdAt: Date,
  savedAt: Date,
  sharedAt: Date
}
```

## API接口说明

### 云函数接口

#### generateCopywriting
生成文案的核心函数

**输入参数：**
```javascript
{
  imageUrl: "图片URL",
  description: "用户描述（可选）",
  style: "文案风格",
  userId: "用户ID"
}
```

**返回结果：**
```javascript
{
  success: true,
  data: {
    recordId: "记录ID",
    content: "生成的文案",
    style: "风格名称",
    tags: ["标签数组"],
    createdAt: "创建时间"
  }
}
```

#### uploadImage
图片上传函数

**输入参数：**
```javascript
{
  fileBuffer: "base64编码的文件内容",
  fileName: "文件名",
  userId: "用户ID"
}
```

**返回结果：**
```javascript
{
  success: true,
  data: {
    fileId: "云存储文件ID",
    tempUrl: "临时访问URL",
    cloudPath: "云存储路径"
  }
}
```

## 部署说明

### 开发环境
1. 使用微信开发者工具本地调试
2. 配置云开发测试环境
3. 使用模拟器和真机测试

### 生产环境
1. 申请小程序发布权限
2. 配置生产云开发环境
3. 上传代码并提交审核
4. 发布上线

## 注意事项

### API使用
- Qwen-Omni API有调用频率限制，注意控制请求频率
- 图片大小限制为10MB，建议压缩后上传
- API密钥需要妥善保管，不要泄露

### 小程序限制
- 云存储有容量限制，定期清理无用文件
- 云函数有执行时间限制，优化代码性能
- 小程序包大小有限制，合理组织代码结构

### 用户体验
- 网络请求添加加载提示
- 错误处理要友好明确
- 支持离线查看历史记录

## 开发团队

- **产品设计**：基于用户需求的功能设计
- **前端开发**：微信小程序原生开发
- **后端开发**：云函数 + 云数据库
- **AI集成**：Qwen-Omni多模态模型

## 版本历史

### v1.0.0 (当前版本)
- ✅ 基础功能完整实现
- ✅ 多风格文案生成
- ✅ 图片上传和管理
- ✅ 用户数据统计
- ✅ 历史记录管理

### 后续规划
- 🔄 文案模板功能
- 🔄 批量生成支持
- 🔄 社交分享优化
- 🔄 个性化推荐

## 许可证

MIT License - 详见 LICENSE 文件

## 联系我们

如有问题或建议，欢迎通过以下方式联系：
- 项目Issues
- 邮箱联系
- 微信群讨论

---

**Shot&Share** - 让每张图片都有属于它的故事 ✨