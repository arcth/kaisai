// pages/initial/initial.js
const app = getApp()
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gameinfo : {
		
	},
    isSponsor : false,
    userInfo: {},
    hasUserInfo: false,
    isparticipant : false,
	gameUserCont:20, //比赛总人数
	gameUserContList:[],
	registeredUserCount:5,// 已经报名总人数
    participants: {}, 
    background : '/images/share-bg.png',
    introducer : '',
    options : ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.source != ''){
      let base64 = wx.getFileSystemManager().readFileSync(this.data.background, 'base64');
	  // console.log(base64);
      this.setData({
        background: 'data:image/png;base64,' + base64,
        options: options
      })
    }
	
	//测试代码
	let regArry = new Array(this.data.gameUserCont);
	this.setData({gameUserContList:regArry})
	regArry = null;
	//-end
	
    console.log('000 initial.js openid =' + app.globalData.openid)
    console.log('000 initial.js userInfo =' + app.globalData.userInfo)
   

    const info = JSON.parse(decodeURIComponent(options.gameinfo))
    this.setData({
      gameinfo: info,
      introducer: options.introducer
    })
    if (app.globalData.userInfo == "undefined" || app.globalData.userInfo == null) {
      console.log(' initial.js navigateTo =' + info.name)
      wx.navigateTo({
        url: '../index/index?gameinfo=' + encodeURIComponent(JSON.stringify(info)) + '&introducer=' + this.data.introducer
      })
    }
    var param = {
      gamenum: info.id
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
        } else {
          // 失败  
        }
      })
    var param = {
      num: info.id,
      player : app.globalData.openid
    }
    util.commonAjax('/api/getCurPartakeInfo', 0, param)
      .then(function (resolve) {
      if (resolve.data.state === 0) {
        // 成功  
        const obj = resolve.data.data.partake;
        if (typeof obj == "undefined" || obj == null || obj == "") {
        } else {
          that.setData({
            isparticipant: true
          })
          console.log('1 initial.js isparticipant = ' + that.data.isparticipant)
        }
      } else {
        // 失败  
      }
    })

  
    var param = {
      id: app.globalData.openid
    }
    var that = this
    util.commonAjax('/api/getuser', 0, param)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          const obj = resolve.data.data.wxuser;
          if (typeof obj == "undefined" || obj == null || obj == "") {
          } else {
            that.setData({
              hasUserInfo: true
            })
          }
        } else {
        }
      })
  },


  onShow: function () {
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1]; //当前页面
    let info = currPage.data.gameinfo
    if (info) {
      this.setData({
        gameinfo: info
      })
    }

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '生死看淡，不服来干',
      desc: '分享页面的内容',
      path: '/pages/initial/initial?gameinfo=' + encodeURIComponent(JSON.stringify(this.data.gameinfo)) +'&introducer=' + app.globalData.openid  // 路径，传递参数到指定页面。
    }
  },

   bindgetuserinfo: function (e) {

    // 订阅消息授权 只支持bingtap的出发方式
     wx.requestSubscribeMessage({
       tmplIds: ["iRwCjnpwDtRhFAdogxGdSsJXyp7sXBZDR0RskgLLe4A"],
       success: (res) => {
         if (res['iRwCjnpwDtRhFAdogxGdSsJXyp7sXBZDR0RskgLLe4A'] === 'accept') {
           wx.showToast({
             title: '订阅OK！',
             duration: 1000,
             success(data) {
               //成功
             }
           })
         }
       }
     })

    //app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: app.globalData.userInfo,
      hasUserInfo: true
    })

    var data = {
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv,
      code: app.globalData.code,
      userinfo: JSON.stringify(e.detail.userInfo),
      player: app.globalData.openid,
      gamenum: this.data.gameinfo.id,
      introducer: this.data.introducer
    }
    let that = this
     util.commonAjax('/api/joinGame', 0, data)
      .then(function (resolve) { 
        if (resolve.data.state === 0) {
          // 成功  
          app.globalData.openid = resolve.data.data.open_id
          wx.setStorageSync('userInfo', resolve.data.data)
          wx.setStorageSync('openid', resolve.data.data.open_id)
          // 新手们注意一下，记得把下面这个写到这里，有好处。  
          typeof cb == "function" && cb(app.globalData.userInfo)
          that.options.source = ''
          that.onLoad(that.options)
          
        } else {
          // 失败  
        }
      })
  },
  openCurrentGame: function (event) {
    if (!this.data.hasUserInfo){
      return
    }
    let iscreater = event.currentTarget.dataset.iscreater
    if(app.globalData.openid == this.data.gameinfo.creater ){
      iscreater = true;
    }
    let num = event.currentTarget.dataset.gid
    
    let gname = event.currentTarget.dataset.gname
    let pattern = event.currentTarget.dataset.pattern
    wx.redirectTo({
      url: '../match/match?num=' + num + '&iscreater=' + iscreater + '&gname=' + gname + "&pattern=" + pattern
    })
  },
})