const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { petName } = event;

  try {
    // 验证输入
    if (!petName || typeof petName !== 'string') {
      return {
        success: false,
        error: '宠物名字不能为空'
      };
    }

    const trimmedName = petName.trim();
    if (trimmedName.length === 0) {
      return {
        success: false,
        error: '宠物名字不能为空'
      };
    }

    if (trimmedName.length > 10) {
      return {
        success: false,
        error: '宠物名字不能超过10个字符'
      };
    }

    // 更新宠物名字
    const result = await db.collection('pets').where({
      _openid: wxContext.OPENID
    }).update({
      data: {
        name: trimmedName,
        updatedAt: new Date()
      }
    });

    if (result.stats.updated === 0) {
      return {
        success: false,
        error: '未找到宠物信息'
      };
    }

    return {
      success: true,
      message: '宠物名字更新成功',
      petName: trimmedName
    };

  } catch (error) {
    console.error('更新宠物名字失败:', error);
    return {
      success: false,
      error: '服务器错误，请稍后重试'
    };
  }
};