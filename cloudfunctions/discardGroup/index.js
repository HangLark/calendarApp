// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
	const db = cloud.database();
	var userList = await(db.collection('User').where({}).get());
	userList=userList.data;
	var len = userList.length; console.log("userList Length: "+len);
	
	//var eventId="81206f415ee2567c000054737eda90d6";
	var eventId=event.groupId;

	for(var j=0;j<len;j++){
		console.log("------------------------");
	  var joinedGroup=userList[j].joinedGroup; console.log("This is No."+j); console.log(joinedGroup);
	  var id=userList[j]._openid; console.log("Target openid:  "+id);
	  var index=joinedGroup.indexOf(eventId); console.log("Result:"+index);
	  if(index!=-1){
	  	console.log("Has Taeget:"+index);
	  	joinedGroup.splice(index,1); console.log(joinedGroup);
	  	await db.collection('User').where({
          _openid: id
        }).update({
          data:{
            joinedGroup:joinedGroup
          },
          success: function(res) {

          }
        })
	  }
	}
	
  	const wxContext = cloud.getWXContext();

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}