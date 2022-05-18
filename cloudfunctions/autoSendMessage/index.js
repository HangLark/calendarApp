// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const execTasks=[]//待发送消息
  let now=new Date();
  let day=now.toISOString().substring(0,10)//今日日期
  let taskRes = await db.collection('cards').where({//在cards中找出所有date为今天且没有发送过的记录
      date:day,
      overdue:false
    }).get();
  
  let tasks=taskRes.data;

//////////
  console.log("tasks.length=" + tasks.length)
/////////

  try{
    for(let i=0;i<tasks.length;i++){
      var d=new Date(tasks[i].date+" "+tasks[i].time);
      if(d.getTime()-28800000<=now.getTime()){//（要减时差）如果此条记录的时间小于等于当前时间，则需要被发送
        execTasks.push(tasks[i]); //将这条记录存入待执行栈
        await db.collection('cards').doc(tasks[i]._id).update({//把这条记录的overdue设置为true
          data:{
            overdue:true
          },
          success:res=>{
            console.log('更改记录成功')
          },
          fail:err=>{
            console.log("更新记录失败"+err)
          }
        })
      }
    }
  }catch(e){
    console.log(e)
  }

  for(let i=0;i<execTasks.length;i++){
   try {
      const result = await cloud.openapi.subscribeMessage.send({
        touser: execTasks[i]._openid,
        lang: 'zh_CN',
        // data: {
        //   name1: {
        //     value: '提醒助手'
        //   },
        //   thing3: {
        //    value: execTasks[i].title
        //   },
        //   date8: {
        //     value: execTasks[i].date + ' ' + execTasks[i].time
        //   },
        //   thing9: {
        //     value: execTasks[i].comment
        //   }
        // },
        data: {
          thing5: {
           value: execTasks[i].title
          },
          date4: {
            value: execTasks[i].date + ' ' + execTasks[i].time
          },
          thing11: {
            value: execTasks[i].comment
          }
        },
        //templateId: 'D7yEE6kc3dXsqb4JciR3sunbl6lM-L8XMTgBD2pYcVs',
        templateId: 'yODqVjfxb5hQQ8DERZ6cz-LHd4x0AZzmFu9DLqlope4',
        miniprogramState: 'developer'
      })
     console.log(result)
    } catch (err) {
     console.log("发送订阅失败" + err)
      return err
    }
  }
}