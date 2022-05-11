//app.js
App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'test-ck0ws',
        env: 'calendar-xs80k',
        traceUser: true,
      })
    }

    //获取用户手机参数进行适配
    wx.getSystemInfo({
      success: function(res) {
        wx.setStorage({
          key: 'systemInfo',
          data: res,
        })
      },
    })

    //获取用户权限
    wx.getSetting({
      //建议查看该方法的文档，以了解更多权限。
      success: res => {
        console.log(res)
        if (!res.authSetting['scope.userInfo']) {//Check logon
          wx.setStorage({
            key: "loggedOn",
            data: false
          })
        }
        else{
          wx.setStorage({
            key: "loggedOn",
            data: true
          })
        }
        //获取定位权限
        // if (!res.authSetting['scope.userLocation']) {
        //   wx.authorize({
        //     scope: 'scope.userLocation',
        //     success: res => {}
        //   })
        // }
      }
    })

    
    //Global Data
    //Do not forget getApp()

    this.globalData = {};



    colorList: [{
        title: '嫣红',
        name: 'red',
        color: '#e54d42'
      },
      {
        title: '桔橙',
        name: 'orange',
        color: '#f37b1d'
      },
      {
        title: '明黄',
        name: 'yellow',
        color: '#fbbd08'
      },
      {
        title: '橄榄',
        name: 'olive',
        color: '#8dc63f'
      },
      {
        title: '森绿',
        name: 'green',
        color: '#39b54a'
      },
      {
        title: '天青',
        name: 'cyan',
        color: '#1cbbb4'
      },
      {
        title: '海蓝',
        name: 'blue',
        color: '#0081ff'
      },
      {
        title: '姹紫',
        name: 'purple',
        color: '#6739b6'
      },
      {
        title: '木槿',
        name: 'mauve',
        color: '#9c26b0'
      },
      {
        title: '桃粉',
        name: 'pink',
        color: '#e03997'
      },
      {
        title: '棕褐',
        name: 'brown',
        color: '#a5673f'
      },
      {
        title: '玄灰',
        name: 'grey',
        color: '#8799a3'
      },
      {
        title: '草灰',
        name: 'gray',
        color: '#aaaaaa'
      },
      {
        title: '墨黑',
        name: 'black',
        color: '#333333'
      },
      {
        title: '雅白',
        name: 'white',
        color: '#ffffff'
      },
    ]
  }
})