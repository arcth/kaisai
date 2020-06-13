// pages/match/match.js
const app = getApp()
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iscreater : false,
    num : '',
    gname : '',
    pattern : '',
    round : '',
    top : '',
    totalfield : '',
    totalmvp : '',
    statusdes : '',
    gameinfo : '',
	imageBaseUrl:'',
    background: '/images/logo.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let base64 = wx.getFileSystemManager().readFileSync(this.data.background, 'base64');
    this.setData({
      background: 'data:image/png;base64,' + base64,
	  imageBaseUrl:app.globalData.imageUrl
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
    this.setData({
      num: num,
      gname: gname,
      pattern: pattern
    })
    let param = {
      num: num
    }
    let that = this
    util.commonAjax('/api/getRound', 0, param)
      .then(function (resolve) {
        // 这里自然不用解释了，这是接口返回的参数  
        if (resolve.data.state === 0) {
         // console.log(" match = " + resolve.data.data.statusdes)
          // 成功  
          that.setData({
            round: resolve.data.data.curRound,
            statusdes: resolve.data.data.statusdes    
          })
        } else {
          // 失败  
        }
      })

    /** util.commonAjax('/api/getGameinfo', 0, param)
      .then(function (resolve) {
        // 这里自然不用解释了，这是接口返回的参数  
        if (resolve.data.state === 0) {
          // console.log(" match = " + resolve.data.data.statusdes)
          // 成功  
          that.setData({
            gameinfo: resolve.data.data.game
          })
          if(app.globalData.openid == that.gameinfo.creater ){
            that.setData({
              iscreater : true
            })
          }

        } else {
          // 失败  
        }
      }) **/

    util.commonAjax('/api/getTop', 0, param)
      .then(function (resolve) {  
        if (resolve.data.state === 0) {
          // console.log(" match = " + resolve.data.data.statusdes)
          // 成功  
          let top = resolve.data.data.top
          let totalfield;
          let totalmvp;
          top.forEach(function (item, index) {
            if (item.player == app.globalData.openid){
              totalfield = item.totalfield
              totalmvp = item.totalmvp
            }
          })
          that.setData({
            top: resolve.data.data.top,
            totalfield: totalfield,
            totalmvp: totalmvp
          })
        } else {
          // 失败  
        }
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
    //2--已经分组完成 直接进入分组结果页面 
    if(round.status == 2){
      wx.navigateTo({
        url: '../register/register?round=' + encodeURIComponent(JSON.stringify(round)) + '&iscreater=' + iscreater + '&pattern=' + pattern
      })
    }else{
      wx.navigateTo({
        url: '../register/register?round=' + encodeURIComponent(JSON.stringify(round)) + '&iscreater=' + iscreater + '&pattern=' + pattern
      })
    }
 
  }
})