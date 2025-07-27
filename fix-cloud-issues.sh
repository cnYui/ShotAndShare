#!/bin/bash

# 健康宠物伴侣小程序 - 云函数问题修复脚本

echo "🔧 开始修复云函数和数据库问题..."
echo ""

# 设置项目路径
PROJECT_PATH="/Users/wujianxiang/WeChatProjects/healthypetcompanion"
cd "$PROJECT_PATH"

echo "📍 当前工作目录: $(pwd)"
echo ""

# 检查必要的云函数是否存在
echo "📋 检查云函数文件..."
CLOUD_FUNCTIONS=("userManager" "analytics" "logError" "login" "petManager" "taskManager" "initDatabase")

for func in "${CLOUD_FUNCTIONS[@]}"; do
    if [ -d "cloudfunctions/$func" ]; then
        echo "✅ $func - 文件存在"
    else
        echo "❌ $func - 文件缺失"
    fi
done
echo ""

# 检查package.json文件
echo "📦 检查云函数依赖..."
for func in "${CLOUD_FUNCTIONS[@]}"; do
    if [ -f "cloudfunctions/$func/package.json" ]; then
        echo "✅ $func/package.json - 存在"
    else
        echo "❌ $func/package.json - 缺失"
    fi
done
echo ""

# 安装云函数依赖
echo "📥 安装云函数依赖..."
for func in "${CLOUD_FUNCTIONS[@]}"; do
    if [ -d "cloudfunctions/$func" ] && [ -f "cloudfunctions/$func/package.json" ]; then
        echo "正在安装 $func 的依赖..."
        cd "cloudfunctions/$func"
        npm install --silent
        cd "../.."
        echo "✅ $func 依赖安装完成"
    fi
done
echo ""

# 检查微信开发者工具CLI
WX_CLI="/Applications/wechatwebdevtools.app/Contents/MacOS/cli"
if [ -f "$WX_CLI" ]; then
    echo "✅ 微信开发者工具CLI已找到"
else
    echo "❌ 微信开发者工具CLI未找到"
    echo "请确保已安装微信开发者工具，并且路径正确"
fi
echo ""

# 显示解决方案
echo "🛠️  问题解决方案:"
echo ""
echo "1. 云函数部署问题:"
echo "   - 在微信开发者工具中打开项目"
echo "   - 右键点击cloudfunctions文件夹"
echo "   - 选择'上传并部署：云端安装依赖'"
echo "   - 逐个上传所有云函数"
echo ""
echo "2. 数据库初始化:"
echo "   - 在微信开发者工具控制台中执行:"
echo "     wx.cloud.callFunction({"
echo "       name: 'initDatabase',"
echo "       success: res => console.log(res),"
echo "       fail: err => console.error(err)"
echo "     });"
echo ""
echo "3. 用户数据问题:"
echo "   - pet_users集合为空是正常的"
echo "   - 用户数据在首次登录时自动创建"
echo "   - 确保login云函数正常工作"
echo ""
echo "4. 测试云函数:"
echo "   - 打开 test-cloud-functions.html 查看详细测试步骤"
echo "   - 在微信开发者工具中测试各个云函数"
echo ""
echo "5. 检查云开发环境:"
echo "   - 确认环境ID: cloud1-6g4qsd2kcddd1be0"
echo "   - 检查project.config.json配置"
echo "   - 确保云开发服务已开通"
echo ""
echo "🎯 关键步骤:"
echo "1. 在微信开发者工具中手动上传云函数"
echo "2. 调用initDatabase初始化数据库"
echo "3. 进行完整的用户登录流程"
echo "4. 检查数据库中的用户记录"
echo ""
echo "📞 如果问题仍然存在:"
echo "1. 检查微信开发者工具的云开发控制台"
echo "2. 查看云函数日志"
echo "3. 确认网络连接正常"
echo "4. 重启微信开发者工具"
echo ""
echo "✨ 修复脚本执行完成！"
echo "请按照上述步骤在微信开发者工具中进行操作。"