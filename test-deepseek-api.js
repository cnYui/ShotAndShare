const axios = require('axios');
require('dotenv').config();

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

console.log('DeepSeek API Key:', DEEPSEEK_API_KEY ? `${DEEPSEEK_API_KEY.substring(0, 10)}...` : '未配置');

async function testDeepSeekAPI() {
  try {
    console.log('正在测试DeepSeek API连接...');
    
    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一只可爱的小猫咪，请用简短可爱的语气回复。'
        },
        {
          role: 'user',
          content: '你好'
        }
      ],
      max_tokens: 50,
      temperature: 0.8
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('API调用成功!');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.choices && response.data.choices[0]) {
      console.log('AI回复:', response.data.choices[0].message.content);
      return true;
    } else {
      console.log('响应格式异常');
      return false;
    }
    
  } catch (error) {
    console.error('API调用失败:');
    console.error('错误类型:', error.code);
    console.error('错误信息:', error.message);
    
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    
    return false;
  }
}

// 运行测试
testDeepSeekAPI().then(success => {
  if (success) {
    console.log('\n✅ DeepSeek API连接正常，可以正常使用');
  } else {
    console.log('\n❌ DeepSeek API连接失败，需要检查配置');
  }
  process.exit(success ? 0 : 1);
});