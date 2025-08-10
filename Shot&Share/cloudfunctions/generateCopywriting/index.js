// 云函数入口文件
const cloud = require('wx-server-sdk')
const https = require('https')
const crypto = require('crypto')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// Qwen-Omni API 配置 - 硬编码方式
const QWEN_API_KEY = 'sk-7ecb18df3ff5473e98ab5d8c806616db'
const QWEN_BASE_URL = 'https://dashscope.aliyuncs.com'

// 检查API配置
if (!QWEN_API_KEY) {
  throw new Error('QWEN_API_KEY 未配置')
}
if (!QWEN_BASE_URL) {
  throw new Error('QWEN_BASE_URL 未配置')
}

// 文案风格配置
const STYLE_PROMPTS = {
  literary: {
    name: '文艺治愈',
    prompt: '请为这些图片生成三条不同的文艺治愈朋友圈文案，要求：1）语言优美，富有诗意；2）传达温暖正能量；3）适合发朋友圈；4）每条字数控制在50-100字；5）可以适当使用emoji表情；6）三条文案要有不同的表达角度和情感层次。请用JSON格式返回，格式为：{"copywritings": ["文案1", "文案2", "文案3"]}'
  },
  humorous: {
    name: '幽默搞笑',
    prompt: '请为这些图片生成三条不同的幽默搞笑朋友圈文案，要求：1）语言轻松幽默；2）有趣好玩，能让人会心一笑；3）适合发朋友圈；4）每条字数控制在30-80字；5）可以适当使用emoji表情和网络流行语；6）三条文案要有不同的幽默点和表达方式。请用JSON格式返回，格式为：{"copywritings": ["文案1", "文案2", "文案3"]}'
  },
  inspirational: {
    name: '励志正能量',
    prompt: '请为这些图片生成三条不同的励志正能量朋友圈文案，要求：1）积极向上，充满正能量；2）能够激励和鼓舞人心；3）适合发朋友圈；4）每条字数控制在40-100字；5）可以适当使用emoji表情；6）三条文案要有不同的励志角度和激励方式。请用JSON格式返回，格式为：{"copywritings": ["文案1", "文案2", "文案3"]}'
  },
  romantic: {
    name: '浪漫温馨',
    prompt: '请为这些图片生成三条不同的浪漫温馨朋友圈文案，要求：1）语言温柔浪漫；2）营造温馨美好的氛围；3）适合发朋友圈；4）每条字数控制在40-90字；5）可以适当使用emoji表情；6）三条文案要有不同的浪漫情调和温馨表达。请用JSON格式返回，格式为：{"copywritings": ["文案1", "文案2", "文案3"]}'
  },
  philosophical: {
    name: '哲理深度',
    prompt: '请为这些图片生成三条不同的富有哲理的朋友圈文案，要求：1）有深度和思考性；2）能引发共鸣和思考；3）适合发朋友圈；4）每条字数控制在50-120字；5）可以适当使用emoji表情；6）三条文案要有不同的哲理角度和思考维度。请用JSON格式返回，格式为：{"copywritings": ["文案1", "文案2", "文案3"]}'
  },
  daily: {
    name: '日常生活',
    prompt: '请为这些图片生成三条不同的日常生活朋友圈文案，要求：1）贴近生活，真实自然；2）语言轻松随意；3）适合发朋友圈；4）每条字数控制在30-80字；5）可以适当使用emoji表情；6）三条文案要有不同的生活感悟和表达方式。请用JSON格式返回，格式为：{"copywritings": ["文案1", "文案2", "文案3"]}'
  },
  travel: {
    name: '旅行记录',
    prompt: '请为这些图片生成三条不同的旅行记录朋友圈文案，要求：1）记录旅途美好，分享见闻；2）语言生动有趣；3）适合发朋友圈；4）每条字数控制在40-100字；5）可以适当使用emoji表情；6）三条文案要有不同的旅行感受和记录角度。请用JSON格式返回，格式为：{"copywritings": ["文案1", "文案2", "文案3"]}'
  },
  food: {
    name: '美食分享',
    prompt: '请为这些图片生成三条不同的美食分享朋友圈文案，要求：1）诱人美食，味蕾享受；2）语言生动诱人；3）适合发朋友圈；4）每条字数控制在30-80字；5）可以适当使用emoji表情；6）三条文案要有不同的美食描述和感受表达。请用JSON格式返回，格式为：{"copywritings": ["文案1", "文案2", "文案3"]}'
  },
  fashion: {
    name: '时尚潮流',
    prompt: '请为这些图片生成三条不同的时尚潮流朋友圈文案，要求：1）展现个性，引领潮流；2）语言时尚有范；3）适合发朋友圈；4）每条字数控制在30-80字；5）可以适当使用emoji表情；6）三条文案要有不同的时尚态度和个性表达。请用JSON格式返回，格式为：{"copywritings": ["文案1", "文案2", "文案3"]}'
  },
  fitness: {
    name: '运动健身',
    prompt: '请为这些图片生成三条不同的运动健身朋友圈文案，要求：1）健康生活，活力满满；2）语言积极向上；3）适合发朋友圈；4）每条字数控制在30-80字；5）可以适当使用emoji表情；6）三条文案要有不同的运动感受和健身态度。请用JSON格式返回，格式为：{"copywritings": ["文案1", "文案2", "文案3"]}'
  },
  work: {
    name: '职场励志',
    prompt: '请为这些图片生成三条不同的职场励志朋友圈文案，要求：1）工作感悟，职场正能量；2）语言专业励志；3）适合发朋友圈；4）每条字数控制在40-100字；5）可以适当使用emoji表情；6）三条文案要有不同的职场感悟和励志角度。请用JSON格式返回，格式为：{"copywritings": ["文案1", "文案2", "文案3"]}'
  },
  friendship: {
    name: '友情岁月',
    prompt: '请为这些图片生成三条不同的友情岁月朋友圈文案，要求：1）珍贵友谊，温暖陪伴；2）语言真挚感人；3）适合发朋友圈；4）每条字数控制在40-90字；5）可以适当使用emoji表情；6）三条文案要有不同的友情表达和情感层次。请用JSON格式返回，格式为：{"copywritings": ["文案1", "文案2", "文案3"]}'
  },
  family: {
    name: '家庭温馨',
    prompt: '请为这些图片生成三条不同的家庭温馨朋友圈文案，要求：1）家的温暖，亲情无价；2）语言温馨感人；3）适合发朋友圈；4）每条字数控制在40-90字；5）可以适当使用emoji表情；6）三条文案要有不同的家庭情感和温馨表达。请用JSON格式返回，格式为：{"copywritings": ["文案1", "文案2", "文案3"]}'
  },
  nature: {
    name: '自然风光',
    prompt: '请为这些图片生成三条不同的自然风光朋友圈文案，要求：1）大自然之美，心灵净化；2）语言优美诗意；3）适合发朋友圈；4）每条字数控制在40-100字；5）可以适当使用emoji表情；6）三条文案要有不同的自然感受和美景描述。请用JSON格式返回，格式为：{"copywritings": ["文案1", "文案2", "文案3"]}'
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('文案生成云函数开始执行:', event)
  
  try {
    // 参数验证
    if (!event || typeof event !== 'object') {
      throw new Error('无效的请求参数')
    }
    
    const { imageUrls, description = '', style = 'literary', userId } = event
    
    // 支持单张图片的向后兼容
    let imageUrlArray = []
    if (event.imageUrl && typeof event.imageUrl === 'string') {
      imageUrlArray = [event.imageUrl]
    } else if (imageUrls && Array.isArray(imageUrls)) {
      imageUrlArray = imageUrls
    } else {
      throw new Error('图片URL不能为空，必须是字符串或字符串数组')
    }
    
    if (imageUrlArray.length === 0) {
      throw new Error('至少需要提供一张图片')
    }
    
    if (imageUrlArray.length > 9) {
      throw new Error('最多支持9张图片')
    }
    
    // 验证每个URL都是字符串
    for (let i = 0; i < imageUrlArray.length; i++) {
      if (!imageUrlArray[i] || typeof imageUrlArray[i] !== 'string') {
        throw new Error(`第${i + 1}张图片URL无效`)
      }
    }
    
    if (!userId || typeof userId !== 'string') {
      throw new Error('用户ID不能为空且必须是字符串')
    }
    
    if (!STYLE_PROMPTS[style]) {
      throw new Error(`不支持的文案风格: ${style}`)
    }
    
    console.log('参数验证通过，开始调用Qwen-Omni API生成文案')
    
    // 构建提示词
    const styleConfig = STYLE_PROMPTS[style]
    let prompt = styleConfig.prompt
    
    // 如果用户提供了描述，加入到提示词中
    if (description && typeof description === 'string' && description.trim()) {
      prompt += `\n\n用户补充描述：${description.trim()}`
    }
    
    console.log('提示词构建完成，调用API，图片数量:', imageUrlArray.length)
    
    // 调用Qwen-Omni API
    let generatedContent
    try {
      generatedContent = await callQwenOmniAPI(imageUrlArray, prompt)
    } catch (apiError) {
      console.error('API调用失败:', apiError)
      throw new Error(`文案生成失败: ${apiError.message}`)
    }
    
    if (!generatedContent || typeof generatedContent !== 'string') {
      throw new Error('API返回的内容无效')
    }
    
    console.log('文案生成成功，长度:', generatedContent.length)
    
    // 解析JSON格式的返回结果
    let copywritings = []
    try {
      const parsed = JSON.parse(generatedContent)
      if (parsed.copywritings && Array.isArray(parsed.copywritings)) {
        copywritings = parsed.copywritings.filter(item => item && typeof item === 'string')
      }
    } catch (parseError) {
      console.warn('JSON解析失败，使用原始内容:', parseError)
      // 如果JSON解析失败，将原始内容作为单条文案
      copywritings = [generatedContent]
    }
    
    // 确保至少有一条文案
    if (copywritings.length === 0) {
      copywritings = [generatedContent]
    }
    
    console.log('解析得到文案数量:', copywritings.length)
    
    // 为每条文案提取标签
    const copywritingRecords = []
    const saveResults = []
    
    for (let i = 0; i < copywritings.length; i++) {
      const content = copywritings[i]
      
      // 提取标签（简单的关键词提取）
      let tags = []
      try {
        tags = extractTags(content, description)
      } catch (tagError) {
        console.warn(`第${i + 1}条文案标签提取失败:`, tagError)
        tags = [] // 使用空数组作为默认值
      }
      
      // 构建记录对象
      const record = {
        userId,
        imageUrls: imageUrlArray,
        imageUrl: imageUrlArray[0], // 保持向后兼容
        description: description || '',
        style,
        styleName: styleConfig.name,
        content: content,
        tags,
        createdAt: new Date(),
        saved: false,
        shared: false,
        copywritingIndex: i // 标记这是第几条文案
      }
      
      copywritingRecords.push(record)
    }
    
    // 批量保存到数据库
    try {
      for (const record of copywritingRecords) {
        const saveResult = await db.collection('copywriting_records').add({
          data: record
        })
        saveResults.push({
          recordId: saveResult._id,
          content: record.content,
          tags: record.tags,
          style: record.styleName,
          createdAt: record.createdAt
        })
      }
      console.log('记录保存成功，数量:', saveResults.length)
    } catch (dbError) {
      console.error('数据库保存失败:', dbError)
      throw new Error(`保存记录失败: ${dbError.message}`)
    }
    
    // 更新用户统计（不影响主流程）
    try {
      await updateUserStats(userId, 'generated')
    } catch (statsError) {
      console.warn('用户统计更新失败:', statsError)
      // 不抛出错误，不影响主流程
    }
    
    const result = {
      success: true,
      data: {
        copywritings: saveResults,
        imageUrls: imageUrlArray,
        style: styleConfig.name,
        totalCount: saveResults.length
      }
    }
    
    console.log('云函数执行成功')
    return result
    
  } catch (error) {
    console.error('文案生成失败:', error)
    console.error('错误堆栈:', error.stack)
    
    // 确保返回的错误信息是安全的
    const errorMessage = error.message || '文案生成失败，请重试'
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * 调用Qwen-Omni API
 */
async function callQwenOmniAPI(imageUrls, prompt) {
  return new Promise((resolve, reject) => {
    let isResolved = false
    
    // 构建content数组，包含所有图片和文本
    const content = []
    
    // 添加所有图片
    for (const imageUrl of imageUrls) {
      content.push({
        type: 'image_url',
        image_url: {
          url: imageUrl
        }
      })
    }
    
    // 添加文本提示
    content.push({
      type: 'text',
      text: prompt
    })
    
    const requestData = {
      model: 'qwen-omni-turbo',
      messages: [
        {
          role: 'user',
          content: content
        }
      ],
      modalities: ['text'],
      stream: true,
      stream_options: {
        include_usage: true
      }
    }
    
    const postData = JSON.stringify(requestData)
    
    const options = {
      hostname: 'dashscope.aliyuncs.com',
      port: 443,
      path: '/compatible-mode/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }
    
    const req = https.request(options, (res) => {
      let data = ''
      let content = ''
      
      // 检查HTTP状态码
      if (res.statusCode !== 200) {
        if (!isResolved) {
          isResolved = true
          reject(new Error(`API请求失败，状态码: ${res.statusCode}`))
        }
        return
      }
      
      res.on('data', (chunk) => {
        try {
          data += chunk.toString()
          
          // 处理流式响应
          const lines = data.split('\n')
          data = lines.pop() // 保留最后一行（可能不完整）
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6).trim()
              if (jsonStr === '[DONE]') {
                continue
              }
              
              try {
                const parsed = JSON.parse(jsonStr)
                if (parsed.error) {
                  if (!isResolved) {
                    isResolved = true
                    reject(new Error(`API错误: ${parsed.error.message || '未知错误'}`))
                  }
                  return
                }
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                  content += parsed.choices[0].delta.content
                }
              } catch (e) {
                console.warn('解析JSON失败:', e.message, 'JSON:', jsonStr)
                // 忽略解析错误，继续处理
              }
            }
          }
        } catch (error) {
          console.error('处理数据块时出错:', error)
          if (!isResolved) {
            isResolved = true
            reject(error)
          }
        }
      })
      
      res.on('end', () => {
        if (!isResolved) {
          isResolved = true
          if (content.trim()) {
            resolve(content.trim())
          } else {
            reject(new Error('API返回内容为空，请检查图片URL是否有效或重试'))
          }
        }
      })
      
      res.on('error', (error) => {
        console.error('响应流错误:', error)
        if (!isResolved) {
          isResolved = true
          reject(error)
        }
      })
    })
    
    req.on('error', (error) => {
      console.error('API请求错误:', error)
      if (!isResolved) {
        isResolved = true
        reject(new Error(`网络请求失败: ${error.message}`))
      }
    })
    
    req.on('timeout', () => {
      console.error('API请求超时')
      req.destroy()
      if (!isResolved) {
        isResolved = true
        reject(new Error('API请求超时，请重试'))
      }
    })
    
    // 设置超时时间为30秒
    req.setTimeout(30000)
    
    try {
      req.write(postData)
      req.end()
    } catch (error) {
      console.error('发送请求时出错:', error)
      if (!isResolved) {
        isResolved = true
        reject(error)
      }
    }
  })
}

/**
 * 提取标签
 */
function extractTags(content, description = '') {
  const tags = []
  const text = content + ' ' + description
  
  // 简单的关键词提取逻辑
  const keywords = [
    '美食', '旅行', '风景', '自拍', '朋友', '家人', '宠物', '工作', '学习',
    '运动', '健身', '音乐', '电影', '读书', '咖啡', '下午茶', '日落', '日出',
    '海边', '山景', '城市', '乡村', '春天', '夏天', '秋天', '冬天', '雨天',
    '晴天', '夜晚', '早晨', '周末', '假期', '生活', '心情', '感悟', '梦想'
  ]
  
  keywords.forEach(keyword => {
    if (text.includes(keyword) && !tags.includes(keyword)) {
      tags.push(keyword)
    }
  })
  
  // 限制标签数量
  return tags.slice(0, 5)
}

/**
 * 更新用户统计
 */
async function updateUserStats(userId, action) {
  try {
    const userDoc = db.collection('users').doc(userId)
    
    // 先尝试获取用户记录
    const userResult = await userDoc.get()
    
    if (userResult.data) {
      // 用户存在，更新统计
      const updateData = {
        lastActiveAt: new Date()
      }
      
      if (action === 'generated') {
        updateData['stats.generatedCount'] = db.command.inc(1)
      } else if (action === 'saved') {
        updateData['stats.savedCount'] = db.command.inc(1)
      } else if (action === 'shared') {
        updateData['stats.sharedCount'] = db.command.inc(1)
      }
      
      await userDoc.update({
        data: updateData
      })
    } else {
      // 用户不存在，创建新记录
      const newUser = {
        _id: userId,
        stats: {
          generatedCount: action === 'generated' ? 1 : 0,
          savedCount: action === 'saved' ? 1 : 0,
          sharedCount: action === 'shared' ? 1 : 0
        },
        preferences: {
          defaultStyle: 'literary',
          autoSave: true
        },
        createdAt: new Date(),
        lastActiveAt: new Date()
      }
      
      await db.collection('users').add({
        data: newUser
      })
    }
  } catch (error) {
    console.error('更新用户统计失败:', error)
    // 不抛出错误，避免影响主流程
  }
}