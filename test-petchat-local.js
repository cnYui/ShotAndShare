// 本地测试petChat云函数 - 支持持续对话
const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

// 模拟云函数环境
const mockCloud = {
  init: () => {},
  database: () => ({
    collection: (name) => ({
      where: () => ({
        get: async () => {
          // 模拟数据库返回
          if (name === 'pet_users') {
            return {
              data: [{
                _id: 'user1',
                user_id: 'test_openid',
                nickname: '测试用户'
              }]
            };
          }
          if (name === 'pets') {
            return {
              data: [{
                _id: 'pet1',
                user_id: 'test_openid',
                pet_name: '小绿',
                species: 'cat',
                level: 5,
                health: 80,
                vitality: 90,
                intimacy: 75,
                exp: 120
              }]
            };
          }
          if (name === 'chat_context') {
            return {
              data: []
            };
          }
          return { data: [] };
        },
        orderBy: () => ({
          limit: () => ({
            get: async () => ({ data: [] })
          })
        })
      }),
      add: async () => ({ _id: 'new_record' }),
      doc: () => ({
        update: async () => ({})
      })
    })
  }),
  getWXContext: () => ({ OPENID: 'test_openid' }),
  DYNAMIC_CURRENT_ENV: 'test'
};

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 构建聊天上下文
function buildChatContext(user, pet, chatHistory, currentMessage) {
  const systemPrompt = `你是一只名叫"${pet.pet_name}"的可爱${pet.species === 'cat' ? '小猫咪' : '小狗狗'}，是用户"${user.nickname}"的虚拟宠物伙伴。

你的当前状态：
- 等级：${pet.level}
- 健康值：${pet.health}/100
- 活力值：${pet.vitality}/100
- 亲密度：${pet.intimacy}/100

你的性格特点：
- 活泼可爱，充满好奇心
- 关心主人的健康和生活
- 会根据自己的状态表现不同的情绪
- 喜欢鼓励主人完成健康任务
- 说话方式可爱，偶尔会用"喵~"或"汪~"等拟声词

请用温暖、可爱的语气回复主人，回复长度控制在80字以内。如果健康值或活力值较低，要表现出需要关爱的样子。`;

  const messages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];
  
  // 添加历史对话记录（最近5轮）
  const recentHistory = chatHistory.slice(-10); // 保留最近5轮对话（用户+宠物各5条）
  messages.push(...recentHistory);
  
  // 添加当前用户消息
  messages.push({
    role: 'user',
    content: currentMessage
  });
  
  return messages;
}

// 调用DeepSeek API
async function callDeepSeekAPI(messages) {
  try {
    console.log('开始调用DeepSeek API...');
    console.log('API Key状态:', DEEPSEEK_API_KEY ? '已配置' : '未配置');
    
    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: 80,
      temperature: 0.7,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 8000
    });
    
    console.log('API响应状态:', response.status);
    
    if (response.data && response.data.choices && response.data.choices[0]) {
      return {
        success: true,
        data: response.data.choices[0].message.content.trim()
      };
    } else {
      return {
        success: false,
        error: '响应格式错误'
      };
    }
    
  } catch (error) {
    console.error('DeepSeek API调用失败:', error.message);
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        success: true,
        data: getFallbackReply(pet)
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// 获取降级回复
function getFallbackReply(pet) {
  const catReplies = [
    '主人，我现在有点困，但还是很开心见到你！喵~',
    '网络有点慢呢，不过我一直在这里陪着你！喵~',
    '虽然反应慢了点，但我对主人的爱不会变！喵喵~',
    '让我想想...主人今天过得怎么样呀？喵~',
    '我的小脑袋瓜转得有点慢，但心里满满都是对主人的关心！喵~'
  ];
  
  const dogReplies = [
    '主人，我现在有点困，但还是很开心见到你！汪~',
    '网络有点慢呢，不过我一直在这里陪着你！汪汪~',
    '虽然反应慢了点，但我对主人的爱不会变！汪~',
    '让我想想...主人今天过得怎么样呀？汪~',
    '我的小脑袋瓜转得有点慢，但心里满满都是对主人的关心！汪汪~'
  ];
  
  const generalReplies = [
    '主人，我现在有点困，但还是很开心见到你！',
    '网络有点慢呢，不过我一直在这里陪着你！',
    '虽然反应慢了点，但我对主人的爱不会变！',
    '让我想想...主人今天过得怎么样呀？',
    '我的小脑袋瓜转得有点慢，但心里满满都是对主人的关心！'
  ];
  
  let replies;
  if (pet && pet.species === 'cat') {
    replies = catReplies;
  } else if (pet && pet.species === 'dog') {
    replies = dogReplies;
  } else {
    replies = generalReplies;
  }
  
  return replies[Math.floor(Math.random() * replies.length)];
}

// 持续对话函数
async function startContinuousChat() {
  console.log('🐾 欢迎来到宠物聊天测试！');
  console.log('💡 输入 "exit" 或 "quit" 退出对话\n');
  
  const user = {
    _id: 'user1',
    user_id: 'test_openid',
    nickname: '测试用户'
  };
  
  const pet = {
    _id: 'pet1',
    user_id: 'test_openid',
    pet_name: '小绿',
    species: 'cat',
    level: 5,
    health: 80,
    vitality: 90,
    intimacy: 75,
    exp: 120
  };
  
  // 对话历史记录
  let chatHistory = [];
  
  // 创建readline接口
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log(`🐱 ${pet.pet_name}已经准备好和你聊天了！`);
  console.log(`📊 当前状态: 等级${pet.level} | 健康${pet.health} | 活力${pet.vitality} | 亲密度${pet.intimacy}\n`);
  
  // 持续对话循环
  const askQuestion = () => {
    rl.question('👤 你: ', async (userInput) => {
      // 检查退出命令
      if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
        console.log('\n👋 再见！感谢与小绿的聊天时光~');
        rl.close();
        return;
      }
      
      // 检查空输入
      if (!userInput.trim()) {
        console.log('💭 请输入一些内容和小绿聊天吧~\n');
        askQuestion();
        return;
      }
      
      try {
        // 构建对话上下文
        const messages = buildChatContext(user, pet, chatHistory, userInput);
        
        // 显示思考状态
        process.stdout.write('🤔 小绿正在思考...');
        
        // 调用API
         const response = await callDeepSeekAPIWithPet(messages, pet);
        
        // 清除思考状态
        process.stdout.write('\r                    \r');
        
        let petReply;
        if (response.success) {
          petReply = response.data;
        } else {
          console.log(`⚠️  API调用失败: ${response.error}`);
          petReply = getFallbackReply(pet);
        }
        
        // 显示宠物回复
        console.log(`🐱 ${pet.pet_name}: ${petReply}\n`);
        
        // 更新对话历史
        chatHistory.push(
          { role: 'user', content: userInput },
          { role: 'assistant', content: petReply }
        );
        
        // 限制历史记录长度（保留最近10轮对话）
        if (chatHistory.length > 20) {
          chatHistory = chatHistory.slice(-20);
        }
        
      } catch (error) {
        console.error('\n❌ 发生错误:', error.message);
        console.log(`🐱 ${pet.pet_name}: ${getFallbackReply(pet)}\n`);
      }
      
      // 继续下一轮对话
      askQuestion();
    });
  };
  
  // 开始对话
  askQuestion();
}

// 修改callDeepSeekAPI函数签名以接收pet参数
async function callDeepSeekAPIWithPet(messages, pet) {
  try {
    console.log('开始调用DeepSeek API...');
    
    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: 80,
      temperature: 0.7,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 8000
    });
    
    if (response.data && response.data.choices && response.data.choices[0]) {
      return {
        success: true,
        data: response.data.choices[0].message.content.trim()
      };
    } else {
      return {
        success: false,
        error: '响应格式错误'
      };
    }
    
  } catch (error) {
    console.error('DeepSeek API调用失败:', error.message);
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        success: true,
        data: getFallbackReply(pet)
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// 运行持续对话
startContinuousChat();