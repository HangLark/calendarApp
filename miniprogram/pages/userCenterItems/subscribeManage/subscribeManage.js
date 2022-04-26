// pages/doneSubscribe/doneSubscribe.js
const db = wx.cloud.database();
var userDoneinfo = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deleteInfo: "",
    moveupInfo: "",
    usersList: [],
  },
  //移动的动画和修改通知数据的关键位置，同subscribe部分方法同。
  moveItem(e) {
    var self = this;
    var index = userDoneinfo.indexOf(e.currentTarget.dataset.eventid)
    userDoneinfo.splice(index, 1);
    //更新订阅数据库
    db.collection('userSubscribe').where({
      openid: self.openid
    }).update({
      data: {
        subscribed: userDoneinfo
      }
    })
    //修改订阅通知数据库

    //删除动画
    self.setData({
      deleteInfo: e.currentTarget.dataset.eventid,
    })
    //上移动画
    var flag = false;
    var position;
    var remainList = this.data.usersList;
    for (var j = 0, len = remainList.length; j < len; j++) {
      if (flag == true && remainList[j]['hide'] != true) {
        remainList[j]['moveUp'] = true;
      }
      if (e.currentTarget.dataset.eventid == remainList[j]._id) {
        flag = true;
        position = j;
      }
    }
    self.setData({
      usersList: remainList,
      position: position
    })
    //数据的处理
    setTimeout(() => {
      var remainList = this.data.usersList;
      remainList[this.data.position]['hide'] = true;
      //remainList = remainList.filter(item => item._id != e.currentTarget.dataset.eventid)
      for (var j = 0, len = remainList.length; j < len; j++) {
        remainList[j]['moveUp'] = false;
      }
      self.setData({
        usersList: remainList,
      })
    }, 500)
  },
  //滑动手势
  slideStart(e) {
    this.setData({
      beginPos: e.changedTouches[0].clientX,
      beginPosY: e.changedTouches[0].clientY
    })
  },
  slideEnd(e) {
    console.log(e.changedTouches[0].clientX - this.data.beginPos)
    if (e.changedTouches[0].clientX - this.data.beginPos < -130 && Math.abs(e.changedTouches[0].clientY - this.data.beginPosY) < 150) {
      //向左移动相应的距离,且y方向上不超过一个块的高度150
      this.moveItem(e)
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getsublist();
  },
  async getsublist() {
    //获取当前用户的订阅数据
    var self = this;
    const _ = db.command;
    self.openid = wx.getStorageSync('openid');

    await db.collection('userSubscribe').where({
      openid: self.openid
    }).get().then(res => {
      //注意userDoneinfo为页面全局
      userDoneinfo = res.data[0].subscribed;
    }).catch(res => {
      //此处表示当前用户第一次使用订阅的数据库，需要新建记录
      userDoneinfo = [];
      db.collection('userSubscribe').add({
        data: {
          openid: self.openid,
          subscribed: []
        }
      })
    })
    await db.collection("subscribeList").where({
      _id: _.in(userDoneinfo)
    }).get().then(res => {
      self.setData({
        usersList: res.data
      })
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

  }
})