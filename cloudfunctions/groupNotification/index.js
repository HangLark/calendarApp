// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
    var length=event.groupMember.length;
    var j=0;
    for(j=0;j<length;j++){
      try{
        const result = await cloud.openapi.subscribeMessage.send({
          page:'pages/group/groupIndex/groupIndex',
          // touser: event.openid,
          touser: event.groupMember[j],
          lang: 'zh_CN',
          data: {
            name1: {
              value: event.groupName
            },
            thing3: {
              value: event.title
            },
            date8: {
              value: event.time
            },
            thing9: {
              value: event.comment
            }
          },
          templateId: 'D7yEE6kc3dXsqb4JciR3sunbl6lM-L8XMTgBD2pYcVs',
          miniprogramState: 'developer'
        })
      }catch (err) {
        console.log(event.groupMember[j]+"发送订阅失败"+err)
      }
    }

    return 1
}