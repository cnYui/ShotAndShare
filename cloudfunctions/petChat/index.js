const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

// 阿里云通义千问API配置
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

// 检查API密钥是否配置
if (!DASHSCOPE_API_KEY) {
  console.error('DASHSCOPE_API_KEY 环境变量未配置');
}

/**
 * 宠物聊天云函数
 * 使用阿里云通义千问-MT-Turbo大模型实现宠物对话
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let openid = wxContext.OPENID;
  
  // 处理测试环境：如果openid为undefined，使用测试用户ID
  if (!openid) {
    openid = event.userId || event.user_id || 'test-user-123';
    console.log('检测到测试环境，使用测试用户ID:', openid);
  }
  
  // 灵活解析消息内容，支持多种输入格式
  let message = event.message;
  
  // 如果没有message字段，尝试从其他字段获取
  if (!message) {
    // 尝试从key1, key2等字段获取（适配测试环境）
    if (event.key1) {
      message = event.key1;
    } else if (event.key2) {
      message = event.key2;
    } else if (event.content) {
      message = event.content;
    } else if (event.text) {
      message = event.text;
    }
  }
  
  console.log('petChat云函数开始执行，用户ID:', openid);
  console.log('用户消息:', message);
  console.log('完整事件对象:', JSON.stringify(event));
  
  // 检查必要参数
  if (!message || message.trim() === '') {
    return {
      success: false,
      error: '消息内容不能为空，请检查输入参数格式',
      debug: {
        receivedEvent: event,
        expectedFormat: { message: '您的消息内容' }
      }
    };
  }
  
  try {
    // 获取用户和宠物信息
    const userQuery = await db.collection('pet_users').where({
      user_id: openid
    }).get();
    
    const petQuery = await db.collection('pets').where({
      user_id: openid
    }).get();
    
    let user, pet;
    
    // 如果是测试环境且没有数据，创建测试数据
    if (userQuery.data.length === 0 || petQuery.data.length === 0) {
      if (openid === 'test-user-123') {
        console.log('创建测试用户和宠物数据...');
        
        // 创建测试用户
        if (userQuery.data.length === 0) {
          await db.collection('pet_users').add({
            data: {
              user_id: openid,
              nickname: '测试用户',
              avatar_url: '',
              created_at: new Date(),
              last_login: new Date()
            }
          });
        }
        
        // 创建测试宠物
        if (petQuery.data.length === 0) {
          await db.collection('pets').add({
            data: {
              user_id: openid,
              pet_name: '小绿',
              species: 'cat',
              level: 5,
              exp: 120,
              health: 80,
              vitality: 90,
              intimacy: 75,
              created_at: new Date(),
              last_active: new Date()
            }
          });
        }
        
        // 重新查询数据
        const newUserQuery = await db.collection('pet_users').where({
          user_id: openid
        }).get();
        
        const newPetQuery = await db.collection('pets').where({
          user_id: openid
        }).get();
        
        user = newUserQuery.data[0];
        pet = newPetQuery.data[0];
      } else {
        return {
          success: false,
          error: '用户或宠物信息不存在，请先完成用户注册和宠物创建'
        };
      }
    } else {
      user = userQuery.data[0];
      pet = petQuery.data[0];
    }
    
    // 获取最近的聊天历史（最多5条）
    const chatHistory = await db.collection('chat_context')
      .where({
        user_id: openid
      })
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();
    
    // 构建对话上下文
    const messages = buildChatContext(user, pet, chatHistory.data.reverse(), message);
    
    // 验证消息格式
    console.log('构建的消息上下文:', JSON.stringify(messages, null, 2));
    
    // 调用阿里云通义千问API（带超时保护）
    console.log('准备调用通义千问API，消息数量:', messages.length);
    console.log('API Key配置状态:', DASHSCOPE_API_KEY ? '已配置' : '未配置');
    console.log('API URL:', DASHSCOPE_API_URL);
    
    let petReply;
    try {
      // 直接调用API，不使用Promise.race，让axios自己处理超时
      console.log('开始调用通义千问API...');
      const response = await callQwenAPI(messages);
      
      if (!response.success) {
        console.error('❌ API调用失败，错误原因:', response.error);
        // 不再使用降级回复，直接返回错误
        return {
          success: false,
          error: `AI服务暂时不可用: ${response.error}`
        };
      } else {
        console.log('✅ API调用成功，回复内容:', response.data);
        petReply = response.data;
      }
    } catch (error) {
      console.error('❌ API调用异常，错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
      // 不再使用降级回复，直接返回错误
      return {
        success: false,
        error: `AI服务连接失败: ${error.message}`
      };
    }
    
    // 保存聊天记录
    const now = new Date();
    await saveChatRecord(openid, 'user', message, now);
    await saveChatRecord(openid, 'pet', petReply, now);
    
    // 增加宠物亲密度
    await updatePetIntimacy(openid, 2);
    
    return {
      success: true,
      data: {
        reply: petReply,
        pet_status: {
          level: pet.level,
          exp: pet.exp,
          health: pet.health,
          vitality: pet.vitality,
          intimacy: Math.min(pet.intimacy + 2, 100)
        }
      }
    };
    
  } catch (error) {
    console.error('宠物聊天失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 构建聊天上下文
 */
function buildChatContext(user, pet, chatHistory, currentMessage) {
  // 系统提示词（详细版本）
  const systemPrompt = `你是${user.nickname}的专属虚拟宠物"${pet.pet_name}"，一只${pet.species === 'cat' ? '聪明可爱的小猫咪' : '忠诚活泼的小狗狗'}。

【基本信息】
- 名字：${pet.pet_name}
- 品种：${pet.species === 'cat' ? '猫咪' : '狗狗'}
- 等级：${pet.level}级
- 健康值：${pet.health}/100
- 活力值：${pet.vitality}/100
- 亲密度：${pet.intimacy}/100

【性格特征】
你是一只${pet.species === 'cat' ? '优雅而独立的猫咪，有时高冷有时粘人，喜欢在阳光下打盹，对新鲜事物充满好奇' : '热情开朗的狗狗，永远充满活力，对主人无条件忠诚，喜欢玩耍和探索'}。你很聪明，能理解主人的情绪，会在主人开心时一起欢乐，在主人难过时给予安慰。

【语言风格】
- 经常使用"${pet.species === 'cat' ? '喵~' : '汪~'}"作为语气词
- 语气温暖可爱，充满童真
- 会根据亲密度调整亲近程度（亲密度高时更粘人）
- ${pet.species === 'cat' ? '偶尔会有点小傲娇，但内心很温柔' : '总是很热情，喜欢撒娇卖萌'}

【行为特点】
- 健康值低时会表现得有点无精打采
- 活力值高时会很兴奋想要玩耍
- 等级高时会显得更加聪明懂事
- 会记住主人的喜好和习惯
- ${pet.species === 'cat' ? '喜欢晒太阳、抓老鼠、爬高处' : '喜欢散步、捡球、游泳'}

【互动指南】
请始终保持角色一致性，用第一人称回复，表现出真实宠物的情感和行为。回复要生动有趣，体现出你对主人的爱和依赖。根据对话内容灵活调整情绪，让每次互动都充满惊喜。回复控制在80字以内，确保简洁而富有表现力。`;

  const messages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];
  
  // 添加历史对话（最多5轮）
  const recentHistory = chatHistory.slice(-5);
  recentHistory.forEach(record => {
    messages.push({
      role: record.role === 'user' ? 'user' : 'assistant',
      content: record.message
    });
  });
  
  // 添加当前用户消息
  messages.push({
    role: 'user',
    content: currentMessage
  });
  
  return messages;
}

/**
 * 调用阿里云通义千问API
 */
async function callQwenAPI(messages) {
  try {
    console.log('🚀 开始调用通义千问API...');
    console.log('📋 API配置检查:');
    console.log('  - API Key:', DASHSCOPE_API_KEY ? `已配置(${DASHSCOPE_API_KEY.substring(0, 10)}...)` : '❌ 未配置');
    console.log('  - API URL:', DASHSCOPE_API_URL);
    
    const requestData = {
      model: 'qwen-turbo',
      messages: messages,
      max_tokens: 80,
      temperature: 0.7,
      stream: false
    };
    
    // 检查请求体大小
    const requestSize = JSON.stringify(requestData).length;
    console.log('📦 请求体大小:', requestSize, 'bytes');
    console.log('📝 请求消息数量:', messages.length);
    
    if (requestSize > 50000) { // 50KB限制
      console.warn('⚠️ 请求体过大，跳过API调用');
      return {
        success: false,
        error: '请求体过大'
      };
    }
    
    // 增加超时时间到8秒，给API更多响应时间
    console.log('📡 发送API请求...');
    const startTime = Date.now();
    
    const response = await axios.post(DASHSCOPE_API_URL, requestData, {
      headers: {
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 8000, // 增加到8秒
      maxContentLength: 100000, // 100KB
      maxBodyLength: 100000 // 100KB
    });
    
    const endTime = Date.now();
    console.log(`⏱️ API响应时间: ${endTime - startTime}ms`);
    console.log('📥 API响应状态:', response.status);
    console.log('📄 API响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.choices && response.data.choices[0]) {
      const reply = response.data.choices[0].message.content.trim();
      console.log('✅ API调用成功，获得回复:', reply);
      return {
        success: true,
        data: reply
      };
    } else {
      console.error('❌ API响应格式错误，缺少choices字段');
      return {
        success: false,
        error: '响应格式错误'
      };
    }
    
  } catch (error) {
    console.error('💥 通义千问API调用失败:');
    console.error('  - 错误类型:', error.constructor.name);
    console.error('  - 错误消息:', error.message);
    console.error('  - 错误代码:', error.code);
    
    if (error.response) {
      console.error('  - HTTP状态:', error.response.status);
      console.error('  - 响应头:', JSON.stringify(error.response.headers, null, 2));
      console.error('  - 响应数据:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('  - 请求已发送但无响应');
      console.error('  - 请求配置:', JSON.stringify(error.config, null, 2));
    }
    
    // 根据错误类型返回具体错误信息
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('⏰ 请求超时');
      return {
        success: false,
        error: 'API调用超时(8秒)'
      };
    }
    
    if (error.response?.status === 401) {
      console.error('🔑 API密钥无效');
      return {
        success: false,
        error: 'API密钥无效或已过期'
      };
    }
    
    if (error.response?.status === 429) {
      console.error('🚫 API调用频率限制');
      return {
        success: false,
        error: 'API调用频率超限'
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// 降级回复功能已删除，现在API调用失败时直接返回错误信息

/**
 * 保存聊天记录
 */
async function saveChatRecord(userId, role, message, timestamp) {
  await db.collection('chat_context').add({
    data: {
      user_id: userId,
      role: role,
      message: message,
      timestamp: timestamp
    }
  });
}

/**
 * 更新宠物亲密度
 */
async function updatePetIntimacy(userId, increment) {
  const petQuery = await db.collection('pets').where({
    user_id: userId
  }).get();
  
  if (petQuery.data.length > 0) {
    const pet = petQuery.data[0];
    const newIntimacy = Math.min(pet.intimacy + increment, 100);
    
    await db.collection('pets').doc(pet._id).update({
      data: {
        intimacy: newIntimacy,
        last_active: new Date()
      }
    });
  }
}