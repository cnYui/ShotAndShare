// 删除记录云函数
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { recordId } = event

  console.log('删除记录请求:', {
    openid: wxContext.OPENID,
    recordId: recordId
  })

  try {
    // 参数验证
    if (!recordId) {
      return {
        success: false,
        error: '记录ID不能为空'
      }
    }

    // 首先查询记录是否存在且属于当前用户
    const queryResult = await db.collection('copywriting_records')
      .where({
        _id: recordId,
        _openid: wxContext.OPENID
      })
      .get()

    if (queryResult.data.length === 0) {
      return {
        success: false,
        error: '记录不存在或无权限删除'
      }
    }

    const record = queryResult.data[0]
    console.log('找到要删除的记录:', record)

    // 删除记录
    const deleteResult = await db.collection('copywriting_records')
      .doc(recordId)
      .remove()

    console.log('删除结果:', deleteResult)

    // 如果记录有关联的图片文件，也需要删除
    if (record.imageFileId) {
      try {
        await cloud.deleteFile({
          fileList: [record.imageFileId]
        })
        console.log('关联图片文件删除成功:', record.imageFileId)
      } catch (fileError) {
        console.warn('删除关联图片文件失败:', fileError)
        // 图片删除失败不影响记录删除的成功
      }
    }

    return {
      success: true,
      message: '删除成功',
      deletedRecord: {
        _id: recordId,
        content: record.content,
        style: record.style,
        createTime: record.createTime
      }
    }

  } catch (error) {
    console.error('删除记录失败:', error)
    return {
      success: false,
      error: '删除失败: ' + error.message
    }
  }
}