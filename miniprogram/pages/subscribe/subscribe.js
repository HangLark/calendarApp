const db = wx.cloud.database();
const All = 0;
var userDoneinfo = [];

Page({
  data: {
    leftPos: "",
    topPos: "",
    showAnimationIcon: false,
    showtab: 0, //顶部选项卡索引
    scrollView: 0, //动态调整顶部位置
    tabnav: {
      tabnum: 4,
      tabitem: [{
          "id": 0,
          "text_en": 'all',
          "text": "全部"
        },
        {
          "id": 1,
          "text_en": 'holiday',
          "text": "节假日"
        },
        {
          "id": 2,
          "text_en": 'activity',
          "text": "优惠活动"
        },
        {
          "id": 3,
          "text_en": 'singerNight',
          "text": "演唱会"
        },
        {
          "id": 4,
          "text_en": 'anniversary',
          "text": "纪念日"
        },
        {
          "id": 5,
          "text_en": 'release_conference',
          "text": "新品发布会"
        }
      ]
    },
    subscribeInfo: [],
    // tab切换
    currentTab: 0,
  },
  //添加和取消订阅的数据库修改处
  changeadd(e) {
    var self = this;
    var dataset = e.currentTarget.dataset;
    var remain = this.data.subscribeInfo;
    if (dataset.subscribed == 'true') {
      //取消订阅
      var index = userDoneinfo.indexOf(dataset.id);
      userDoneinfo.splice(index, 1)

      remain.filter(k => {
        k.filter(m => {
          if (m._id == dataset.id) {
            m.subscribed = false
          }
          return m;
        })
        return k;
      })
    } else {
      //添加订阅
      userDoneinfo.push(dataset.id);
      remain.filter(k => {
        k.filter(m => {
          if (m._id == dataset.id) {
            m.subscribed = true
          }
          return m;
        })
        return k;
      })
    }
    self.setData({
      subscribeInfo: remain,
    })
    console.log(self.openid);
    //更新订阅数据库
    db.collection('userSubscribe').where({
      openid: self.openid
    }).update({
      data: {
        subscribed: userDoneinfo
      }
    })
    //更新通知数据库

  },
  //顶部bar的切换
  changetopbar(e) {
    this.setData({
      showtab: e.currentTarget.dataset.tabindex,
      scrollView: e.currentTarget.dataset.tabindex - 2,
    })
    //移动scrollview
  },
  //下方swiper的切换
  changeSwiper(e) {
    this.setData({
      showtab: e.detail.current,
      scrollView: e.detail.current - 2,
    })
  },

  //点击某一项具体的卡片
  lookingTheDetailInfo(e) {
    console.log("点击卡片" + e.currentTarget.dataset.id)
  },
  onShow: function() {
    var self = this;
    //访问数据库获取相关信息
    this.getSubdata().then(res => {
      //获取完数据，进行对应的排序
      var temp = [];
      var textlist = self.data.tabnav.tabitem;
      for (var j = 0, len = textlist.length; j < len; j++) {
        var text = textlist[j].text_en;
        res[text].sort(function(a, b) {
          return Date.parse(a.date.replace(/-/g, '/') + ' ' + a.time + ':00') - Date.parse(b.date.replace(/-/g, '/') + ' ' + b.time + ':00')
        })
        temp.push(res[text])
      }
      self.setData({
        subscribeInfo: temp,
      })
    });
  },

  onLoad: function() {
    var self = this;
    //获取屏幕高度
    var res = wx.getStorageSync("systemInfo");
    this.subPoket = {};
    this.subPoket['x'] = res.windowWidth - 60;
    this.subPoket['y'] = res.windowHeight - 70;

    this.setData({
      windowHeight: res.windowHeight,
    })

    //获取openid进入数据库查询
    this.openid = wx.getStorageSync('openid');

    this.addanimation = wx.createAnimation({
      timingFunction: 'linear',
    })
  },
  async getSubdata() {
    //j=0为全部信息
    var temp = {};
    var textlist = this.data.tabnav.tabitem;
    var self = this;
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
      done: false
    }).get().then(res => {
      temp['all'] = res.data;
      if (userDoneinfo.length != 0) {
        temp['all'].filter(k => {
          if (userDoneinfo.indexOf(k._id) > -1) {
            k['subscribed'] = true;
          }
          return k;
        })
      }
    })
    for (var j = 1, len = textlist.length; j < len; j++) {
      var tempusing = temp['all'];
      tempusing = tempusing.filter(k => {
        if (k.classify == textlist[j].text_en) {
          k['chinese_classify'] = textlist[j].text;
          return k;
        }
      })
      temp[textlist[j].text_en] = tempusing;
    }
    return temp;
  },
  addClick(e) {
    console.log("点击添加按钮" + e.currentTarget.dataset.id);
    //此处可以进行相关的数据添加操作


    //此处开始进行动画的设计
    console.log(e)

    //获取点击位置
    this.finger = {};
    this.finger['x'] = e.changedTouches[0].clientX;
    this.finger['y'] = e.changedTouches[0].clientY;

    //处理抛物线顶点，x方向去2/3处，y方向高200px
    var topPoint = {};
    if (this.finger.x < this.subPoket.x) {
      topPoint['x'] = this.finger.x + (this.subPoket.x - this.finger.x) / 3;
    } else {
      topPoint['x'] = this.subPoket.x + (this.finger.x - this.subPoket.x) / 3;
    }

    if (this.finger.y < this.subPoket.y) {
      topPoint['y'] = this.finger.y - 100;
    } else {
      topPoint['y'] = this.subPoket.y - 100;
    }

    //根据点产生曲线轨迹
    var linePath = [];
    var linePath = this.bezier([this.finger, topPoint, this.subPoket]);
    console.log(linePath)

    this.startAnimation(e, linePath);
  },
  bezier(points) {
    //使用amount处理点密度,请严格按照开始，中间、结束点来处理
    //density为直线距离单位长度的密度。
    var ret = [];

    //求抛物线
    var pointA = points[0];
    var pointB = points[1];
    var pointC = points[2];
    /**方程求解
     * a=((y1-y2)/(x1-x2)-(y1-y3)/(x1-x3))/(x2-x3)
     * b=(y1-y2)/(x1-x2)-a(x1+x2)
     * c=y1-ax12-bx1
     * 测试pointA={'x':1,'y':3} pointB={'x':0,'y':1} pointC={'x':-1,'y':1}
     * a=1, b=1,c=1
     * var pointC={'x':-2,'y':4};var pointB={'x':0,'y':1};var pointA={'x':2,'y':6};
     */
    var a = ((pointA.y - pointB.y) / (pointA.x - pointB.x) - (pointA.y - pointC.y) / (pointA.x - pointC.x)) / (pointB.x - pointC.x);
    var b = (pointA.y - pointB.y) / (pointA.x - pointB.x) - a * (pointA.x + pointB.x);
    var c = pointA.y - a * pointA.x * pointA.x - b * pointA.x;

    //从顶点开始往两边走
    var base = 0.01;
    var changeRate = 0;
    var j;
    var beilv = 20;
    //先计算finger的，即pointa
    if (pointB.x > pointA.x) {
      for (var j = pointB.x; j - pointA.x > 0;) {
        var y = a * j * j + b * j + c;
        ret.push({
          'x': j,
          'y': y,
        })
        j = j - base * beilv * Math.exp(changeRate);
        changeRate = changeRate + 0.1;
      }
    } else {
      for (var j = pointB.x; pointA.x - j > 0;) {
        var y = a * j * j + b * j + c;
        ret.push({
          'x': j,
          'y': y,
        })
        j = j + base * beilv * Math.exp(changeRate);
        changeRate = changeRate + 0.1;
      }
    }
    ret.reverse();
    base = 0.01;
    changeRate = 0;
    if (pointB.x > pointC.x) {
      for (var j = pointB.x; j - pointC.x > 0;) {
        var y = a * j * j + b * j + c;
        ret.push({
          'x': j,
          'y': y,
        })
        j = j - base * beilv * Math.exp(changeRate);
        changeRate = changeRate + 0.1;
      }
    } else {
      for (var j = pointB.x; pointC.x - j > 0;) {
        var y = a * j * j + b * j + c;
        ret.push({
          'x': j,
          'y': y,
        })
        j = j + base * beilv * Math.exp(changeRate);
        changeRate = changeRate + 0.1;
      }
    }
    return ret;
  },
  startAnimation(e, linePath) {
    var self = this;
    self.setData({
      leftPos: e.changedTouches[0].clientX,
      topPos: e.changedTouches[0].clientY,
      showAnimationIcon: true,
    })
    var index = linePath.length;
    var i = 0;
    this.timer = setInterval(function() {
      self.addanimation.translate(linePath[i].x - self.data.leftPos, linePath[i].y - self.data.topPos).step({
        duration: 20,
      });
      i = i + 1;
      self.setData({
        addanimation: self.addanimation.export()
      })
      if (i > index - 1) {
        clearInterval(self.timer);
        self.setData({
          showAnimationIcon: false,
        })
        i = 0;
      }
    }, 30);


  }

})