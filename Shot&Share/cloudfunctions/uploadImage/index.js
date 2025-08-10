// 云函数入口文件
const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('图片上传云函数开始执行:', event)
  
  try {
    const { fileBuffer, fileName, userId } = event
    
    // 参数验证
    if (!fileBuffer) {
      throw new Error('文件内容不能为空')
    }
    
    if (!userId) {
      throw new Error('用户ID不能为空')
    }
    
    if (!fileName) {
      throw new Error('文件名不能为空')
    }
    
    // 验证文件类型
    if (!isValidImageType(fileName)) {
      throw new Error('不支持的图片格式，请上传 jpg、png、gif、webp 或 bmp 格式的图片')
    }
    
    // 验证文件大小
    if (!isValidFileSize(fileBuffer)) {
      throw new Error('图片大小不能超过10MB')
    }
    
    // 生成唯一文件名
    const timestamp = Date.now()
    const randomStr = crypto.randomBytes(8).toString('hex')
    const fileExtension = getFileExtension(fileName) || 'jpg'
    const cloudFileName = `images/${userId}/${timestamp}_${randomStr}.${fileExtension}`
    
    console.log('开始上传文件到云存储:', cloudFileName)
    
    // 上传文件到云存储
    const uploadResult = await cloud.uploadFile({
      cloudPath: cloudFileName,
      fileContent: Buffer.from(fileBuffer, 'base64')
    })
    
    console.log('文件上传成功:', uploadResult.fileID)
    
    // 获取临时访问链接
    const tempUrlResult = await cloud.getTempFileURL({
      fileList: [uploadResult.fileID]
    })
    
    const tempUrl = tempUrlResult.fileList[0].tempFileURL
    
    console.log('获取临时链接成功:', tempUrl)
    
    // 保存上传记录到数据库
    const db = cloud.database()
    
    // 确保集合存在
    try {
      await db.collection('upload_records').limit(1).get()
    } catch (error) {
      if (error.errCode === -502005) {
        // 集合不存在，先尝试添加一条记录来自动创建集合
        console.log('upload_records集合不存在，将在添加记录时自动创建')
      }
    }
    
    const uploadRecord = {
      userId,
      fileId: uploadResult.fileID,
      fileName: fileName || 'unknown',
      cloudPath: cloudFileName,
      tempUrl,
      uploadTime: new Date(),
      fileSize: Buffer.from(fileBuffer, 'base64').length
    }
    
    await db.collection('upload_records').add({
      data: uploadRecord
    })
    
    console.log('上传记录保存成功')
    
    return {
      success: true,
      data: {
        fileId: uploadResult.fileID,
        tempUrl,
        cloudPath: cloudFileName
      }
    }
    
  } catch (error) {
    console.error('图片上传失败:', error)
    
    return {
      success: false,
      error: error.message || '图片上传失败，请重试'
    }
  }
}

/**
 * 获取文件扩展名
 */
function getFileExtension(fileName) {
  if (!fileName) return null
  
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1) return null
  
  return fileName.substring(lastDotIndex + 1).toLowerCase()
}

/**
 * 验证文件类型
 */
function isValidImageType(fileName) {
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
  const extension = getFileExtension(fileName)
  
  return extension && validExtensions.includes(extension)
}

/**
 * 验证文件大小（10MB限制）
 */
function isValidFileSize(fileBuffer) {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const fileSize = Buffer.from(fileBuffer, 'base64').length
  
  return fileSize <= maxSize
}