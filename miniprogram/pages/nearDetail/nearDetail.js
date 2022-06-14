// pages/nearDetail/nearDetail.js
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    useful: false,
  },
  showall() {
    //导航至新界面现实全部头像
    var self = this;
    wx.setStorage({
      key: 'joinlist',
      data: self.data.pageData.userhead
    })
    wx.navigateTo({
      url: '../showallHead/showallHead',
    })
  },
  addNear() {
    console.log(!this.data.useful)
    if (!this.data.useful) {
      //用户是否添加过
      wx.showToast({
        title: '您已添加该日程，请勿重复添加',
        icon: 'none'
      })
      return;
    }
    //添加到用户的数据库中
    let that = this;
    //提示用户接收订阅消息
    //let id = 'D7yEE6kc3dXsqb4JciR3sunbl6lM-L8XMTgBD2pYcVs'; // 订阅消息模版id
    let id = 'yODqVjfxb5hQQ8DERZ6cz-LHd4x0AZzmFu9DLqlope4';
    if (wx.requestSubscribeMessage) {
      wx.requestSubscribeMessage({
        tmplIds: [id],
        success(res) {
          if (res[id] == 'accept') { //用户同意接收提醒，则将数据添加进cards表中
            //添加头像
            that.addheadfunction();

            db.collection("cards").add({
              data: {
                title: that.data.pageData.title,
                date: that.data.pageData.beginDate,
                time: that.data.pageData.beginTime,
                backgroundColor: that.data.pageData.backgroundColor,
                overdue: false,
                comment: that.data.pageData.remarks,
                near: true, //是附近日程
                eventAddr: that.data.pageData.eventAddr,
                nearEventNo: that.data.pageData._id
              },
              success: res => {
                wx.showToast({
                  title: '添加成功',
                  duration: 1000,
                })
                console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
              },
              fail: err => {
                wx.showToast({
                  icon: 'none',
                  title: '添加失败'
                })
                console.error('[数据库] [新增记录] 失败：', err)
              }
            })
          } else {
            //用户拒绝了订阅或被禁用订阅消息
            wx.showToast({
              title: '添加失败',
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
        content: '微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  //添加附近到本地的过程
  addheadfunction() {
    //添加后的更新数据头像库
    var self = this;
    wx.cloud.callFunction({
      name: "modifyHead",
      data: {
        type: "add",
        eventid: self.data.pageData._id,
      }
    }).then(res => {
      console.log(res)
      console.log("头像添加成功")
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取当前用户头像
    var self = this;
    var nowopenid = wx.getStorageSync('openid');
    db.collection('User').where({
      _openid: nowopenid
    }).get().then(res => {
      self.setData({
        nowopenid: nowopenid,
        userHeadImage: res.data[0].userInfo.avatarUrl
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
    var self = this;
    //缓存中取数据
    var usingdata = wx.getStorageSync('detailnearInfo');
    //获取用户是否添加过
    var nowopenid = wx.getStorageSync('openid');
    db.collection("cards").where({
      title: usingdata.title,
      comment: usingdata.remarks,
      _openid: nowopenid
    }).get().then(res => {
      console.log(res)
      if (res.data[0] == null || res.data[0].nearEventNo != usingdata._id) {
        console.log("当前用户未添加该日程")
        self.setData({
          useful: true,
        })
      }
    })
    //获取创建者信息
    db.collection("User").where({
      _openid: usingdata._openid
    }).get().then(res => {
      self.setData({
        userinfo: res.data[0].userInfo
      })
    })
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        if (usingdata.location.type != null) {
          var distance = self.distance(res.latitude, res.longitude, usingdata.location.coordinates[1], usingdata.location.coordinates[0]);
        } else {
          var distance = self.distance(res.latitude, res.longitude, usingdata.location.latitude, usingdata.location.longitude);
        }
        usingdata['distance'] = distance;
        self.setData({
          pageData: usingdata
        })
      }
    })
  },
  distance: function(la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    s = s.toFixed(2);
    return s * 1000;
  },
})