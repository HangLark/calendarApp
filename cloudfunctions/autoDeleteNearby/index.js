// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  let now = new Date();
  let day = now.toISOString().substring(0, 10)//今日日期
  let taskRes = await db.collection('nearbySchedule').where({//在cards中找出所有date为今天且没有发送过的记录
    beginDate: day,
  }).get();

  let tasks = taskRes.data;



  try {
    for (let i = 0; i < tasks.length; i++) {
      var d = new Date(tasks[i].beginDate + " " + tasks[i].beginTime);
      if (d.getTime() - 28800000 <= now.getTime()) {//（要减时差）如果此条记录的时间小于等于当前时间，则需要被删除
        db.collection('nearbySchedule').doc(tasks[i]._id).remove({
  
        })
      }
    }
  } catch (e) {
    console.log(e)
  }

}