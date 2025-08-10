// 数据库初始化云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('开始初始化数据库')
  
  try {
    const results = []
    
    // 1. 创建用户集合
    try {
      await db.createCollection('users')
      console.log('用户集合创建成功')
      results.push({ collection: 'users', status: 'created' })
    } catch (error) {
      if (error.errCode === -502006 || error.errCode === -501001 || error.message.includes('Table exist')) {
        console.log('用户集合已存在')
        results.push({ collection: 'users', status: 'exists' })
      } else {
        throw error
      }
    }
    
    // 2. 创建文案记录集合
    try {
      await db.createCollection('copywriting_records')
      console.log('文案记录集合创建成功')
      results.push({ collection: 'copywriting_records', status: 'created' })
    } catch (error) {
      if (error.errCode === -502006 || error.errCode === -501001 || error.message.includes('Table exist')) {
        console.log('文案记录集合已存在')
        results.push({ collection: 'copywriting_records', status: 'exists' })
      } else {
        throw error
      }
    }
    
    // 3. 创建文案模板集合
    try {
      await db.createCollection('copywriting_templates')
      console.log('文案模板集合创建成功')
      results.push({ collection: 'copywriting_templates', status: 'created' })
    } catch (error) {
      if (error.errCode === -502006 || error.errCode === -501001 || error.message.includes('Table exist')) {
        console.log('文案模板集合已存在')
        results.push({ collection: 'copywriting_templates', status: 'exists' })
      } else {
        throw error
      }
    }
    
    // 4. 创建系统配置集合
    try {
      await db.createCollection('system_config')
      console.log('系统配置集合创建成功')
      results.push({ collection: 'system_config', status: 'created' })
    } catch (error) {
      if (error.errCode === -502006 || error.errCode === -501001 || error.message.includes('Table exist')) {
        console.log('系统配置集合已存在')
        results.push({ collection: 'system_config', status: 'exists' })
      } else {
        throw error
      }
    }
    
    // 5. 创建用户反馈集合
    try {
      await db.createCollection('user_feedback')
      console.log('用户反馈集合创建成功')
      results.push({ collection: 'user_feedback', status: 'created' })
    } catch (error) {
      if (error.errCode === -502006 || error.errCode === -501001 || error.message.includes('Table exist')) {
        console.log('用户反馈集合已存在')
        results.push({ collection: 'user_feedback', status: 'exists' })
      } else {
        throw error
      }
    }
    
    // 6. 创建上传记录集合
    try {
      await db.createCollection('upload_records')
      console.log('上传记录集合创建成功')
      results.push({ collection: 'upload_records', status: 'created' })
    } catch (error) {
      if (error.errCode === -502006 || error.errCode === -501001 || error.message.includes('Table exist')) {
        console.log('上传记录集合已存在')
        results.push({ collection: 'upload_records', status: 'exists' })
      } else {
        throw error
      }
    }
    
    // 7. 初始化系统配置数据
    const configCount = await db.collection('system_config').count()
    if (configCount.total === 0) {
      await db.collection('system_config').add({
        data: {
          key: 'max_image_size',
          value: 5242880,
          description: '最大图片上传大小（字节）',
          category: 'upload',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      await db.collection('system_config').add({
        data: {
          key: 'max_copywriting_count',
          value: 5,
          description: '单次生成文案最大数量',
          category: 'generation',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      await db.collection('system_config').add({
        data: {
          key: 'supported_image_formats',
          value: ['jpg', 'jpeg', 'png', 'webp'],
          description: '支持的图片格式',
          category: 'upload',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      console.log('系统配置数据初始化完成')
      results.push({ collection: 'system_config', status: 'data_initialized' })
    }
    
    // 8. 初始化文案模板数据
    const templateCount = await db.collection('copywriting_templates').count()
    if (templateCount.total === 0) {
      await db.collection('copywriting_templates').add({
        data: {
          style: 'literary',
          name: '文艺治愈',
          category: '情感表达',
          templates: [
            {
              pattern: '{weather}，{mood}如{comparison}般{adjective}',
              variables: ['weather', 'mood', 'comparison', 'adjective'],
              examples: ['阳光明媚，心情如花朵般绚烂'],
              weight: 1.0
            },
            {
              pattern: '在{scene}中，感受{feeling}的美好',
              variables: ['scene', 'feeling'],
              examples: ['在午后阳光中，感受宁静的美好'],
              weight: 0.8
            }
          ],
          tags: ['治愈', '文艺', '情感'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      await db.collection('copywriting_templates').add({
        data: {
          style: 'humorous',
          name: '幽默搞笑',
          category: '娱乐搞笑',
          templates: [
            {
              pattern: '{action}的我，{result}，{emotion}',
              variables: ['action', 'result', 'emotion'],
              examples: ['拍照的我，角度找了半天，累成狗'],
              weight: 1.0
            }
          ],
          tags: ['搞笑', '幽默', '日常'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      console.log('文案模板数据初始化完成')
      results.push({ collection: 'copywriting_templates', status: 'data_initialized' })
    }
    
    return {
      success: true,
      message: '数据库初始化完成',
      results
    }
    
  } catch (error) {
    console.error('数据库初始化失败:', error)
    return {
      success: false,
      error: error.message || '数据库初始化失败'
    }
  }
}