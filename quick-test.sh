#!/bin/bash

# 健康养宠小程序快速部署和测试脚本

echo "🚀 健康养宠小程序后端快速部署和测试"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -f "project.config.json" ]; then
    echo -e "${RED}❌ 错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 检查微信开发者工具CLI
echo -e "${BLUE}🔍 检查微信开发者工具CLI...${NC}"
if ! command -v wx &> /dev/null; then
    echo -e "${RED}❌ 未找到微信开发者工具CLI${NC}"
    echo -e "${YELLOW}请先安装微信开发者工具并配置CLI工具${NC}"
    echo -e "${YELLOW}参考：https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 微信开发者工具CLI已安装${NC}"

# 检查云开发环境
echo -e "${BLUE}🔍 检查云开发环境配置...${NC}"
if [ ! -f "project.private.config.json" ]; then
    echo -e "${YELLOW}⚠️  未找到 project.private.config.json 文件${NC}"
    echo -e "${YELLOW}请确保已在微信开发者工具中配置云开发环境${NC}"
fi

# 安装云函数依赖
echo -e "${BLUE}📦 安装云函数依赖...${NC}"
CLOUD_FUNCTIONS=("login" "petChat" "initDatabase" "taskManager" "healthDataManager" "petManager" "quickstartFunctions")

for func in "${CLOUD_FUNCTIONS[@]}"; do
    if [ -d "cloudfunctions/$func" ]; then
        echo -e "${BLUE}  📦 安装 $func 依赖...${NC}"
        cd "cloudfunctions/$func"
        if [ -f "package.json" ]; then
            npm install --silent
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}    ✅ $func 依赖安装成功${NC}"
            else
                echo -e "${RED}    ❌ $func 依赖安装失败${NC}"
            fi
        else
            echo -e "${YELLOW}    ⚠️  $func 无 package.json 文件${NC}"
        fi
        cd "../.."
    else
        echo -e "${RED}    ❌ 云函数目录 $func 不存在${NC}"
    fi
done

# 部署云函数
echo -e "${BLUE}🚀 部署云函数...${NC}"
echo -e "${YELLOW}注意：请确保微信开发者工具已打开项目并登录${NC}"

read -p "是否继续部署云函数？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  部署已取消${NC}"
    exit 0
fi

for func in "${CLOUD_FUNCTIONS[@]}"; do
    echo -e "${BLUE}  🚀 部署云函数: $func${NC}"
    wx cloud functions deploy "$func" --env-version latest
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}    ✅ $func 部署成功${NC}"
    else
        echo -e "${RED}    ❌ $func 部署失败${NC}"
        echo -e "${YELLOW}    请检查微信开发者工具是否正常运行${NC}"
    fi
    echo
done

# 初始化数据库
echo -e "${BLUE}🗄️  初始化数据库...${NC}"
echo -e "${YELLOW}正在调用 initDatabase 云函数...${NC}"

# 这里需要通过微信开发者工具来调用，脚本无法直接调用
echo -e "${YELLOW}⚠️  请手动在微信开发者工具中执行以下步骤：${NC}"
echo -e "${YELLOW}1. 打开云开发控制台${NC}"
echo -e "${YELLOW}2. 找到 initDatabase 云函数${NC}"
echo -e "${YELLOW}3. 点击'测试'按钮执行初始化${NC}"
echo

# 提供测试指导
echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${BLUE}📋 接下来的测试步骤：${NC}"
echo
echo -e "${GREEN}方法一：使用小程序测试页面${NC}"
echo -e "${YELLOW}1. 在微信开发者工具中预览小程序${NC}"
echo -e "${YELLOW}2. 访问测试页面：pages/test/test${NC}"
echo -e "${YELLOW}3. 点击'开始完整测试'按钮${NC}"
echo
echo -e "${GREEN}方法二：手动测试云函数${NC}"
echo -e "${YELLOW}1. 在云开发控制台中逐个测试云函数${NC}"
echo -e "${YELLOW}2. 查看数据库中是否创建了相应集合${NC}"
echo -e "${YELLOW}3. 验证数据是否正确存储${NC}"
echo
echo -e "${GREEN}方法三：查看详细测试指南${NC}"
echo -e "${YELLOW}查看文件：doc/后端测试指南.md${NC}"
echo

# 显示数据库集合信息
echo -e "${BLUE}📊 预期创建的数据库集合：${NC}"
echo -e "${GREEN}  ✓ pet_users     - 用户信息表${NC}"
echo -e "${GREEN}  ✓ pets         - 宠物信息表${NC}"
echo -e "${GREEN}  ✓ tasks        - 任务定义表（包含8个默认任务）${NC}"
echo -e "${GREEN}  ✓ task_records - 任务记录表${NC}"
echo -e "${GREEN}  ✓ health_data  - 健康数据表${NC}"
echo -e "${GREEN}  ✓ chat_context - 聊天上下文表${NC}"
echo

# 显示重要提醒
echo -e "${RED}⚠️  重要提醒：${NC}"
echo -e "${YELLOW}1. 确保 .env 文件中配置了正确的 DEEPSEEK_API_KEY${NC}"
echo -e "${YELLOW}2. 检查云开发环境的网络配置和权限设置${NC}"
echo -e "${YELLOW}3. 如果测试失败，请查看云函数运行日志${NC}"
echo -e "${YELLOW}4. 测试数据会保存在云数据库中，正式发布前请清理${NC}"
echo

echo -e "${GREEN}🎯 部署脚本执行完成！${NC}"
echo -e "${BLUE}如有问题，请查看 doc/后端测试指南.md 获取详细帮助${NC}"