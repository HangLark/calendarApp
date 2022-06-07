// pages/newNearbyMessage/newNearbyMessage.js
var util = require('../utils/util.js');
const db = wx.cloud.database();
const app = getApp();


//const key = 'HFRBZ-WLIKS-OX7OB-6X4YO-QXXF2-EAB3R'; //使用在腾讯位置服务申请的key
const key = '7YVBZ-UBBLS-LF5OW-66LJ7-WK37F-XJFOB'; //使用在腾讯位置服务申请的key
const referer = 'Reminder'; //调用插件的app的名称
const chooseLocation = requirePlugin('chooseLocation');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    color1: ['red', 'orange', 'yellow', 'olive', 'green', 'cyan', 'blue', 'purple', 'mauve', 'pink', 'brown', 'black', 'gradual-pink', 'gradual-purple', 'gradual-blue', 'gradual-green', 'gradual-orange'],
    color2: ['嫣红', '桔橙', '明黄', '橄榄', '森绿', '天青', '海蓝', '姹紫', '木槿', '桃粉', '棕褐', '墨黑', '霞彩', '惑紫', '靛青', '翠柳', '鎏金'],

    title: "提醒事项",
    remarks: "相关备注",
    colorSelected: 0,
    eventAddr: "",

    imgPath: "",
    cloudImgPath: "",
    imgSize: {},
    userlocation: {},
    currentTime: {},
    startDate: "",
    startTime: "",

    cardMode: true,
    imageMode: false,

    startTimeChoice: "",
    endDateChoice: "",
    endTimeChoice: "",

    endDateShow: "请选择",
    endTimeShow: "请选择",
  },

  titleInput: function(e) {
    this.setData({
      title: e.detail.value
    });
  },
  remarksInput(e) {
    this.setData({
      remarks: e.detail.value
    })
  },
  //调用地图选点插件
  getPositionByMap() {
    wx.navigateTo({
      url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer
    });
  },

  //选择订阅的图片
  headImage() {
    var self = this;
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      success: function(res) {
        console.log(res)
        //图片的展示
        self.setData({
          imgPath: res.tempFilePaths[0]
        });
        self.setData({
          imageMode: true,
          cardMode: false,
        })
      },
    });
  },

  //时间输入条件设置处
  begindatefunction(e) {
    //选择当天的日程，时间默认选择当前时间之后
    var currtimeChoice = this.data.currentTime.hour + ":" + this.data.currentTime.minute;
    if (e.detail.value != this.data.startDateChoice) {
      this.setData({
        startTimeChoice: "00:00"
      })
    } else {
      this.setData({
        startTimeChoice: currtimeChoice
      })
    }

    //更新显示和对结束日期进行限制
    this.setData({
      startDate: e.detail.value,
      endDateChoice: e.detail.value,
    })
  },

  begintimefunction(e) {
    this.setData({
      startTime: e.detail.value,
    })
  },
  enddatefunction(e) {
    //根据结束日期对结束时间进行限制
    if (e.detail.value == this.data.startDate) {
      var temp = this.data.startTime
      this.setData({
        endTimeChoice: temp,
      })
    } else {
      this.setData({
        endTimeChoice: "00:00"
      })
    }
    //更新结束日期显示
    this.setData({
      endDateShow: e.detail.value,
    })
  },
  endtimefunction(e) {
    //更新显示即可
    this.setData({
      endTimeShow: e.detail.value
    })
  },


  //将订阅项存储到云端 注意此处将图片一并上传
  // newSubscribeItem(e) {
  //   var self = this;
  //   //数据完整性验证
  //   console.log(e)
  //   //表单验证
  //   if (!e.detail.value.title) {
  //     //标题和备注均不为空才可以点击提交
  //     wx.showToast({
  //       title: "请填写日程标题",
  //       'icon': "none",
  //     })
  //     return;
  //   }
  //   /**
  //    * if (!e.detail.value.remarks) {
  //    * wx.showToast({
  //    *   title: "请填写日程备注",
  //    *   'icon': "none",
  //    * })
  //    * return;
  //    * }
  //    */

  //   //地点验证
  //   if (this.data.eventAddr == "") {
  //     wx.showToast({
  //       title: "请选择事件位置",
  //       'icon': "none",
  //     })
  //     return;
  //   }
  //   //日期验证

  //   var tempHead = [];
  //   tempHead.push(self.data.headImage);
  //   //图片背景地址验证
  //   if (this.data.imgPath == "") {
  //     db.collection('nearbySchedule').add({
  //       // data 字段表示需新增的 JSON 数据
  //       data: {
  //         // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
  //         title: e.detail.value.title,
  //         remarks: e.detail.value.remarks,
  //         beginDate: e.detail.value.dateBegin,
  //         beginTime: e.detail.value.timeBegin,
  //         endDate: e.detail.value.dateEnd,
  //         endTime: e.detail.value.timeEnd,
  //         imgPath: '',
  //         eventAddr: self.data.eventAddr,
  //         userhead: tempHead,
  //         // 为待办事项添加一个地理位置（113°E，23°N）注意点
  //         location: new db.Geo.Point(this.data.eventAddr['longitude'], this.data.eventAddr['latitude']),
  //         done: false
  //       },
  //       success: function(res) {
  //         //进行成功与否提示
  //         console.log(res)
  //         wx.showToast({
  //           title: '添加成功',
  //           duration: 1000,
  //         })
  //         db.collection("cards").add({
  //           data: {
  //             title: e.detail.value.title,
  //             date: e.detail.value.dateBegin,
  //             time: e.detail.value.timeBegin,
  //             backgroundColor: 'blue',
  //             overdue: false,
  //             comment: e.detail.value.remarks,
  //             near: true, //是附近日程
  //             eventAddr: self.data.eventAddr,
  //             nearEventNo: res._id
  //           }
  //         })
  //         wx.navigateBack();
  //       },
  //       fail: console.error,
  //       complete: console.log
  //     })
  //   } else {
  //     //上传到存储空间
  //     var path = self.data.imgPath;
  //     var name = path.substr(path.lastIndexOf('.', path.lastIndexOf('.') - 1) + 1);
  //     console.log(name)
  //     console.log(self.data.imgPath);
  //     wx.cloud.uploadFile({
  //       cloudPath: "nearbyImages/" + name,
  //       filePath: self.data.imgPath,
  //       fail: res => {
  //         console.log('fail' + res)
  //       },
  //       success: res => {
  //         console.log("图片上传成功！")
  //         self.setData({
  //           cloudImgPath: res.fileID
  //         })
  //         //内容上传
  //         console.log(self.data.cloudImgPath)

  //         db.collection('nearbySchedule').add({
  //           // data 字段表示需新增的 JSON 数据
  //           data: {
  //             // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
  //             title: e.detail.value.title,
  //             remarks: e.detail.value.remarks,
  //             beginDate: e.detail.value.dateBegin,
  //             beginTime: e.detail.value.timeBegin,
  //             endDate: e.detail.value.dateEnd,
  //             endTime: e.detail.value.timeEnd,
  //             imgPath: self.data.cloudImgPath,
  //             eventAddr: self.data.eventAddr,
  //             userhead: tempHead,
  //             // 为待办事项添加一个地理位置（113°E，23°N）注意点
  //             location: new db.Geo.Point(this.data.eventAddr['longitude'], this.data.eventAddr['latitude']),
  //             done: false
  //           },
  //           success: function(res) {
  //             //进行成功与否提示
  //             console.log(res)
  //             wx.showToast({
  //               title: '添加成功',
  //               duration: 1000,
  //             })
  //             db.collection("cards").add({
  //               data: {
  //                 title: e.detail.value.title,
  //                 date: e.detail.value.dateBegin,
  //                 time: e.detail.value.timeBegin,
  //                 backgroundColor: 'blue',
  //                 overdue: false,
  //                 comment: e.detail.value.remarks,
  //                 near: true, //是附近日程
  //                 eventAddr: self.data.eventAddr,
  //                 nearEventNo: res._id

  //               }
  //             })
  //             wx.navigateBack();
  //           },
  //           fail: console.error,
  //           complete: console.log
  //         })
  //       }
  //     });
  //   }



    
  // },
  onShow: function() {
    var userchoosedlocation = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    this.setData({
      eventAddr: userchoosedlocation,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取用户头像
    var self = this;
    var openid = wx.getStorage({
      key: 'openid',
      success: function(res) {
        console.log(res)
        db.collection('User').where({
          _openid: res.data
        }).get().then(res => {
          self.setData({
            headImage: res.data[0].userInfo.avatarUrl
          })
        })
      },
    })

    //默认时间的初始化工作。
    var time = util.formatTime(new Date());
    var dateChoice = time['year'] + "-" + time['month'] + '-' + time['day']
    var timeChoice = time['hour'] + ":" + time['minute'];

    this.setData({
      currentTime: time,

      startTimeChoice: timeChoice,
      startDateChoice: dateChoice,
      endDateChoice: dateChoice,
      endTimeChoice: timeChoice,

      startTime: timeChoice,
      startDate: dateChoice,
    })
    //获取当前系统时间
  },


  ////////////////////////////////////////////////////////////

  //取消天日程，直接返回上级页面
  cancel: function() {
    wx.navigateBack({

    })
  },
  //选择卡片颜色
  changeColor: function(e) {
    let that = this;
    that.setData({
      colorSelected: e.detail.value,
      cardMode: true,
      imageMode: false
    })
  },

  changeComment: function(e) {
    let that = this;
    that.setData({
      comment: e.detail.value
    })
  },
  /////////////////发通知测试//////////////////////////////////
  testMessage: function() {
    wx.cloud.callFunction({
      name: "sendMessage",
      data: {
        openid: app.globalData.openid
      }
    }).then(console.log)
  },

  async create(){
    var that=this;
    var values=that.data;
    var resId;
    console.log(values);
    //表单验证
    if (values.title == "" || values.title =="提醒事项") {
      //标题和备注均不为空才可以点击提交
      wx.showToast({
        title: "请填写日程标题",
        'icon': "none",
      })
      return;
    }


    //地点验证
    if (values.eventAddr == "" || values.eventAddr == null) {
      wx.showToast({
        title: "请选择事件位置",
        'icon': "none",
      })
      return;
    }

    //start===============edit by fjh
    // 合法性检测
    var label = await function(){
      return new Promise((resolve, reject) => {
        wx.showLoading({
          mask: true,
        })
        wx.cloud.callFunction({
          name: "filter",
          data: {
            text: values.title + values.remarks
          },
          success: (res) => {
            resolve(res.result.label)
          },
          fail: (err) => {
            reject(err);
          }
        })
        wx.hideLoading()
      })
    }()

    if (label) {
      wx.showToast({
        title: "内容违规",
        icon: "none"
      })
      return
    }
    //end=================edit by fjh

    var tempHead = [];
    tempHead.push(values.headImage);
    //请求一次提醒消息发送
    //let subscribeid = 'D7yEE6kc3dXsqb4JciR3sunbl6lM-L8XMTgBD2pYcVs';
    let subscribeid = 'yODqVjfxb5hQQ8DERZ6cz-LHd4x0AZzmFu9DLqlope4';
    if (wx.requestSubscribeMessage){
      wx.requestSubscribeMessage({
        tmplIds: [subscribeid],
        success(res){
          if (res[subscribeid] == 'accept'){
            //用户同意接受一次消息
            if (values.imgPath == "") {
              db.collection('nearbySchedule').add({
                // data 字段表示需新增的 JSON 数据
                data: {
                  // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
                  title: values.title,
                  remarks: values.remarks,
                  beginDate: values.startDate,
                  beginTime: values.startTime,
                  endDate: values.endDateShow == "请选择" ? "" : values.endDateShow,
                  endTime: values.endTimeShow == "请选择" ? "" : values.endTimeShow,
                  imgPath: '',
                  eventAddr: values.eventAddr,
                  userhead: tempHead,
                  // 为待办事项添加一个地理位置（113°E，23°N）注意点
                  location: new db.Geo.Point(that.data.eventAddr['longitude'], that.data.eventAddr['latitude']),
                  done: false,
                  backgroundColor:values.color1[values.colorSelected]
                },
                success: function (res) {
                  //进行成功与否提示
                  console.log(res)

                  db.collection("cards").add({
                    data: {
                      title: values.title,
                      date: values.startDate,
                      time: values.startTime,
                      backgroundColor: 'blue',
                      overdue: false,
                      comment: values.eventAddr.address,
                      near: true, //是附近日程
                      eventAddr: values.eventAddr,
                      nearEventNo: res._id
                    },
                    success:function(res){
                      var newNearBy={
                        title :values.title,
                        date : values.startDate,
                        time : values.startTime,
                        backgroundColor : "blue",
                        overdue : false,
                        comment :values.eventAddr.address,
                        near : true,
                        eventAddr :values.eventAddr,
                        nearEventNo :res._id
                      }
                      
                      wx.setStorage({
                        key:"newNearyBy",
                        data : newNearBy
                      })
                      wx.showToast({
                        title: '添加成功',
                        duration: 1000,
                      })
                      setTimeout(function () {
                        wx.navigateBack({

                        })
                      }, 1000)
                    },
                    fail: function (err) {
                      console.log(err)
                    },
                  })

                },
                fail: console.error,
                complete: console.log
              })
            } else {
              //上传到存储空间
              var path = values.imgPath;
              var name = path.substr(path.lastIndexOf('.', path.lastIndexOf('.') - 1) + 1);
              if (name.startsWith("wxfile://")){
                name=name.substring(9);
              }
              console.log(name)
              console.log(that.data.imgPath);
              wx.cloud.uploadFile({
                cloudPath: "nearbyImages/" + name,
                filePath: that.data.imgPath,
                fail: res => {
                  console.log('fail' + res)
                },
                success: res => {
                  console.log("图片上传成功！")
                  that.setData({
                    cloudImgPath: res.fileID
                  })
                  //内容上传
                  console.log(that.data.cloudImgPath)

                  db.collection('nearbySchedule').add({
                    // data 字段表示需新增的 JSON 数据
                    data: {
                      // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
                      title: values.title,
                      remarks: values.remarks,
                      beginDate: values.startDate,
                      beginTime: values.startTime,
                      endDate: values.endDateShow == "请选择" ? "" : values.endDateShow,
                      endTime: values.endTimeShow == "请选择" ? "" : values.endTimeShow,
                      imgPath: that.data.cloudImgPath,
                      eventAddr: values.eventAddr,
                      userhead: tempHead,
                      // 为待办事项添加一个地理位置（113°E，23°N）注意点
                      location: new db.Geo.Point(that.data.eventAddr['longitude'], that.data.eventAddr['latitude']),
                      done: false,
                      backgroundColor: values.color1[values.colorSelected]
                    },
                    success: function (res) {
                      //进行成功与否提示
                      console.log(res)
                      wx.showToast({
                        title: '添加成功',
                        duration: 1000,
                      })
                      db.collection("cards").add({
                        data: {
                          title: values.title,
                          date: values.startDate,
                          time: values.startTime,
                          backgroundColor: 'blue',
                          overdue: false,
                          comment: values.eventAddr.address,
                          near: true, //是附近日程
                          eventAddr: values.eventAddr,
                          nearEventNo: res._id
                        },

                        success: function (res) {
                          wx.showToast({
                            title: '添加成功',
                            duration: 1000,
                          })
                          setTimeout(function () {
                            wx.navigateBack({

                            })
                          }, 1000)
                        },
                        fail: function (err) {
                          console.log(err)
                        },
                      })

                    },
                    fail: console.error,
                    complete: console.log
                  })
                }
              });
            }

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
        }

      })
    } else {
      // 兼容处理
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }

    

  }

})