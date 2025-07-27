#!/bin/bash

# 部署petChat云函数

echo "开始部署petChat云函数..."

# 设置微信开发者工具CLI路径
WX_CLI="/Applications/wechatwebdevtools.app/Contents/MacOS/cli"

# 检查微信开发者工具CLI是否存在
if [ ! -f "$WX_CLI" ]; then
    echo "错误：未找到微信开发者工具CLI，请检查安装路径"
    echo "请确保微信开发者工具已安装并启用服务端口"
    exit 1
fi

# 进入petChat云函数目录
echo "进入petChat目录..."
cd cloudfunctions/petChat

# 安装依赖
echo "安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

# 返回项目根目录
cd ../..

# 上传云函数
echo "上传petChat云函数..."
"$WX_CLI" cloud functions deploy --env "cloud1-6g4qsd2kcddd1be0" --names petChat --project "/Users/wujianxiang/WeChatProjects/healthypetcompanion"

if [ $? -eq 0 ]; then
    echo "✅ petChat云函数部署成功！"
    echo ""
    echo "配置信息："
    echo "- 超时时间：20秒"
    echo "- 内存大小：256MB"
    echo "- 运行时：Nodejs16.13"
    echo "- DeepSeek API：已配置"
    echo ""
    echo "现在可以在小程序中测试宠物聊天功能了！"
else
    echo "❌ petChat云函数部署失败"
    echo "请检查："
    echo "1. 微信开发者工具是否已打开项目"
    echo "2. 是否已登录微信开发者账号"
    echo "3. 云开发环境是否正确"
    exit 1
fi