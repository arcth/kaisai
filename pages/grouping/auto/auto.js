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
    uncheckteam: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let roundinfo = JSON.parse(decodeURIComponent(options.round))
    let iscreater = options.iscreater
    let pattern = options.pattern
    this.setData({
      pattern: options.pattern
    })
    let param = {
      id: roundinfo.id,
      teammode: roundinfo.teammode,
      pattern: pattern
    }
    var that = this
    util.commonAjax('/api/getGroupingResult', 0, param)
      .then(function(resolve) {
        if (resolve.data.state === 0) {
          let redteam = resolve.data.data.RED
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

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  record: function() {
   
    let round = this.data.round
    let redteam = JSON.stringify(this.data.redteam)
    let blueteam = JSON.stringify(this.data.blueteam)
    let uncheckteam = JSON.stringify(this.data.uncheckteam)

    let param = {
      redteam: redteam,
      blueteam: blueteam,
      uncheckteam: uncheckteam,
    }
    var that = this
    util.commonAjax('/api/groupingConfirm', 0, param)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          wx.redirectTo({
            url: '../../record/record?&redteam=' + redteam + '&blueteam=' + blueteam + "&num=" + round.num + "&pattern=" + that.data.pattern
          })
        } else {
          // 失败  
        }
      })

    
   


  }
})