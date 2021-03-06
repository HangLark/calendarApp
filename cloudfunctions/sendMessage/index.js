// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      page:'page/index/index',
      touser: event.openid,
      lang: 'zh_CN',
      data: {
        name1: {
          value: '提醒助手'
        },
        thing3: {
          value: event.title
        },
        date8: {
          value: event.time
        },
        thing9: {
          value: '测试备注'
        }
      },
      templateId: 'yODqVjfxb5hQQ8DERZ6cz-LHd4x0AZzmFu9DLqlope4',
      miniprogramState: 'developer'
    })
    console.log(result)
    return result
  } catch (err) {
    console.log("发送订阅失败"+err)
    return err
  }
}