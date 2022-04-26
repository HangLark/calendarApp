// pages/shareDaily/shareDaily.js
const app = getApp();
const util = require('../daily/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'',
    date:'',
    time:'',
    backgroundColor:'',
    leftTime:'',
    timer:'',
    comment:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取用户的openid,存在app.globalData.openid
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })


    this.setData({
      title:options.title,
      date:options.date,
      time:options.time,
      backgroundColor: options.backgroundColor,
      comment:options.comment
    });
    var left = util.getTimeLeft(options.date.replace(/-/g, '/') + " " + options.time);
    this.setData({
      leftTime:left
    })
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
    var left='';
    let that=this;
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

  addCard: function () {
    const db = wx.cloud.database();
    let that = this;


    //请求用户订阅一次 
    let id = 'D7yEE6kc3dXsqb4JciR3sunbl6lM-L8XMTgBD2pYcVs'; // 订阅消息模版id
    if (wx.requestSubscribeMessage) {
      wx.requestSubscribeMessage({
        tmplIds: [id],
        success(res) {
          if (res[id] == 'accept') {
            //用户同意了订阅，添加进数据库
            db.collection("cards").add({
              data: {
                title: that.data.title,
                date: that.data.date,
                time: that.data.time,
                backgroundColor: that.data.backgroundColor,
                overdue: false,
                comment:that.data.comment
              },
              success: res => {
                wx.showToast({
                  title: '添加日程成功,请返回主页',
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



          } else {
            //用户拒绝了订阅或被禁用订阅消息
            wx.showToast({
              title: '订阅失败',
              icon: "none"
            })
          }
        },
        fail(res) {
          console.log(res)
        },
        complete(res) {
          console.log(res)
        }
      })
    } else {
      // 兼容处理
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }


  },

  changeComment: function (e) {
    this.setData({
      comment: e.detail.value
    })
  }
})