#!/bin/bash

# 健康养宠小程序云函数部署脚本

echo "开始部署云函数..."

# 设置微信开发者工具CLI路径
WX_CLI="/Applications/wechatwebdevtools.app/Contents/MacOS/cli"

# 检查微信开发者工具CLI是否存在
if [ ! -f "$WX_CLI" ]; then
    echo "错误：未找到微信开发者工具CLI，请检查安装路径"
    exit 1
fi

# 云函数列表
CLOUD_FUNCTIONS=(
    "login"
    "petChat"
    "initDatabase"
    "taskManager"
    "healthDataManager"
    "petManager"
    "quickstartFunctions"
    "userManager"
    "analytics"
    "logError"
)

# 部署每个云函数
for func in "${CLOUD_FUNCTIONS[@]}"; do
    echo "正在部署云函数: $func"
    
    # 进入云函数目录
    cd "cloudfunctions/$func"
    
    # 安装依赖
    if [ -f "package.json" ]; then
        echo "安装 $func 的依赖..."
        npm install
    fi
    
    # 返回项目根目录
    cd "../.."
    
    # 上传云函数
    echo "上传云函数 $func..."
    "$WX_CLI" cloud functions deploy "$func" --project "/Users/wujianxiang/WeChatProjects/healthypetcompanion" --env "cloud1-6g4qsd2kcddd1be0"
    
    if [ $? -eq 0 ]; then
        echo "✅ $func 部署成功"
    else
        echo "❌ $func 部署失败"
    fi
    
    echo "---"
done

echo "所有云函数部署完成！"
echo ""
echo "接下来请执行以下步骤："
echo "1. 在微信开发者工具中打开项目"
echo "2. 调用 initDatabase 云函数初始化数据库"
echo "3. 测试各个云函数是否正常工作"
echo ""
echo "云函数列表："
for func in "${CLOUD_FUNCTIONS[@]}"; do
    echo "  - $func"
done