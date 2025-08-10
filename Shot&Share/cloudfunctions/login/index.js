// 登录云函数
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 保存或更新用户信息
 * @param {Object} userInfo 用户信息
 * @returns {Promise<Object>} 用户记录
 */
async function saveOrUpdateUser(userInfo) {
  try {
    const { OPENID } = cloud.getWXContext()
    
    // 查找现有用户
    const existingUser = await db.collection('users')
      .where({
        openid: OPENID
      })
      .get()
    
    const userData = {
      openid: OPENID,
      lastLoginAt: new Date(),
      updatedAt: new Date()
    }
    
    // 如果提供了用户信息，则更新
    if (userInfo) {
      userData.nickname = userInfo.nickName
      userData.avatar = userInfo.avatarUrl
      userData.gender = userInfo.gender
      userData.city = userInfo.city
      userData.province = userInfo.province
      userData.country = userInfo.country
      userData.language = userInfo.language
    }
    
    if (existingUser.data.length > 0) {
      // 更新现有用户
      await db.collection('users')
        .doc(existingUser.data[0]._id)
        .update({
          data: userData
        })
      
      return {
        ...existingUser.data[0],
        ...userData
      }
    } else {
      // 创建新用户
      userData.createdAt = new Date()
      userData.preferences = {
        favoriteStyles: [],
        defaultStyle: '文艺治愈',
        autoSave: true
      }
      userData.statistics = {
        totalGenerated: 0,
        totalSaved: 0,
        totalShared: 0
      }
      
      const result = await db.collection('users').add({
        data: userData
      })
      
      return {
        _id: result._id,
        ...userData
      }
    }
  } catch (error) {
    console.error('保存用户信息失败:', error)
    throw error
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const { userInfo } = event
    
    console.log('用户登录:', { openid: wxContext.OPENID, userInfo })
    
    // 保存或更新用户信息
    const user = await saveOrUpdateUser(userInfo)
    
    return {
      success: true,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
      user: user
    }
    
  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      error: error.message || '登录失败'
    }
  }
}