// pages/initial/initial.js
const app = getApp()
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gameinfo : {},
    isSponsor : false,
    userInfo: {},
    hasUserInfo: false,
    //viewimg : " <view class=" + '"' +"cu-avatar xl round margin-left" + '"' + " style=" + '"' + "background-image: url(",
   // viewimgend:  " );" +'">' + "</view>",  
    participants: {} 

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const info = JSON.parse(decodeURIComponent(options.gameinfo))
    
    this.setData({
      gameinfo: info
    })

    var param = {
      gamenum: info.num
    }
    var that = this

    util.commonAjax('/api/getParticipants', 0, param)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          // 成功  
          const obj = resolve.data.data.participants;

          that.setData({
            participants: obj
          })

          //for (var index in obj) { //第一层循环取到各个list  
          //  console.log( obj[index].avatarurl);
          //}
            
        } else {
          // 失败  
        }
      })

    
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
    return {

      title: '弹出分享时显示的分享标题',

      desc: '分享页面的内容',

      path: '/pages/initial/initial?gameinfo=' + encodeURIComponent(JSON.stringify(this.data.gameinfo)) // 路径，传递参数到指定页面。

    }

  },

   bindgetuserinfo: function (e) {

     console.log('initial.js row 83| = ' + app.globalData.code)
     console.log('initial.js row 84| = ' + e.detail.userInfo)
     console.log('initial.js row 85| = ' + e.detail.userInfo == app.globalData.openid)
    app.globalData.userInfo = e.detail.userInfo

    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    

    var data = {
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv,
      code: app.globalData.code,
      userinfo: JSON.stringify(e.detail.userInfo),
      player: app.globalData.openid,
      gamenum: this.data.gameinfo.num,
      introducer: this.data.gameinfo.openid
    }
     util.commonAjax('/api/joinGame', 0, data)
      .then(function (resolve) { 
        if (resolve.data.state === 0) {
          // 成功  
          app.globalData.openid = resolve.data.data.open_id
          wx.setStorageSync('userInfo', resolve.data.data)
          wx.setStorageSync('openid', resolve.data.data.open_id)
          // 新手们注意一下，记得把下面这个写到这里，有好处。  
          typeof cb == "function" && cb(app.globalData.userInfo)
        } else {
          // 失败  
        }
      })
  },
  openCurrentGame: function (event) {
    if (!this.data.hasUserInfo){
      return
    }
    let num = event.currentTarget.dataset.gid
    let iscreater = event.currentTarget.dataset.iscreater
    let gname = event.currentTarget.dataset.gname
    let pattern = event.currentTarget.dataset.pattern
    wx.redirectTo({
      url: '../match/match?num=' + num + '&iscreater=' + iscreater + '&gname=' + gname + "&pattern=" + pattern
    })
  },
})