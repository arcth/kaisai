//index.js
//获取应用实例
const app = getApp()
var util = require('../../utils/util.js')

Page({
  data: {
    PageCur: 'basics',
    TabCur: 0,
    scrollLeft: 0,
    userInfo: {},
    hasUserInfo: false, 
    options:{},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    background: "/images/wzry1.jpg",
    
  },

  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onLoad: function (options) {
    let base64 = wx.getFileSystemManager().readFileSync(this.data.background, 'base64');
    this.setData({
      background: 'data:image/png;base64,' + base64,
      options: options
    })

    if (app.globalData.userInfo && app.globalData.openid) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      
      app.userInfoReadyCallback = res => {
        if (res.userInfo && app.globalData.openid) {
          console.log('2 index.js 44 app.globalData.openid = ' + app.globalData.openid)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          this.checkback()
        }
      }
    } else {
      
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  }, 
  bindgetuserinfo: function(e) {
    
    app.globalData.userInfo = e.detail.userInfo
    
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    }) 

    var data = { 
      encryptedData: e.detail.encryptedData, 
      iv: e.detail.iv, 
      code: app.globalData.code,
      userinfo: JSON.stringify(e.detail.userInfo)
      } 
    util.commonAjax('/api/login', 0, data) 
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          // 成功  
          app.globalData.openid = resolve.data.data.open_id
          wx.setStorageSync('userInfo', resolve.data.data)
          wx.setStorageSync('openid', resolve.data.data.open_id)
          // 新手们注意一下，记得把下面这个写到这里，有好处。  
          typeof cb == "function" && cb(app.globalData.userInfo)
        } else {
          console.log('/api/login 失败' )  
        }
      })
    this.checkback()
    
  },
  checkback: function (){
    let pages = getCurrentPages(); //页面栈    
    let beforePage = pages[pages.length - 2];
    if (beforePage != undefined) {
      if (beforePage.route == 'pages/initial/initial') {
        const info = JSON.parse(decodeURIComponent(this.options.gameinfo))
        beforePage.setData({
          gameinfo: info,
          introducer: this.options.introducer
        })
        wx.navigateBack({
          delta: 1,
          //返回的页面数，如果 delta 大于现有页面数，则返回到首页。        
          success: function () {
            if (beforePage.route == 'pages/initial/initial') {
              //beforePage.syncPageData()
              //这个函数式调用接口的函数           
            }
          }
        })
      }
    }
  }
})
