// pages/group/groupIndex/groupIndex.js
const app = getApp()
Page({
  data: {
    //登录请求
    loggedOn:app.globalData.loggedOn,
    
    //首页所需
    createdGroups: [],
    joinedGroups:[],
    openid: '',
    userInfo:{},

    // 日期
    weekday: '',
    curMonth:'',
    Today:'',
    month:['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEPT','OCT','NOV','DEC'],
    week: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],

    //modal所需
    avatarUrls:[
      'cloud://test-ck0ws.7465-test-ck0ws-1301724922/src/住房.png',
      'cloud://test-ck0ws.7465-test-ck0ws-1301724922/src/运动.png',
      'cloud://test-ck0ws.7465-test-ck0ws-1301724922/src/娱乐.png',
      'cloud://test-ck0ws.7465-test-ck0ws-1301724922/src/学习.png',
      'cloud://test-ck0ws.7465-test-ck0ws-1301724922/src/书籍.png',
      'cloud://test-ck0ws.7465-test-ck0ws-1301724922/src/社交.png',
      'cloud://test-ck0ws.7465-test-ck0ws-1301724922/src/亲友.png',
      'cloud://test-ck0ws.7465-test-ck0ws-1301724922/src/其他.png',
      'cloud://test-ck0ws.7465-test-ck0ws-1301724922/src/旅行.png',
      'cloud://test-ck0ws.7465-test-ck0ws-1301724922/src/捐赠.png',
      'cloud://test-ck0ws.7465-test-ck0ws-1301724922/src/兼职.png',
      'cloud://test-ck0ws.7465-test-ck0ws-1301724922/src/办公.png'
    ],
    showModal:false,
    name: '',
    description: '',
    psw: '',
    privateSwitch: false,
    avatarSwitch: true,
    groupAvatar:'',
    currentAvatar:-1,

    //Input
    iptValue: "",
    isFocus: false,

    //动画
    currentCGroup:-1,
    currentJGroup:-1,
    groupAnimation:'bounce'
  },
  testSubs:function(e){
    wx.requestSubscribeMessage({
      tmplIds: ['D7yEE6kc3dXsqb4JciR3sunbl6lM-L8XMTgBD2pYcVs'], // 此处可填写多个模板 ID，但低版本微信不兼容只能授权一个
      success (res) {
        console.log(res)
      }
    })
  },
  testSend:function(e){
    wx.cloud.callFunction({
      name: 'sendMessage',
      data:{
        openid:this.data.openid,
        title:"test",
        time:"2020-04-18 23:59"
      },
      complete: res => {
        console.log('callFunction test result: ', res)
      }
    })
  },
  showCreate: function (e) {
    var op = e.currentTarget.dataset.op;
    this.modalMotion(op)
  },
  modalMotion: function (op) {//Create New Group
    var animation = wx.createAnimation({
      duration: 400,  
      timingFunction: "ease"
    });
    this.animation = animation;

    animation.opacity(0).scale(0.3).translate(0,700).step();

    this.setData({
      animationData: animation.export()
    })

    setTimeout(function () {
      animation.opacity(1).scale(1).translate(0,0).step();
      this.setData({
        animationData: animation
      })

      if (op == "close") {
        this.setData({
        	name: '',
    		  description: '',
    		  psw: '',
    		  privateSwitch: false,
        	showModal: false,
          avatarSwitch: true,
          groupAvatar:this.data.userInfo.avatarUrl,
          currentAvatar:-1
        });
      }
      if(op=="create"){//After tap create
      	this.setData({
         	showModal: false
        });

        var groupUrl=this.data.groupAvatar;
        if(this.data.avatarSwitch==true){
          groupUrl=this.data.userInfo.avatarUrl
        }
        console.log(this.data.groupAvatar);

        const db = wx.cloud.database();
        db.collection('Group').add({
          data: {
            name: this.data.name,
            description: this.data.description,
            private: this.data.privateSwitch,
            psw: this.data.psw,
            groupAvatar:groupUrl,
            members: []
          },
          success: res => {
          	db.collection('Group').where({//Upadte Group List
          		_openid:this.data.openid
          	}).get({
          		success:res=>{
          			this.setData({
          				createdGroups:res.data
          			})
          		}
          	})
            wx.showToast({
              title: '新增记录成功',
            })
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '新增记录失败'
            })
            console.error('[数据库] [新增记录] 失败：', err)
          }
        })

      }
    }.bind(this), 400)

    if (op == "open") {
      this.setData({
        showModal: true
      });
    }
  },
  avatarClick:function(e){
    var index=e.currentTarget.dataset.index;
    this.setData({
      currentAvatar: index,
      groupAvatar:this.data.avatarUrls[index]
    })
  },
  onLoad: function (options) {
    if(!wx.getStorageSync('loggedOn')){
      wx.redirectTo({
        url: '../../logOn/logOn',
      })
    }
    this.setData({
      openid: wx.getStorageSync('openid'),
      userInfo:wx.getStorageSync('userInfo')
    })


    // 显示日期
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    var M = date.getMonth();
    var D = date.getDate();
    var today=new Date().getDay(); 
    this.setData({
      curMonth:this.data.month[M],
      Today:D,
      weekday: this.data.week[today]
    })

    var _this = this;
    const db = wx.cloud.database();
    //Query Created Groups
    db.collection('Group').where({
      _openid: wx.getStorageSync('openid')
    }).get({
      success: res => {
        this.setData({
          createdGroups: res.data
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
      }
    });
    //Query Joined Groups
    db.collection('User').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        this.getJoinedGroup(res).then(res=>{
          console.log('完毕');
          this.setData({
            joinedGroups:res
          })
        })
        
      },
      fail: err => {
        console.log('142-fail')
      }
    });
    //Show Group Avatar


    

  },
  async getJoinedGroup(res) {
    const db = wx.cloud.database();
    var j=0;
    var len = res.data[0].joinedGroup.length;
    var groups=[];
    for(j=0;j<len;j++){
      await db.collection("Group").doc(res.data[0].joinedGroup[j]).get().then(ress=>{
        console.log(ress.data);
        groups.unshift(ress.data);
      })
    }
    return groups;
  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onLoad();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var eventId = res.target.dataset.id;
    var path = "/pages/group/groupShare/groupShare?eventId=" + eventId
    console.log(eventId);
    console.log(path);
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      title: '分享群组',
      path: path,
      success: function (res) {
        console.log(path);
      },
      fail: function (res) {
        console.log(path);
      }
    }
  },
  inputTitle:function(e){
    this.setData({
      name:e.detail.value
    })
  },
  inputComment:function(e){
    this.setData({
      description:e.detail.value
    })
  },
  inputPassword:function(e){
    this.setData({
      psw:e.detail.value
    })
  },
  privateSwitchChange: function (e) {
    this.setData({
      privateSwitch: e.detail.value
    })
  },
  avatarSwitchChange: function (e) {
    this.setData({
      avatarSwitch: e.detail.value
    })
  },
  discardGroup:function(e){
    wx.cloud.callFunction({
      name: 'discardGroup',
      data: {
        "groupId": e.currentTarget.dataset.id
      }
    }).then(res=>{console.log})

    const db = wx.cloud.database();
    db.collection('Group').doc(e.currentTarget.dataset.id).remove({
      success:res=>{
        db.collection('Group').where({
          _openid: this.data.openid
        }).get({
          success: res => {
            this.setData({
              createdGroups: res.data
            })
          },
        });
        wx.showToast({
          title:"已解散"
        })
      }
    })
  },
  discardGroupXXX:function(e){
    var eventId = e.currentTarget.dataset.id;
    var joinedGroup=[];
    const db = wx.cloud.database();
    //Clear "User" "joinedGroup"
    db.collection('User').where({

    }).get({
      success:res=>{
        // this.discardGroups(res,eventId).then(res=>{
        //   console.log('Clear "User" "joinedGroup" 完毕'+res);
        // })

        // joinedGroup=res.data[0].joinedGroup;
        // var index=joinedGroup.indexOf(eventId);
        // joinedGroup.splice(index,1);
        // db.collection('User').where({
        //   _openid: this.data.openid
        // }).update({
        //   data:{
        //     joinedGroup:joinedGroup
        //   },
        //   success:res=>{
            
        //   }
        // })
      }
    })
    //Delete the target group from "Group"
    db.collection('Group').doc(eventId).remove({
      success:res=>{
        db.collection('Group').where({
          _openid: this.data.openid
        }).get({
          success: res => {
            this.setData({
              createdGroups: res.data
            })
          },
        });
        wx.showToast({
          title:"已解散"
        })
      }
    })
  },
  async discardGroups(res,eventId) {
    const db = wx.cloud.database();
    var j=0;
    var len = res.data.length;
    var groups=[]; var count=0;
    for(j=0;j<len;j++){
      var joinedGroup=res.data[j].joinedGroup;
      var id=res.data[j]._openid;
      var index=joinedGroup.indexOf(eventId);
      if(index!=-1){
        joinedGroup.splice(index,1);
        await db.collection('User').where({
          _openid: id
        }).update({
          data:{
            joinedGroup:joinedGroup
          },
          success: function(res) {
            console.log(id);count++;
          }
        })
      }
    }
    return count
  },
  leaveGroup:function(e){
    var eventId = e.currentTarget.dataset.id;
    var joinedGroup=[];
    var members=[];
    const db = wx.cloud.database();
    db.collection('User').where({
      _openid: this.data.openid
    }).get({
      success:res=>{
        joinedGroup=res.data[0].joinedGroup;
        var index=joinedGroup.indexOf(eventId);
        joinedGroup.splice(index,1);
        db.collection('User').where({
          _openid: this.data.openid
        }).update({
          data:{
            joinedGroup:joinedGroup
          },
          success:res=>{
            
          }
        })
      }
    })
    db.collection('Group').doc(eventId).get({
      success:res=>{
        members=res.data.members;
        var index=members.indexOf(eventId);
        members.splice(index,1);
        db.collection('Group').doc(eventId).update({
          data:{
            members:members
          },
          success:res=>{
            //Query Joined Groups
            db.collection('User').where({
              _openid: this.data.openid
            }).get({
              success: res => {
              this.getJoinedGroup(res).then(res=>{
                console.log('完毕');
                this.setData({
                  joinedGroups:res
                })
              })
              },
              fail: err => {
                console.log('142-fail')
              }
            });
            wx.showToast({
              title:"退出成功"
            })
          }
        })
      }
    })
  },
  testShare: function (e) {
    var eventId = e.currentTarget.dataset.title;
    var path = "/pages/group/groupShare/groupShare?eventId=" + eventId;
    wx.navigateTo({
      url: path
    })
  },
  longPressC:function(e){
    var data=e;
    var index=e.currentTarget.dataset.index
    console.log(index);
    this.setData({
      currentCGroup:index
    })
    var _this=this;
    wx.showModal({
      title: '确认解散群组吗？',
      content: '此操作不可撤销',
      success (res) {
        _this.setData({
          currentCGroup:-1
        })
        if (res.confirm) {
          _this.discardGroup(data);
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  longPressJ:function(e){
    var data=e;
    var index=e.currentTarget.dataset.index
    console.log(index);
    this.setData({
      currentJGroup:index
    })
    var _this=this;
    wx.showModal({
      title: '确认退出此群组吗？',
      content: '可以联系群主再次加入',
      success:function (res) {
        _this.setData({
          currentJGroup:-1
        })
        console.log(data);
        if (res.confirm) {
          _this.leaveGroup(data);
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  enterGroup:function(e){
    //Subscribe Notification
    wx.requestSubscribeMessage({
      tmplIds: ['D7yEE6kc3dXsqb4JciR3sunbl6lM-L8XMTgBD2pYcVs'], // 此处可填写多个模板 ID，但低版本微信不兼容只能授权一个
      success (res) {
        console.log('233'+res)
      }
    })
    var groupId=e.currentTarget.dataset.groupinfo._id;
    var authority=e.currentTarget.dataset.authority;
    var name=e.currentTarget.dataset.name;
    var path = "/pages/group/groupEvents/groupEvents?groupId=" + groupId+"&authority="+authority+"&name="+name;
    wx.navigateTo({
      url: path
    })
  },
  onFocus: function (e) {
    var that = this;
    that.setData({ isFocus: true });
  },
  setValue: function (e) {
    var that = this;
    that.setData({ psw: e.detail.value });
  }
})