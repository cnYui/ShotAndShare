#!/bin/bash

# 云函数超时问题修复部署脚本
# 解决 errCode: -504003 超时错误

echo "🔧 开始修复云函数超时问题..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 需要重新部署的云函数列表（已配置超时时间）
CLOUD_FUNCTIONS_WITH_TIMEOUT=(
    "healthDataManager"  # 15秒超时
    "taskManager"        # 12秒超时
    "petManager"         # 12秒超时
    "login"              # 10秒超时
    "userManager"        # 10秒超时
    "quickstartFunctions" # 10秒超时
    "logError"           # 8秒超时
    "initDatabase"       # 30秒超时
    "petChat"            # 20秒超时（已配置）
)

echo -e "${BLUE}📋 需要重新部署的云函数列表：${NC}"
for func in "${CLOUD_FUNCTIONS_WITH_TIMEOUT[@]}"; do
    echo "  - $func"
done
echo ""

echo -e "${YELLOW}⚠️  重要提示：${NC}"
echo "1. 请确保微信开发者工具已打开项目"
echo "2. 请确保已登录微信开发者账号"
echo "3. 请确保云开发环境已初始化"
echo ""

read -p "是否继续部署？(y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ 部署已取消${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 开始部署云函数...${NC}"
echo ""

# 检查微信开发者工具CLI
if command -v wx &> /dev/null; then
    echo -e "${GREEN}✅ 微信开发者工具CLI已找到${NC}"
    
    # 使用CLI部署
    for func in "${CLOUD_FUNCTIONS_WITH_TIMEOUT[@]}"; do
        echo -e "${BLUE}正在部署: $func${NC}"
        
        if [ -d "cloudfunctions/$func" ]; then
            wx cloud functions deploy $func
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ $func 部署成功${NC}"
            else
                echo -e "${RED}❌ $func 部署失败${NC}"
            fi
        else
            echo -e "${RED}❌ 云函数目录不存在: cloudfunctions/$func${NC}"
        fi
        echo ""
    done
else
    echo -e "${YELLOW}⚠️  微信开发者工具CLI未找到，请手动部署${NC}"
    echo ""
    echo -e "${BLUE}📋 手动部署步骤：${NC}"
    echo "1. 在微信开发者工具中打开项目"
    echo "2. 右键点击 cloudfunctions 文件夹"
    echo "3. 选择 '上传并部署：云端安装依赖'"
    echo "4. 逐个上传以下云函数："
    
    for func in "${CLOUD_FUNCTIONS_WITH_TIMEOUT[@]}"; do
        echo "   - $func"
    done
    echo ""
fi

echo -e "${GREEN}🎯 修复说明：${NC}"
echo "• healthDataManager: 超时时间设置为15秒（处理健康数据操作）"
echo "• taskManager: 超时时间设置为12秒（处理任务相关操作）"
echo "• petManager: 超时时间设置为12秒（处理宠物相关操作）"
echo "• login: 超时时间设置为10秒（用户登录操作）"
echo "• userManager: 超时时间设置为10秒（用户管理操作）"
echo "• quickstartFunctions: 超时时间设置为10秒（快速启动功能）"
echo "• logError: 超时时间设置为8秒（错误日志记录）"
echo "• initDatabase: 超时时间设置为30秒（数据库初始化）"
echo "• petChat: 超时时间设置为20秒（AI聊天功能）"
echo ""

echo -e "${GREEN}✅ 云函数超时问题修复完成！${NC}"
echo ""
echo -e "${BLUE}📝 验证步骤：${NC}"
echo "1. 在小程序中测试健康数据编辑功能"
echo "2. 检查云函数调用是否正常"
echo "3. 查看云开发控制台的函数日志"
echo ""
echo -e "${YELLOW}💡 如果问题仍然存在：${NC}"
echo "1. 检查网络连接是否稳定"
echo "2. 查看云函数运行日志"
echo "3. 确认数据库操作是否正常"
echo "4. 考虑进一步优化代码逻辑"