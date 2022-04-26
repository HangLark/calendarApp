// pages/userCenter/userCenter.js
Page({

  data: {
    openid: '',
    userInfo: ''
  },

  onLoad: function(options) {
    var id = wx.getStorageSync('openid');
    var userinfo = wx.getStorageSync('userInfo')
    this.setData({
      openid: id,
      userInfo: userinfo
    })
    const db = wx.cloud.database();
    db.collection('User').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        console.log('Has Registerd');
      },
      fail: err => {
        console.log('Not Registerd Yet');
        db.collection('User').add({
          data: {
            userInfo: this.data.userInfo
          },
          success: res => {
            wx.showToast({
              title: '登录成功',
            })
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '登录失败'
            })
            console.error('Create Failed', err)
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },


  historyDaily: function() {
    wx.navigateTo({
      url: '../userCenterItems/historyDaily/historyDaily',
      success: res => {
        console.log('redirect success:daily->historyDaily')
      }
    })
  },
  subscribeManage: function() {
    wx.navigateTo({
      url: '../userCenterItems/subscribeManage/subscribeManage',
      success: res => {
        console.log('redirect success:daily->subscribeManage')
      }
    })
  },
  suggestions: function() {
    wx.navigateTo({
      url: '../userCenterItems/suggestions/suggestions',
      success: res => {
        console.log('redirect success:daily->suggestions')
      }
    })
  },
  settings: function() {
    wx.openSetting({})

    //wx.navigateTo({
    //  url: '../userCenterItems/settings/settings',
    //  success: res => {
    //    console.log('redirect success:daily->settings')
    //  }
    //})
  },
  connectUs: function() {
    wx.navigateTo({
      url: '../userCenterItems/connectUs/connectUs',
      success: res => {
        console.log('redirect success:daily->connectUs')
      }
    })
  },
  help: function() {
    wx.navigateTo({
      url: '../userCenterItems/help/help',
      success: res => {
        console.log('redirect success:daily->connectUs')
      }
    })
  }


})