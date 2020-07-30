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
    broadcast:'',
    interval: '',     //定时器
    optionslist:{gname:'',round:''},
    coverAddress:app.globalData.url + '/cover/'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   this.startgetBroadcast();
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
          that.getBroadcast();
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }


})