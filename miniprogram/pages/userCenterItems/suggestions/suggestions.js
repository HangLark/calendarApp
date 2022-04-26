// pages/userCenterItems/suggestions/suggestions.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    basicsList: [{
      icon: 'usefullfill',
      name: '开始'
    }, {
      icon: 'radioboxfill',
      name: '等待'
    }, {
        icon: 'usefullfill',
      name: '错误'
    }, {
      icon: 'roundcheckfill',
      name: '完成'
    },],
    basics: 0,
    numList: [{
      name: '差评'
    }, {
      name: '一般'
    }, {
      name: '不错'
    }, {
      name: '很好'
    },],
    num: 0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  numSteps() {
    this.setData({
      num: this.data.num == this.data.numList.length - 1 ? 0 : this.data.num + 1
    })
  },


  ok:function(e){
    setTimeout(function () {
      wx.navigateBack({

      })
    }, 1000);
    wx.showToast({
      title: '谢谢您的建议',
      duration:1000
    })

  }
})