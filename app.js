//app.js
const util = require('/utils/util.js')
const api = require('/api/ajax.js')

App({
  onLaunch: function () {

    //获得系统信息
   
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })

    //获取本地缓存中的openid
    this.globalData.openid = wx.getStorageSync('openid');

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        this.globalData.code = res.code
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
       
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              wx.setStorageSync('userInfo', res.userInfo)

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
                wx.setStorageSync('userInfo', res.userInfo)
                /**let param = {
                  code: this.globalData.code,
                  userinfo: JSON.stringify(this.globalData.userInfo)
                }
                let that = this
                util.commonAjax('/api/login', 0, param)
                  .then(function (resolve) {
                    if (resolve.data.state === 0) {
                      // 成功  
                      console.log('app.js login getopenid =' + resolve.data.data.open_id )
                      that.globalData.openid = resolve.data.data.open_id
                      wx.setStorageSync('userInfo', resolve.data.data)
                      wx.setStorageSync('openid', resolve.data.data.open_id)
                      // 新手们注意一下，记得把下面这个写到这里，有好处。  
                      typeof cb == "function" && cb(app.globalData.userInfo)
                    } else {
                      // 失败  
                    }
                  })**/
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    api,
    code:null,
    isConnect:false,
    openid:null,
    socketId:null,
    // imageUrl:'https://ksai.nong12.com/images',
    imageUrl:'http://images.esale.chinacarabao.com',

     websocketUrl: 'wss://ksaiwss.nong12.com',
     url: 'https://ksai.nong12.com'

    // websocketUrl: 'ws://localhost:8080',
    // url: 'http://localhost:8080'

    // websocketUrl: 'ws://118.114.77.102:9258',
    // url:'http://118.114.77.102:9258'



  },
   
}) 