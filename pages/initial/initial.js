// pages/initial/initial.js
const app = getApp()
const socket = require('../../utils/websocket.js')
const util = require('../../utils/util.js')
const api = app.globalData.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gameinfo : {},
	  isShow:false,
    isSponsor : false,
    userInfo: {},
    hasUserInfo: false,
    isparticipant : false, //是否已经是参赛者
	  gameUserCont:'∞', //比赛总人数
	  gameUserContList:[],
 	  registeredUserCount:5,// 已经报名总人数
    participants: {}, 
    background : '/images/share-bg.png',
    introducer : '',
    options : '',
    imageBaseUrl:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   

    if (options.source != ''){
      this.setData({
        imageBaseUrl:app.globalData.imageUrl,
        options: options
      })
    }
	
	//测试代码
	let regArry = new Array(this.data.gameUserCont);
	this.setData({gameUserContList:regArry})
	regArry = null;
	//-end
	

    //const info = JSON.parse(decodeURIComponent(options.gameinfo))
    const info = JSON.parse(decodeURIComponent(options.gameinfo))
    this.setData({
      gameinfo: info,
      introducer: options.introducer
    })
    this.init()
  },

  async init(){
    await api.showLoading() // 显示loading
    await this.isloginedUser()  
    await this.isparticipant()
    await this.getParticipants()
    await api.hideLoading() // 等待请求数据成功后，隐藏loading
  },


  isloginedUser(){
    return new Promise((resolve, reject) => {
      
      var param = {
        id: app.globalData.openid
      }
      var that = this
        api.commonAjax('/api/getuser', 0, param)
          .then(function (resolve) {
            if (resolve.data.state === 0) {
              const obj = resolve.data.data.wxuser;
              if (typeof obj == "undefined" || obj == null || obj == "") {
                
              } else {
                that.setData({
                  hasUserInfo: true
                })
                if(!app.globalData.isConnect){
                  socket.connectSocket();
                  app.globalData.isConnect = true
                }
              }
            } else {
            }
          }).then((res) => {
          resolve()
         }) .catch((err) => {
            console.error(err)
            reject(err)
          })
    })
  },
  isparticipant(){
    return new Promise((resolve, reject) => {
      var param = {
        num: this.data.gameinfo.id,
        player : app.globalData.openid
      }
      var that = this
      api.commonAjax('/api/getCurPartakeInfo', 0, param)
        .then(function (resolve) {
        if (resolve.data.state === 0) {
          // 成功  
          const obj = resolve.data.data.partake;
          if (typeof obj == "undefined" || obj == null || obj == "") {
          } else {
            that.setData({
              isparticipant: true
            })
          }
        } else {
          // 失败  
        }
        }).then((res) => {
          resolve()
        }) .catch((err) => {
            console.error(err)
            reject(err)
          })
    })
  },
  getParticipants(){
    return new Promise((resolve, reject) => { 
      var param = {
        gamenum: this.data.gameinfo.id,
        status: 0
      }
      var that = this
      api.commonAjax('/api/getParticipants', 0, param)
        .then(function (resolve) {
          if (resolve.data.state === 0) {
            // 成功  
            const obj = resolve.data.data.participants;
            that.setData({
              participants: obj,
              registeredUserCount: obj.length
            })
          } else {
            // 失败  
          }
        }).then((res) => {
          resolve()
        }) .catch((err) => {
            console.error(err)
            reject(err)
          })
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
  hideModal(e) {
    // this.setData({
    //   modalName: null
    // })
    this.setData({isShow:false});
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

  login:function(e){
    this.setData({
      // modalName: 'login',
	  isShow:true
    })
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
    let that = this
    this.setData({isShow:false});
    util.commonAjax('/api/login', 0, data) 
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          // 成功  
          app.globalData.openid = resolve.data.data.open_id
          app.globalData.socketId = resolve.data.data.open_id
          wx.setStorageSync('userInfo', resolve.data.data)
          wx.setStorageSync('openid', resolve.data.data.open_id)
          typeof cb == "function" && cb(app.globalData.userInfo)
          that.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
          }) 
          that.onLoad(that.options)
        } else {
          console.log('/api/login 失败' )  
        }
      })
    
  },

   joingame: function (e) {

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
      userInfo: app.globalData.userInfo
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
      url: '../match/match?num=' + num + '&iscreater=' + iscreater + '&gname=' + gname + "&pattern=" + pattern + "&isovergame=0" 
    })
  },
})