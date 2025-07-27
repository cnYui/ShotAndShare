#!/bin/bash

# 部署 petManager 云函数脚本
# 使用方法：在项目根目录运行 bash deploy-petManager.sh

echo "🚀 开始部署 petManager 云函数..."

# 检查是否在正确的目录
if [ ! -d "cloudfunctions/petManager" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 进入云函数目录
cd cloudfunctions/petManager

echo "📦 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 返回项目根目录
cd ../..

echo "📤 准备上传云函数..."
echo "请在微信开发者工具中执行以下步骤："
echo "1. 打开微信开发者工具"
echo "2. 在工具栏中点击 '云开发'"
echo "3. 进入 '云函数' 标签页"
echo "4. 右键点击 'petManager' 云函数"
echo "5. 选择 '上传并部署：云端安装依赖'"
echo ""
echo "或者使用命令行（如果已配置）："
echo "npx @cloudbase/cli functions:deploy petManager"
echo ""
echo "🔍 部署完成后，请检查以下内容："
echo "- companionDays 字段是否正确计算（基于 created_at 字段）"
echo "- totalExp 字段是否正确统计（来自 task_records 集合）"
echo "- 前端页面是否正确显示这两个数值"

echo "✨ 脚本执行完成！"