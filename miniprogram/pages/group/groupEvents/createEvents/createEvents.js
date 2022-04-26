const app = getApp()
const util = require('../../../daily/util.js');
// pages/createCard/createCard.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:"提醒事项",
    date:"2020-01-01",
    time:"23:59",
    leftTime: '',
    timer: '',
    color1: ['red', 'orange', 'yellow', 'olive', 'green', 'cyan', 'blue', 'purple', 'mauve', 'pink', 'brown', 'black', 'gradual-pink', 'gradual-purple', 'gradual-blue', 'gradual-green','gradual-orange'],
    color2: ['嫣红', '桔橙', '明黄', '橄榄', '森绿', '天青', '海蓝', '姹紫', '木槿', '桃粉', '棕褐', '墨黑', '霞彩', '惑紫', '靛青', '翠柳','鎏金'],
    colorSelected:0,
    comment:"无",
    groupId:'',

    group: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id=options.groupId;
    console.log(id)
    let that = this;
    const db = wx.cloud.database();
    //初始化date为今天的日期
    var d=new Date();
    that.setData({
      date:d.toISOString().substring(0,10),
      groupId:id
    });
    var left = util.getTimeLeft(that.data.date.replace(/-/g, '/') + " " + that.data.time);
    this.setData({
      leftTime: left
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var id = this.data.groupId;
    const db = wx.cloud.database();
    db.collection("Group").doc(id).get({
      success: res => {
        console.log(res.data);
        this.setData({
          group: res.data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var left = '';
    let that = this;
    that.data.timer = setInterval(() => {
      left = util.getTimeLeft(that.data.date.replace(/-/g, '/') + " " + that.data.time);
      that.setData({
        leftTime: left
      });
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.timer);
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

  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    });
  },

  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    });
  },

  titleInput:function(e){
    this.setData({
      title: e.detail.value
    });
  },

  
//将本次设置的提醒日程加入数据库
  addCard:function(){
    const db = wx.cloud.database();
    let that = this;
    const pages = getCurrentPages();
    const previouspage = pages[pages.length-2];


//请求用户订阅一次 
      let id = 'D7yEE6kc3dXsqb4JciR3sunbl6lM-L8XMTgBD2pYcVs'; // 订阅消息模版id

      db.collection("groupEvent").add({
        data: {
          _groupId:that.data.groupId,
          title: that.data.title,
          date: that.data.date,
          time: that.data.time,
          backgroundColor:that.data.color1[that.data.colorSelected],
          overdue: false,
          comment:that.data.comment
        },
        success: res => {
          //Send notification to group members
          wx.cloud.callFunction({
            name: 'groupNotification',
            data:{
              openid:'owT885N1DJf36xD76uT-ytTmybEo',
              groupName:that.data.group.name,
              groupMember:that.data.group.members,
              title:that.data.title,
              time:that.data.date+" "+that.data.time,
              comment:that.data.comment
            },
            complete: res => {
              console.log('callFunction test result: ', res)
            }
          })

          wx.showToast({
            title: '添加日程成功',
            duration:1000,
          })
          console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)

          //更新上一页的数据
          var cards=previouspage.data.cards;
          var today = previouspage.data.today;
          var year = previouspage.data.Y;
          var month = previouspage.data.M; 
          var day = previouspage.data.D;
          if(year+"-"+month+"-"+day==that.data.date){
            today++;
          }
          var card={_id:res._id,
                    _openid: app.globalData.openid,
                    backgroundColor: that.data.color1[that.data.colorSelected],
                    date: that.data.date,
                    overdue: false,
                    title: that.data.title,
                    time: that.data.time,
                    comment:that.data.comment
                    }
          cards.unshift(card);
          console.log(cards);
          var hide = previouspage.data.hidden;
          hide.unshift(true);
          previouspage.setData({
            cards:cards,
            hidden:hide,
            today:today
          })
          setTimeout(function(){
            wx.navigateBack({
              
            })
          },1000)

        }
      })
  },
    

/////////////////发通知测试//////////////////////////////////
  testMessage:function(){
    wx.cloud.callFunction({
      name:"sendMessage",
      data:{
        openid:app.globalData.openid
      }
    }).then(console.log)
  },
////////////////////////////////////////////////////////////
  
//取消天日程，直接返回上级页面
  cancel:function(){
    wx.navigateBack({
      
    })
  },
//选择卡片颜色
  changeColor:function(e){
    let that=this;
    that.setData({
      colorSelected: e.detail.value
    })
  },

  changeComment:function(e){
    let that=this;
    that.setData({
      comment:e.detail.value
    })
  }

})