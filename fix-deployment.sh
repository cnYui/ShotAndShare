#!/bin/bash

# 云函数部署问题修复脚本

echo "🔧 云函数部署问题修复工具"
echo "================================"

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

# 问题云函数列表
PROBLEM_FUNCTIONS=("healthDataManager")

echo -e "${YELLOW}检测到以下云函数可能存在部署冲突：${NC}"
for func in "${PROBLEM_FUNCTIONS[@]}"; do
    echo -e "${YELLOW}  - $func${NC}"
done
echo

echo -e "${BLUE}请选择解决方案：${NC}"
echo "1. 重命名云函数（推荐，安全）"
echo "2. 提供手动删除指导"
echo "3. 跳过问题云函数，部署其他"
echo "4. 退出"
echo

read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo -e "${BLUE}🔄 开始重命名云函数...${NC}"
        
        # 重命名 healthDataManager
        if [ -d "cloudfunctions/healthDataManager" ]; then
            echo -e "${BLUE}重命名 healthDataManager -> healthypet_healthDataManager${NC}"
            mv "cloudfunctions/healthDataManager" "cloudfunctions/healthypet_healthDataManager"
            
            # 更新 package.json
            if [ -f "cloudfunctions/healthypet_healthDataManager/package.json" ]; then
                sed -i '' 's/"healthDataManager"/"healthypet_healthDataManager"/g' "cloudfunctions/healthypet_healthDataManager/package.json"
                echo -e "${GREEN}✅ 已更新 package.json${NC}"
            fi
            
            echo -e "${GREEN}✅ 云函数重命名完成${NC}"
        else
            echo -e "${RED}❌ 未找到 healthDataManager 目录${NC}"
        fi
        
        # 创建新的部署脚本
        echo -e "${BLUE}📝 创建新的部署脚本...${NC}"
        cat > deploy-cloudfunctions-fixed.sh << 'EOF'
#!/bin/bash

# 修复后的云函数部署脚本

echo "开始部署云函数（修复版）..."

# 检查是否安装了微信开发者工具CLI
if ! command -v wx &> /dev/null; then
    echo "错误：未找到微信开发者工具CLI，请先安装并配置"
    exit 1
fi

# 修复后的云函数列表
CLOUD_FUNCTIONS=(
    "login"
    "petChat"
    "initDatabase"
    "taskManager"
    "healthypet_healthDataManager"
    "petManager"
    "quickstartFunctions"
)

# 部署每个云函数
for func in "${CLOUD_FUNCTIONS[@]}"; do
    echo "正在部署云函数: $func"
    
    # 检查目录是否存在
    if [ ! -d "cloudfunctions/$func" ]; then
        echo "⚠️  跳过不存在的云函数: $func"
        continue
    fi
    
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
    wx cloud functions deploy "$func"
    
    if [ $? -eq 0 ]; then
        echo "✅ $func 部署成功"
    else
        echo "❌ $func 部署失败"
        echo "请检查微信开发者工具是否正常运行"
    fi
    
    echo "---"
done

echo "所有云函数部署完成！"
echo ""
echo "重要提醒："
echo "1. healthDataManager 已重命名为 healthypet_healthDataManager"
echo "2. 请更新小程序代码中的云函数调用名称"
echo "3. 在测试页面中更新相应的函数名"
EOF
        
        chmod +x deploy-cloudfunctions-fixed.sh
        echo -e "${GREEN}✅ 已创建修复版部署脚本: deploy-cloudfunctions-fixed.sh${NC}"
        
        # 提示需要更新的文件
        echo -e "${YELLOW}⚠️  需要手动更新以下文件中的云函数调用：${NC}"
        echo -e "${YELLOW}  1. miniprogram/pages/test/test.js${NC}"
        echo -e "${YELLOW}  2. 其他调用 healthDataManager 的小程序页面${NC}"
        echo
        echo -e "${BLUE}查找需要更新的文件：${NC}"
        grep -r "healthDataManager" miniprogram/ 2>/dev/null | grep -v node_modules || echo "未找到需要更新的文件"
        
        echo
        echo -e "${GREEN}🚀 现在可以运行修复版部署脚本：${NC}"
        echo -e "${GREEN}./deploy-cloudfunctions-fixed.sh${NC}"
        ;;
        
    2)
        echo -e "${YELLOW}📋 手动删除云函数指导：${NC}"
        echo
        echo -e "${BLUE}步骤 1：打开微信开发者工具${NC}"
        echo "  - 确保项目已在微信开发者工具中打开"
        echo
        echo -e "${BLUE}步骤 2：进入云开发控制台${NC}"
        echo "  - 点击工具栏中的'云开发'按钮"
        echo "  - 选择当前使用的云开发环境"
        echo
        echo -e "${BLUE}步骤 3：删除冲突的云函数${NC}"
        echo "  - 点击左侧菜单中的'云函数'"
        echo "  - 找到 'healthDataManager' 云函数"
        echo "  - 点击右侧的'删除'按钮"
        echo "  - 确认删除操作"
        echo
        echo -e "${BLUE}步骤 4：重新部署${NC}"
        echo "  - 删除完成后，运行原部署脚本："
        echo -e "${GREEN}    ./deploy-cloudfunctions.sh${NC}"
        echo
        echo -e "${RED}⚠️  注意：删除云函数会丢失该函数的所有数据和配置${NC}"
        ;;
        
    3)
        echo -e "${BLUE}🚀 部署其他云函数...${NC}"
        
        # 安全的云函数列表（排除问题函数）
        SAFE_FUNCTIONS=("login" "petChat" "initDatabase" "taskManager" "petManager" "quickstartFunctions")
        
        for func in "${SAFE_FUNCTIONS[@]}"; do
            echo -e "${BLUE}正在部署云函数: $func${NC}"
            
            if [ ! -d "cloudfunctions/$func" ]; then
                echo -e "${YELLOW}⚠️  跳过不存在的云函数: $func${NC}"
                continue
            fi
            
            # 进入云函数目录
            cd "cloudfunctions/$func"
            
            # 安装依赖
            if [ -f "package.json" ]; then
                echo "安装 $func 的依赖..."
                npm install --silent
            fi
            
            # 返回项目根目录
            cd "../.."
            
            # 上传云函数
            echo "上传云函数 $func..."
            wx cloud functions deploy "$func"
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ $func 部署成功${NC}"
            else
                echo -e "${RED}❌ $func 部署失败${NC}"
            fi
            
            echo "---"
        done
        
        echo -e "${GREEN}✅ 安全云函数部署完成${NC}"
        echo -e "${YELLOW}⚠️  healthDataManager 未部署，请手动解决冲突后再部署${NC}"
        ;;
        
    4)
        echo -e "${YELLOW}👋 退出修复工具${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ 无效选项${NC}"
        exit 1
        ;;
esac

echo
echo -e "${GREEN}🎉 修复完成！${NC}"
echo -e "${BLUE}如需更多帮助，请查看：doc/云函数部署问题解决方案.md${NC}"