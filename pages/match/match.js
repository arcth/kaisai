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
    statusdes : ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let iscreater = options.iscreater
    let num = options.num
    let gname = options.gname
    let pattern = options.pattern
    this.setData({
      num: num,
      iscreater: iscreater,
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log(" match.js round 3 =" + this.data.round.id)

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  toregister(event){
    let round = this.data.round
    let iscreater = this.data.iscreater
    let pattern = this.data.pattern
    wx.navigateTo({
      url: '../register/register?round=' + encodeURIComponent(JSON.stringify(round)) + '&iscreater=' + iscreater + '&pattern=' + pattern
    })
  }
})