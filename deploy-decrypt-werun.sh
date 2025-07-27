#!/bin/bash

# 部署解密微信运动数据云函数脚本

echo "开始部署解密微信运动数据云函数..."

# 进入云函数目录
cd cloudfunctions/decryptWeRunData

# 安装依赖
echo "安装云函数依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

# 返回项目根目录
cd ../..

# 部署云函数
echo "部署云函数到云端..."
npx @cloudbase/cli functions:deploy decryptWeRunData

if [ $? -eq 0 ]; then
    echo "✅ 解密微信运动数据云函数部署成功！"
    echo "📊 功能说明："
    echo "   - 解密微信运动数据"
    echo "   - 获取用户今日步数"
    echo "   - 获取用户最近7天步数数据"
    echo "   - 自动保存到健康数据表"
    echo ""
    echo "🔧 使用方法："
    echo "   在小程序中调用 wx.cloud.callFunction({"
    echo "     name: 'decryptWeRunData',"
    echo "     data: { encryptedData, iv }"
    echo "   })"
else
    echo "❌ 云函数部署失败"
    exit 1
fi