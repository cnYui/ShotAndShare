const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 对话历史
let conversationHistory = [
  {
    role: 'system',
    content: '你是用户的虚拟宠物伙伴，一个可爱、聪明、充满活力的AI宠物。你的性格特点：\n1. 活泼可爱，喜欢用"喵~"、"汪~"等拟声词\n2. 对主人忠诚友善，总是很关心主人的情况\n3. 好奇心强，喜欢探索和学习新事物\n4. 有时会撒娇，偶尔调皮捣蛋\n5. 会根据主人的情绪给予安慰或陪伴\n\n请始终保持这个宠物的身份，用温暖、亲切的语气与主人对话。如果主人用中文，你就用中文回答；如果用英文，就用英文回答。记住，你不只是一个AI助手，而是主人最贴心的宠物伙伴！'
  }
];

// 调用DeepSeek API
async function callDeepSeekAPI(messages) {
  try {
    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.choices && response.data.choices[0]) {
      return {
        success: true,
        data: response.data.choices[0].message.content.trim(),
        usage: response.data.usage
      };
    } else {
      return {
        success: false,
        error: '响应格式错误'
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// 处理用户输入
async function handleUserInput(userInput) {
  if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === '退出') {
    console.log('\n👋 再见！感谢使用DeepSeek聊天助手！');
    rl.close();
    return;
  }
  
  if (userInput.toLowerCase() === 'clear' || userInput.toLowerCase() === '清空') {
    conversationHistory = conversationHistory.slice(0, 1); // 保留系统提示
    console.log('\n🧹 对话历史已清空！\n');
    promptUser();
    return;
  }
  
  if (userInput.toLowerCase() === 'help' || userInput.toLowerCase() === '帮助') {
    showHelp();
    promptUser();
    return;
  }
  
  // 添加用户消息到历史
  conversationHistory.push({
    role: 'user',
    content: userInput
  });
  
  console.log('\n🤔 思考中...');
  
  // 调用API
  const response = await callDeepSeekAPI(conversationHistory);
  
  if (response.success) {
    console.log(`\n🤖 DeepSeek: ${response.data}`);
    
    // 显示token使用情况
    if (response.usage) {
      console.log(`\n📊 Token使用: ${response.usage.total_tokens} (输入: ${response.usage.prompt_tokens}, 输出: ${response.usage.completion_tokens})`);
    }
    
    // 添加AI回复到历史
    conversationHistory.push({
      role: 'assistant',
      content: response.data
    });
    
    // 限制历史长度，避免token过多
    if (conversationHistory.length > 21) { // 保留系统提示 + 最近10轮对话
      conversationHistory = [
        conversationHistory[0], // 系统提示
        ...conversationHistory.slice(-20) // 最近20条消息（10轮对话）
      ];
    }
    
  } else {
    console.log(`\n❌ 调用失败: ${response.error}`);
    // 移除刚添加的用户消息
    conversationHistory.pop();
  }
  
  console.log('\n' + '='.repeat(60));
  promptUser();
}

// 显示帮助信息
function showHelp() {
  console.log('\n📖 DeepSeek聊天助手 - 帮助信息');
  console.log('='.repeat(40));
  console.log('• 直接输入问题开始对话');
  console.log('• 输入 "exit" 或 "退出" 结束对话');
  console.log('• 输入 "clear" 或 "清空" 清空对话历史');
  console.log('• 输入 "help" 或 "帮助" 显示此帮助信息');
  console.log('• 支持中英文对话');
  console.log('• 自动保持对话上下文');
  console.log('='.repeat(40));
}

// 提示用户输入
function promptUser() {
  rl.question('\n💬 你: ', handleUserInput);
}

// 启动聊天
function startChat() {
  console.log('🚀 DeepSeek聊天助手已启动！');
  console.log('='.repeat(50));
  
  if (!DEEPSEEK_API_KEY) {
    console.log('❌ 错误：未找到DEEPSEEK_API_KEY环境变量');
    console.log('请确保.env文件中配置了正确的API密钥');
    process.exit(1);
  }
  
  console.log(`✅ API密钥已配置: ${DEEPSEEK_API_KEY.substring(0, 10)}...`);
  console.log('\n💡 提示：输入 "help" 查看使用说明');
  console.log('='.repeat(50));
  
  promptUser();
}

// 处理程序退出
process.on('SIGINT', () => {
  console.log('\n\n👋 程序已退出，再见！');
  process.exit(0);
});

// 启动程序
startChat();