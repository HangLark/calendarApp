// pages/userCenterItems/historyDaily/historyDaily.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    historyDaily:[],
    showmodal:false,
    target:0,
    text:'',
    day:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    const db = wx.cloud.database();
    db.collection("cards").where({
      _openid: app.globalData.openid,
      overdue: true
    }).get({
      success:res=>{
        res.data.sort(function(a,b){
          return Date.parse(a.date.replace(/-/g, '/') + ' ' + a.time + ':00') - Date.parse(b.date.replace(/-/g, '/') + ' ' + b.time + ':00')
        })

        var preday='0';
        var day=[];
        for(var i=0;i<res.data.length;i++){
          if(preday!=res.data[i].date){
            preday = res.data[i].date;
            res.data[i].first=true;
          }else{
            res.data[i].first = false;
          }
        }

        that.setData({
          historyDaily: res.data
        })
        
      },
      fail: err => {
        console.log('[数据库] [查询记录] 失败: ', err)
      }
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
  showModal(e) {
    let that=this;
    var index = e.currentTarget.dataset.target;
    var text = that.data.historyDaily[index].diary != null ? that.data.historyDaily[index].diary:'';
    this.setData({
      showmodal:true,
      target: index,
      text:text
    })
  },
  hideModal(e) {
    this.setData({
      showmodal: false,
      text:''
    })
  },
  modifyDiary(e){
    const db = wx.cloud.database();
    let that = this;
    var index = that.data.target;
    var id=that.data.historyDaily[index]._id;
    var cards=that.data.historyDaily;
    cards[index].diary=that.data.text;
    db.collection('cards').doc(id).update({
      data:{
        diary:that.data.text
      },
      success:res=>{
        that.setData({
          showmodal: false,
          text: '',
          historyDaily:cards
        })
      }
    })

  },

  textareaBInput(e){
    this.setData({
      text: e.detail.value
    })
  }
})