// pages/match/match.js
const app = getApp()
const socket = require('../../utils/websocket.js')
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    iscreater : false,
    num : '',
    gname : '',
    pattern : '',
    round : '',
    top : '',
    top_field : '',
    totalfield : '',
    totalmvp : '',
    statusdes : '',
    gameinfo : '',
    isovergame : 0,
    roundsdesc:'',
    imageBaseUrl:'',
    average:'0.0%',
    historyList:''
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //socket.closeSocket();
    var fields = {
      socketid:app.globalData.openid
    }
    util.commonAjax('/api/onlinejudge', 0, fields)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          console.log('onlinejudge : ' + app.globalData.openid + '  '+ resolve.data.data.isconnect )
          if(!resolve.data.data.isconnect){
            socket.connectSocket();
            app.globalData.isConnect = true
          }
        } else {
          // 失败  
        }
      })
    
    



    this.setData({
      imageBaseUrl:app.globalData.imageUrl,
    })
    if (options.iscreater === 'true'){
      this.setData({
        iscreater : true
      })
    } else if (options.iscreater === 'false'){
      this.setData({
        iscreater : false
      })
    }
    let num = options.num
    let gname = options.gname
    let pattern = options.pattern
    let isovergame = options.isovergame
    this.setData({
      num: num,
      gname: gname,
      pattern: pattern,
      isovergame : isovergame
    })
    let param = {
      num: num,
      rounds:'',
      isovergame : isovergame
    }
    let that = this
    if(isovergame == 0){
      util.commonAjax('/api/getRound', 0, param)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          // 成功  
          that.setData({
            round: resolve.data.data.curRound,
            statusdes: resolve.data.data.statusdes,
            roundsdesc : ' 第' + resolve.data.data.curRound.rounds + '轮 进行中' 
          })
        } else {
          // 失败  
        }
      })
    }else{
      that.setData({
        roundsdesc:' 系列赛完结'
      })
    }
    
    var parameter = {
      num: num,
      isovergame : isovergame
    }
     util.commonAjax('/api/getGameInfo', 0, parameter)
      .then(function (resolve) {
        // 这里自然不用解释了，这是接口返回的参数  
        if (resolve.data.state === 0) {
          // console.log(" match = " + resolve.data.data.statusdes)
          // 成功  
          that.setData({
            gameinfo: resolve.data.data.game,
            gname: resolve.data.data.game.name
          })
          if(app.globalData.openid == that.data.gameinfo.creater ){
            that.setData({
              iscreater : true
            })
          }

        } else {
          // 失败  
        }
      }) 

    util.commonAjax('/api/getTop', 0, param)
      .then(function (resolve) {  
        if (resolve.data.state === 0) {
          // console.log(" match = " + resolve.data.data.statusdes)
          // 成功  
          let top = resolve.data.data.top
          let top_field = resolve.data.data.top_field
          let totalfield;
          let totalmvp;
          let average;
          top.forEach(function (item, index) {
            if (item.player == app.globalData.openid){
              totalfield = item.totalfield
              totalmvp = item.totalmvp
              average = item.average
            }
            
          })
          that.setData({
            top:top,
            top_field : top_field,
            totalfield: totalfield,
            totalmvp: totalmvp,
            average:average
          })
        } else {
          // 失败  
        }
      })
      this.gethistroyrounds(num,isovergame)
  },
  //onload end

  gethistroyrounds(num,isovergame){
    var parameter = {
      num: num,
      player:app.globalData.openid,
      isovergame : isovergame
    }
    let that = this
    util.commonAjax('/api/getHistroyRounds', 0, parameter)
    .then(function (resolve) {
      // 这里自然不用解释了，这是接口返回的参数  
      if (resolve.data.state === 0) {
        let historyList = resolve.data.data.historyList
        that.setData({
          historyList : historyList
        })
      } else {
        // 失败  
      }
    }) 
  },

  onPullDownRefresh : function(){
    wx.stopPullDownRefresh({
      complete: (res) => {
        getCurrentPages()[getCurrentPages().length - 1].onLoad(this.options)
      },
    })
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

  toregister(event){
    let round = this.data.round
    let iscreater = this.data.iscreater
    let pattern = this.data.pattern
    let num = this.data.num
    //2--已经分组完成 直接进入分组结果页面 
    if(round.status == 2 ){
      wx.redirectTo({
        url: '../grouping/auto/auto?round=' + encodeURIComponent(JSON.stringify(round)) + '&iscreater=' + iscreater + '&pattern=' + pattern + '&num=' + num
      })
    }else if(round.status === 0 || round.status === 1){
      wx.navigateTo({
        url: '../register/register?round=' + encodeURIComponent(JSON.stringify(round)) + '&iscreater=' + iscreater + '&pattern=' + pattern + '&num=' + num
      })
    }else if( round.status === 3){
       if(iscreater){
        wx.redirectTo({
          url: '../grouping/auto/auto?round=' + encodeURIComponent(JSON.stringify(round)) + '&iscreater=' + iscreater + '&pattern=' + pattern + '&num=' + num
        })
       }else{
        wx.navigateTo({
          url: '../register/register?round=' + encodeURIComponent(JSON.stringify(round)) + '&iscreater=' + iscreater + '&pattern=' + pattern + '&num=' + num
        })
       }
    }else{
      return false;
    }
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  toResult:function(e){
    wx.navigateTo({
      url: '../roundResult/roundResult?isovergame='+this.data.isovergame + '&num=' + this.data.num
      +  '&rounds=' + e.currentTarget.dataset.rounds +'&gname='+this.data.gname + '&roundid=' + e.currentTarget.dataset.id,
    })
  }
})
