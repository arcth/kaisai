// pages/grouping/auto/auto.js
const util = require('../../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    imgList: [],
    pattern: '',
    round:null,
    redteam: null,
    blueteam: null,
    confirm: false,
    iscreater: false,
    game:null,
    uncheckteam: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let roundinfo = JSON.parse(decodeURIComponent(options.round))
    let pattern = options.pattern
    this.setData({
      pattern: options.pattern,
    })
    let that = this
    if(roundinfo.status == 2){
    var parameter= {
        id: roundinfo.id
      }
    util.commonAjax('/api/getCurRoundREC', 0, parameter)
      .then(function(resolve) {
        if (resolve.data.state === 0) {
          let redteam = resolve.data.data.RED
          that.setData({
            redteam: resolve.data.data.RED,
            blueteam: resolve.data.data.BLUE,
            uncheckteam: resolve.data.data.UNCHECK,
            confirm : true,
            round: roundinfo
          })
        } else {
          // 失败  
        }
    })
  }
    
//status =2 已分组。  
    if(roundinfo.status != 2 ){
    let param = {
      id: roundinfo.id,
      teammode:roundinfo.teammode,
      pattern: pattern
    }

    util.commonAjax('/api/getGroupingResult', 0, param)
      .then(function(resolve) {
        if (resolve.data.state === 0) {
          that.setData({
            redteam: resolve.data.data.RED,
            blueteam: resolve.data.data.BLUE,
            uncheckteam: resolve.data.data.UNCHECK,
            round: roundinfo
          })
        } else {
          // 失败  
        }
      })
    }
      /**
       *  解决：从分享页面进入的用户 需要通过是否为创建者判断 进行页面控制
       */
      var pm= {
        num: roundinfo.num,
        isovergame : 0
      }
      util.commonAjax('/api/getGameInfo', 0, pm)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          that.setData({
            game:resolve.data.data.game
          })
          if(app.globalData.openid == resolve.data.data.game.creater ){
            that.setData({
              iscreater : true
            })
          }
        } else {
          // 失败  
        }
      })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    if(this.data.confirm){
      return {
        title: '生而无畏，战至终章',
        desc: '分享页面的内容',
        path: '/pages/grouping/auto/auto?round=' + encodeURIComponent(JSON.stringify(this.data.round))
         + '&iscreater=' + this.data.iscreater + '&pattern=' + this.datapattern
      }
    }
  },
  record: function() {
   
    let round =JSON.stringify( this.data.round)
    let redteam = JSON.stringify(this.data.redteam)
    let blueteam = JSON.stringify(this.data.blueteam)
    let uncheckteam = JSON.stringify(this.data.uncheckteam)

    let param = {
      round:round,
      redteam: redteam,
      blueteam: blueteam,
      uncheckteam: uncheckteam,
    }
    var that = this
    util.commonAjax('/api/groupingConfirm', 0, param)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          that.setData({
            confirm : true
          })
        } else {
          // 失败  
        }
      })

      //进行分享 通知
  },
  torecord: function() {
    let redteam = JSON.stringify(this.data.redteam)
    let blueteam = JSON.stringify(this.data.blueteam)
    wx.redirectTo({
      url: '../../record/record?&redteam=' + redteam + '&blueteam=' + blueteam + "&num=" + this.data.round.num + "&pattern=" + this.data.pattern
    })
  }
})