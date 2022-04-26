// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database();
  var id = event.eventid;
  var openid = wxContext.OPENID;
  console.log(wxContext)
  console.log(openid)
  var headImage = "";
  await db.collection('User').where({
    _openid: openid
  }).get().then(res => {
    headImage = res.data[0].userInfo.avatarUrl;
  })
  var headArray = [];
  await db.collection('nearbySchedule').where({
    _id: id,
  }).get().then(res => {
    headArray = res.data[0].userhead;

  })
  //添加和删除不同的操作
  console.log(event.type=='delete')
  if (event.type == 'delete') {
    console.log('删除头像操作')
    headArray.splice(headArray.indexOf(headImage), 1);
  } else {
    console.log('新建头像操作')
    headArray.push(headImage);
  }
  console.log(headArray);
  var logggg;
  await db.collection("nearbySchedule").where({
    _id: id,
  }).update({
    data: {
      userhead: headArray
    }
  }).then(res => {
    console.log(res)
    logggg=res;
  })
  return {
    event,
    logggg: logggg,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}