// pages/community/community.js
var util = require('../../utils/util.js');
const app = getApp()
const api = app.globalData.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    storeAddress:'',
    userInfo: {},
    hasUserInfo: false,
    broadcast:'',
    interval: '',     //定时器
    optionslist:{gname:'',round:''},
    coverAddress:app.globalData.url + '/',
    tempPageNum: [],
    pageNum: 1,
    needLoginShow:false,
    totalPages:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(app.globalData.userInfo && app.globalData.openid){
			this.setData({
				hasUserInfo:true,
				userInfo:app.globalData.userInfo
			})
		}
   this.getBroadcastPage(1,4)
  // this.startgetBroadcast();
  },
  async init(){
    await api.showLoading() // 显示loading
    await this.isloginedUser()  
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
  getBroadcastPage(pageNum,pageSize){
    let self = this
    let parameter = {
      gamenum:'',
      pageNum: 1, 
      pageSize: pageSize * pageNum
    }
    api.commonAjax('/api/getbroadcastPage', 0, parameter)
         .then(function (resolve) {
           if (resolve.data.state === 0) {
            self.setData({
              broadcast: resolve.data.data.pageResult.content,
              totalPages:resolve.data.data.pageResult.totalPages,
            })
           }
 
     })
 },
 
  goto:function(e){
    var type = e.currentTarget.dataset.type
    var gamenum = e.currentTarget.dataset.gamenum
    var roundid = e.currentTarget.dataset.roundid
    var gamestatus = e.currentTarget.dataset.gamestatus
    var topic = e.currentTarget.dataset.topic
    var rounds = ''
    if(type == 'RECORD'){
      rounds = topic.match(/第([0-9]*)轮/)[1]
    }

    this.getGameInfo(gamenum,gamestatus,rounds,type)
   
  },
  getGameInfo:function(gamenum,gamestatus,rounds,type){
    return new Promise((resolve, reject) => {
    var parameter = {
      num: gamenum,
      isovergame : gamestatus
    }
    let that = this
    api.commonAjax('/api/getGameInfo', 0, parameter)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          // let gname = 'optionslist.gname'
          // that.setData({
          //   [gname] : resolve.data.data.game.name
          // })
          var game = resolve.data.data.game
          var gamename = game.name
          if(type == 'RECORD'){
            wx.navigateTo({
              url: '../roundResult/roundResult?isovergame='+gamestatus + '&num=' + gamenum
              +  '&rounds=' + rounds +'&gname='+gamename,
            })
          } 
          if(type == 'CREATEGAME'){
            wx.navigateTo ({ 
              url: '../initial/initial?gameinfo=' + encodeURIComponent(JSON.stringify(game)) + '&source=community' + '&introducer=community' 
            })
          }
          
        }
      }) }).then((res) => {
        resolve()
      }) .catch((err) => {
          console.error(err)
          reject(err)
      })
  },
  
  getBroadcast(){
     let self = this
     let parameter = {
       gamenum:''
     }
     api.commonAjax('/api/getBroadcast', 0, parameter)
          .then(function (resolve) {
            if (resolve.data.state === 0) {
              self.setData({
                broadcast: resolve.data.data.broadcast
              })
            }
      })
  },
    /**
     * 轮询计划
    */
   startgetBroadcast:function () {
    var that = this;
    that.init(that);          //这步很重要，没有这步，重复点击会出现多个定时器
    var interval = setInterval(function () {
          var pageNum = that.data.pageNum
          that.getBroadcastPage(1,4*pageNum);
    },1000)
    that.setData({
       interval:interval
    })
 },
 init: function (that) {
  var time = 60;
  var interval = ""
  that.clearTimeInterval(that)
  that.setData({
    interval: interval,
    })
 },
 /**
   * 清除interval
   * @param that
  */
 clearTimeInterval: function (that) {
  var interval = that.data.interval;
  clearInterval(interval)
},


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var that = this;
    that.clearTimeInterval(that)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this;
    that.clearTimeInterval(that)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh({
      complete: (res) => {
        this.getBroadcastPage(this.data.pageNum,4)
      },
    })
  },
  personalCenter:function(){
    wx.navigateTo({
      url: '../personalCenter/personalCenter',
    })
  },
  create:function(){
    wx.navigateTo({
      url: '../create/create'
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
     var curreachPage =   this.data.pageNum 
     if(curreachPage <= this.data.totalPages){
      this.setData({
        pageNum: this.data.pageNum + 1
       })
       this.getBroadcastPage(this.data.pageNum,4)
     }
  },
  showLogin:function(){
		this.setData({
			needLoginShow:true
		})
  },
  hideModal:function(){
    this.setData({
      needLoginShow:false
    });
  },
  bindgetuserinfo:function(e){
    // debugger;
  let vm = this;
      // console.log(vm);
  app.globalData.userInfo = e.detail.userInfo;
  var data = {
    encryptedData: e.detail.encryptedData, 
    iv: e.detail.iv, 
    code: app.globalData.code,
    userinfo: JSON.stringify(e.detail.userInfo)
  } 
  vm.setData({needLoginShow:false})
  util.commonAjax('/api/login', 0, data) 
    .then(function (resolve) {
        if (resolve.data.state === 0) {
          console.log(resolve)
            // 成功  
            app.globalData.openid = resolve.data.data.open_id
            wx.setStorageSync('userInfo', resolve.data.data)
            wx.setStorageSync('openid', resolve.data.data.open_id)
        vm.setData({
          hasUserInfo:true,
          userInfo: e.detail.userInfo,
        })
            typeof cb == "function" && cb(app.globalData.userInfo)
          } else {
            console.log('/api/login 失败' )  
          }
        })
    }

})