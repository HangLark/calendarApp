const app = getApp();
const util = require('./util.js');
// pages/daily/daily.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cards: [],
    leftTime: [],
    hidden: [], //控制底部弹出菜单
    timer: "",
    Y: '', //当日年份 
    M: '', //当日月份
    D: '', //当日日期 
    YMD: '', //当前年月日
    rotate: 2,
    translateY: -1,
    translateX: -1,
    // userInfo: {
    //   avatarUrl: "",//用户头像
    //   nickName: "",//用户昵称
    // },
    today: 0, //今日日程
    dailyScope: 0, //显示全部日程OR今日日程OR本月日程
    actionSheetIndex: 0,
    actionSheetHideen: true,
    hasnear: 0, //附近日程个数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    /**
     * @author:HangLark
     * @description: Jump to Log on page
     */
    if (!wx.getStorageSync('loggedOn')) {
      wx.redirectTo({
        url: '../logOn/logOn',
      })
    }

    //End

    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //获取当日年份  
    var Y = date.getFullYear();
    //获取当日月份  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //获取当日日期 
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let that = this;
    that.setData({
      Y: Y,
      M: M,
      D: D,
      YMD: Y + "-" + M + "-" + D
    });
    // wx.getUserInfo({
    //   success: function (res) {
    //     console.log(res);
    //     var avatarUrl = 'userInfo.avatarUrl';
    //     var nickName = 'userInfo.nickName';
    //     that.setData({
    //       [avatarUrl]: res.userInfo.avatarUrl,
    //       [nickName]: res.userInfo.nickName,
    //     })
    //   }
    // })
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log(res)
        wx.setStorage({
          key: 'openid',
          data: res.result.openid,
        })
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        //初始化cards数组
        const db = wx.cloud.database();
        db.collection("cards").where({
          _openid: app.globalData.openid,
          overdue: false
        }).get({
          success: res => {
            res.data.sort(function(a, b) {
              return Date.parse(a.date.replace(/-/g, '/') + ' ' + a.time + ':00') - Date.parse(b.date.replace(/-/g, '/') + ' ' + b.time + ':00')
            })

            // start=======modified by fjh=============
            var currDate = new Date()
            var cardList = []
            for (var c of res.data){
              if (Date.parse(c.date.replace(/-/g, '/') + ' ' + c.time + ':00') >= currDate) {
                cardList.push(c)
              }
            }

            // that.setData({
            //   cards: res.data
            // })

            that.setData({
              cards: cardList
            })
            // end==========modified by fjh==============

            console.log('[数据库] [查询记录] 成功: ', res)
            //初始化hidden数组
            var hide = new Array();
            for (let i = 0; i < that.data.cards.length; i++) {
              hide[i] = true;
            }
            that.setData({
              hidden: hide
            })

            //初始化leftTime数组和hasnear
            var hasnear = 0;
            var left = new Array();
            for (let i = 0; i < that.data.cards.length; i++) {
              if (left[i] != "0天0时0分0秒")
                left[i] = util.getTimeLeft(that.data.cards[i].date.replace(/-/g, '/') + " " + that.data.cards[i].time);
              if ('near' in that.data.cards[i]) hasnear++;
            }
            that.setData({
              leftTime: left,
              hasnear: hasnear
            })

            //初始化今日日程数
            var today = that.computetoday(that.data.cards, Y + "-" + M + "-" + D); //计算今日日程
            that.setData({
              today: today
            })
          },
          fail: err => {
            console.log('[数据库] [查询记录] 失败: ', err)
          }
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.animation = wx.createAnimation({
      duration: 200
    })

    this.animation2 = wx.createAnimation({
      duration: 200
    })

    this.animation3 = wx.createAnimation({
      duration: 200
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var left = new Array();
    let that = this;
    that.data.timer = setInterval(() => {
      for (var i = 0; i < that.data.cards.length; i++) {
        left[i] = util.getTimeLeft(that.data.cards[i].date.replace(/-/g, '/') + " " + that.data.cards[i].time);
      }
      that.setData({
        leftTime: left
      });
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(this.data.timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(this.data.timer);

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.onLoad();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(event) {
    let that = this;
    that.listenerActionSheet();
    if (event.from === 'button') { //如果是点击了按钮来转发，而不是点击右上角的转发
      var index = event.target.id * 1;
      return {
        title: '分享日程',
        path: 'pages/shareDaily/shareDaily?title=' + that.data.cards[index].title + '&date=' + that.data.cards[index].date + '&time=' + that.data.cards[index].time + '&backgroundColor=' + that.data.cards[index].backgroundColor + '&comment=' + that.data.cards[index].comment,
        success: res => {
          console.log('分享成功', res)
        },
        fail: err => {
          console.log('分享失败', err)
        }
      }
    }

  },

  //创建新日程：跳转到创建日程界面
  createNewCard: function() {
    let that = this;
    if (that.data.rotate % 2 == 1) {
      that.rotate();
    }

    wx.navigateTo({
      url: '../createCard/createCard',
      success: res => {
        console.log('redirect success:daily->createCard')
      }
    })
  },
  createNewCardNear: function() {
    let that = this;
    if (that.data.rotate % 2 == 1) {
      that.rotate();
    }
    wx.navigateTo({
      url: '../createNear/createNear',
      success: res => {
        console.log('redirect success:daily->createNear')
      }
    })
  },

  //显示底部隐藏菜单
  showActionSheet: function(e) {
    // let index=e.currentTarget.id.substr(21) * 1;
    // var hidden1=this.data.hidden;
    // hidden1[index]=false;
    // this.setData({
    //   hidden:hidden1,
    // })
    ////////
    let index = e.currentTarget.id.substr(21) * 1;
    let that = this;
    that.setData({
      actionSheetIndex: index,
      actionSheetHideen: false,
    })
  },

  //隐藏底部弹出菜单
  listenerActionSheet: function() {
    // let that=this;
    // var hidden1 = this.data.hidden;
    // for(let i=0;i<hidden1.length;i++){
    //   hidden1[i]=true;
    // }
    // that.setData({
    //   hidden:hidden1,
    // })
    let that = this;
    that.setData({
      actionSheetHideen: true,
    })
  },

  //删除一个日程
  deleteDaily: function(e) {
    console.log(e)
    let that = this;
    var index = e.target.id.substr(11) * 1;
    let deleteid = that.data.cards[index]._id;
    if (that.data.cards[index].nearEventNo != '') {
      let event_id = that.data.cards[index].nearEventNo;
      wx.cloud.callFunction({
        name: "modifyHead",
        data: {
          type: "delete",
          eventid: event_id,
        }
      }).then(res => {
        console.log("删除头像成功")
      })
    }


    var cards1 = that.data.cards;

    const db = wx.cloud.database();

    wx.showModal({
      title: '删除日程',
      content: '确定要删除该日程',
      showCancel: true, //是否显示取消按钮
      success: function(res) {
        if (res.cancel) {
          //点击取消,默认隐藏弹框
        } else {
          //点击确定
          var today = that.data.today;
          var hasnear = that.data.hasnear;
          if (cards1[index].date == that.data.Y + "-" + that.data.M + "-" + that.data.D) today--;
          if ('near' in that.data.cards[index]) hasnear--;
          cards1.splice(index, 1);
          db.collection("cards").doc(deleteid).remove({
            success: res => {
              console.log('删除日程成功', res)
              that.setData({
                cards: cards1,
                today: today,
                hasnear: hasnear
              })
              wx.showToast({
                title: '删除成功', //提示文字
                duration: 500, //显示时长
                icon: 'success', //图标，支持"success"、"loading"  
              })
            },
            fail: err => {
              console.log('删除日程失败', err)
            }
          })
        }
      },
      fail: function(res) {}, //接口调用失败的回调函数
      complete: function(res) {}, //接口调用结束的回调函数（调用成功、失败都会执行）
    })




    that.listenerActionSheet(); //隐藏底部菜单

  },

  //更改一个日程
  changeDaily: function(e) {
    let that = this;
    var index = e.target.id.substr(11) * 1;
    let changeid = that.data.cards[index]._id
    var isToday = that.data.cards[index].date == that.data.YMD
    console.log(isToday)
    // console.log("要更改的日程为", changeid);
    that.listenerActionSheet(); //隐藏底部菜单
    wx.navigateTo({
      url: '../changeDaily/changeDaily?title=' + that.data.cards[index].title + '&date=' + that.data.cards[index].date + '&time=' + that.data.cards[index].time + '&backgroundColor=' + that.data.cards[index].backgroundColor + '&_id=' + that.data.cards[index]._id + '&index=' + index + '&comment=' + that.data.cards[index].comment + '&isToday=' + isToday + '&ymd=' + that.data.YMD,
      success: res => {
        console.log('redirect success:daily->changeDaily')
      }
    })
  },

  rotate: function() {
    let that = this;
    //旋转
    that.animation.rotate(-45 - 45 * Math.pow(-1, that.data.rotate)).step()
    that.data.rotate = that.data.rotate + 1
    //从底部移出
    var translatey = that.data.translateY * 120
    that.data.translateY = that.data.translateY * -1
    that.animation2.translateY(translatey + "rpx").step()
    //从右侧移出
    var translatex = that.data.translateX * 120
    that.data.translateX = that.data.translateX * -1
    that.animation3.translateX(translatex + "rpx").step()
    that.setData({
      animation: that.animation.export(),
      animation2: that.animation2.export(),
      animation3: that.animation3.export()
    })
  },

  computetoday: function(cards, today) { //计算有多少今日日程
    var num = 0;
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].date == today) {
        num++;
      }
    }
    return num;
  },

  changeScope: function(e) {
    let that = this;
    if (e.target.id == 'thisDay') {
      that.setData({
        dailyScope: 1
      })

    } else if (e.target.id == 'near') {
      that.setData({
        dailyScope: 2
      })

    } else if (e.target.id == 'all') {
      that.setData({
        dailyScope: 0
      })
    }
  },

  changeScope2(e) {
    let index = e.detail.current;
    this.setData({
      dailyScope: index
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