// pages/near/near.js
const db = wx.cloud.database();

Page({
  data: {

    permission: false,
    centerLocation: {},
    userLocation: {},
    nearInfoList: [],
    maxdistenceSearch: 5000,
    positionMarkers: [],
    lasttap: "",
  },
  backtoNow() {
    var self = this;
    self.setData({
      centerLocation: self.data.userLocation
    })
  },
  //地图变化处理部分
  visionChange(e) {
    if (e.type == 'end' && e.causedBy == 'drag') {
      var self = this;
      this.mapCtx = wx.createMapContext("infoMap");
      this.mapCtx.getCenterLocation({
        type: 'gcj02',
        success: function(res) {
          const {
            longitude,
            latitude
          } = res;
          self.setData({
            centerLocation: {
              longitude,
              latitude
            }
          })
          //重新获取信息
          self.getNearByList();
        },
      })
    }
  },
  directTonewnear() {
    //暂无附近
    wx.navigateTo({
      url: '../createNear/createNear',
      success: res => {
        console.log('redirect success:daily->createNear')
      }
    })
  },
  //点击对应的附近卡片，e包含卡片信息
  chooseOne(e) {
    wx.setStorage({
      key: 'detailnearInfo',
      data: e.currentTarget.dataset.tapdata,
    })
    wx.navigateTo({
      url: '../nearDetail/nearDetail'
    })
  },
  //点击对应的地图点
  chooseMarker(e) {
    var self = this;
    //获取详情
    var event_id=self.data.positionMarkers.filter(item => item.id == e.markerId);
    var detailnearInfo = self.data.nearInfoList.filter(item => item._id == event_id[0]._id);
    console.log(detailnearInfo);
    wx.setStorage({
      key: 'detailnearInfo',
      data: detailnearInfo[0],
    })
    //跳转详情页
    wx.navigateTo({
      url: '../nearDetail/nearDetail'
    })
  },
  //新建一个跳转和数据传递的函数
  navigateToDetail(e) {

  },

  onLoad: function(options) {

  },
  onReady: function() {

  },
  onShow: function() {
    var self = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        //地理位置获取成功
        const {
          longitude,
          latitude
        } = res
        self.setData({
          userLocation: {
            longitude,
            latitude
          },
          centerLocation: {
            longitude,
            latitude
          },
          permission: true,
        })
        self.getNearByList();
      },
      fail: res => {
        //用户未授权处理
        console.log("用户为授权使用地理位置")
        self.setData({
          permission: false,
        })
      }
    })
  },
  //手动请求用户授权使用用户信息
  askingforpermission() {
    var self = this;
    wx.openSetting({
      success: res => {
        //用户开启授权
        if (res.authSetting["scope.userLocation"]) {
          //地理位置获取成功
          wx.getLocation({
            type: 'gcj02',
            success: res => {
              const {
                longitude,
                latitude
              } = res;
              self.setData({
                userLocation: {
                  longitude,
                  latitude
                },
                centerLocation: {
                  longitude,
                  latitude
                },
                permission: true,
              })
              self.getNearByList();
            }
          })
        }
      }
    })
  },
  //请求获取附近的日程列表
  getNearByList() {
    var self = this;
    //查询附近的日程
    const _ = db.command
    db.collection("nearbySchedule").where({
      location: _.geoNear({
        geometry: db.Geo.Point(self.data.centerLocation['longitude'], self.data.centerLocation['latitude']),
        maxDistance: self.data.maxdistenceSearch,
      }),
      done: false
    }).get().then(res => {
      //该方法的结果已经为按照距离排序
      self.setData({
        nearInfoList: res.data
      })
      //对地图标点进行处理
      var markers = []
      var tempMarker = {};
      for (var j = 0, len = res.data.length; j < len; j++) {
        tempMarker = {};
        var tempdata = res.data[j];
        //marker需要的数据处理
        tempMarker["id"] = j;
        tempMarker["_id"] = tempdata._id;
        tempMarker["latitude"] = tempdata.location.latitude;
        tempMarker['longitude'] = tempdata.location.longitude;
        tempMarker['width'] = 30;
        tempMarker['height'] = 30;
        tempMarker["iconPath"] = "/images/mapIcon.png";
        var titleshow = tempdata.title.length > 4 ? tempdata.title.substr(0, 4) + "..." : tempdata.title;
        tempMarker['callout'] = {
          content: titleshow,
          borderRadius: 5,
          textAlign: "center",
          padding: 2,
          display:'ALWAYS',
        };
        markers.push(tempMarker);
      }
      self.setData({
        positionMarkers: markers
      })
    })

  },
})