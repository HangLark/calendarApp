// pages/group/groupShare/groupShare.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    joinButtonContent:'加入',
    joined:false,

    createrOpenid:'',
    createrUserInfo:{},
    sharedGroupId: '',
    group: {},
    memberCount:-1,
    memberAvatars:[],

    pswInput:false,
    iptValue: "",
    isFocus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      sharedGroupId: options.eventId
    })
    var _this = this;
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid);
        var id = _this.data.sharedGroupId;
        const db = wx.cloud.database();
        db.collection("Group").doc(id).get({
          success: res => {
            console.log(res.data);
            _this.setData({
              createrOpenid: res.data._openid,
              group: res.data,
              memberCount:res.data.members.length
            })
            db.collection("User").where({
              _openid:_this.data.createrOpenid
            }).get({
              success: res => {
                console.log('这里55');
                console.log(res.data[0]);
                _this.setData({
                  createrUserInfo:res.data[0]
                })
              },
              fail:res=>{
                console.log('Get UserInfo Failed');
              }
            })
            //Get Member Avatars res.data.members
            this.getMemberAvatars(res.data.members).then(res=>{
              console.log('完毕');
              this.setData({
                memberAvatars:res
              })
            })
            if (res.data.members.includes(wx.getStorageSync('openid'))){
              this.setData({
                joinButtonContent: '您已加入此群组',
                joined: true,
              })
            }
          },
          fail:res=>{
            console.log("fail-49")
          }
        })
      }
    })
  },

  async getMemberAvatars(members) {
    const db = wx.cloud.database();
    var j=0;
    var len = members.length;
    if(len>4)
      len=4;
    var avatars=[];
    for(j=0;j<len;j++){
      await db.collection("User").where({
              _openid:members[j]
            }).get()
      .then(ress=>{
        avatars.unshift(ress.data[0].userInfo.avatarUrl);
      })
    }
    return avatars;
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
  onShareAppMessage: function () {

  },
  joinGroup:function(e){
    var groupId = this.data.sharedGroupId;
    if(this.data.group.private){
      console.log(this.data.group.psw);
      this.setData({
        pswInput:true
      })
      return;
    }
    var openid=wx.getStorageSync('openid');
    var _this=this;
    const db = wx.cloud.database();
    const _ = db.command
    //Add User to Group
    db.collection("Group").doc(groupId).update({
      data:{
        members: _.unshift(openid)
      },
      success: res => {
        console.log('*****Join succeed----Group')
      }
    })
    //Add Group to User
    db.collection("User").where({
      _openid:wx.getStorageSync('openid')
    }).update({
      data: {
        joinedGroup: _.unshift(groupId)
      },
      success: res => {
        console.log('*****Join succeed----User')
        wx.showToast({
          title: '加入成功',
        })
        wx.switchTab({
          url: '../groupIndex/groupIndex',
        })
      }
    })
  },
  onFocus: function (e) {
    var that = this;
    that.setData({ isFocus: true });
  },
  setValue: function (e) {
    var that = this;
    that.setData({ iptValue: e.detail.value });
  },
  examine:function(e){
    var groupId = this.data.sharedGroupId;
    if(this.data.iptValue==this.data.group.psw){
      console.log(this.data.iptValue);
      var openid=wx.getStorageSync('openid');
      var _this=this;
      const db = wx.cloud.database();
      const _ = db.command
      //Add User to Group
      db.collection("Group").doc(groupId).update({
        data:{
          members: _.unshift(openid)
        },
        success: res => {
          console.log('*****Join succeed----Group')
        }
      })
      //Add Group to User
      db.collection("User").where({
        _openid:wx.getStorageSync('openid')
      }).update({
        data: {
          joinedGroup: _.unshift(groupId)
        },
        success: res => {
          console.log('*****Join succeed----User')
          wx.showToast({
            title: '加入成功',
          })
          wx.switchTab({
            url: '../groupIndex/groupIndex',
          })
        }
      })
    }
    else{
      wx.showToast({
        title:'密码错误'
      })
    }
  },
  close:function(e){
    this.setData({
      pswInput:false
    })
  }
})