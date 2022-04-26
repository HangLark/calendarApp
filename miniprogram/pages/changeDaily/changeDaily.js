// pages/changeDaily/changeDaily.js
const app = getApp();
const util = require('../daily/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _id:'',
    title: '',
    date: '',
    time: '',
    backgroundColor: '',
    leftTime: '',
    timer: '',
    today:'',
    index:'',//修改的日程在首页中的index
    comment:"",
    isToday: 'false',
    YMD:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      _id:options._id,
      title: options.title,
      date: options.date,
      time: options.time,
      index:options.index,
      backgroundColor: options.backgroundColor,
      comment:options.comment,
      isToday:options.isToday,
      YMD:options.ymd
    });
    var left = util.getTimeLeft(options.date.replace(/-/g, '/') + " " + options.time);
    this.setData({
      leftTime: left
    });
    var d = new Date();
    this.setData({
      today: d.toISOString().substring(0, 10)
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

  //取消修改，直接返回上级页面
  cancel:function(){
    wx.navigateBack({
      
    })
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

  titleInput: function (e) {
    this.setData({
      title: e.detail.value
    });
  },

  //确认修改日程
  changeCard:function(){
    const db = wx.cloud.database();
    let that = this;
    const pages = getCurrentPages();
    const previouspage = pages[pages.length - 2];

    //首先要在数据库中修改数据
    db.collection('cards').doc(that.data._id).update({
      data:{
        title:that.data.title,
        date: that.data.date,
        time: that.data.time,
        borderColor: that.data.borderColor,
        comment:that.data.comment
      },
      success:res=>{
        console.log('日程在数据库更新成功',res)
        //改变首页显示的对应日程
        var cards1 = previouspage.data.cards;
        var today=previouspage.data.today;
        if(that.data.isToday=='true' && that.data.date != that.data.YMD){
          today--;
        }else if(that.data.isToday=='false' && that.data.date == that.data.YMD){
          today++;
        }
        cards1[that.data.index].title = that.data.title;
        cards1[that.data.index].date = that.data.date;
        cards1[that.data.index].time = that.data.time;
        cards1[that.data.index].borderColor = that.data.borderColor;
        cards1[that.data.index].comment = that.data.comment;
        cards1.sort(function (a, b) {
          return Date.parse(a.date.replace(/-/g, '/') + ' ' + a.time + ':00') - Date.parse(b.date.replace(/-/g, '/') + ' ' + b.time + ':00')
        })
        previouspage.setData({
          cards: cards1,
          today:today
        });
        wx.showToast({
          title: '修改日程成功',
          duration: 1000,
        });
        setTimeout(function () {
          wx.navigateBack({

          })
        }, 1000)
      },
      fail:err=>{
        console.log('日程在数据库更新失败', err)
      }
    })
  },

  changeComment:function(e){
    this.setData({
      comment:e.detail.value
    })
  }
})