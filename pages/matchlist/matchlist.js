// pages/matchlist/matchlist.js
const app = getApp()
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid :'',
    gamelist: {},
    background: "/images/wzry1.jpg"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let base64 = wx.getFileSystemManager().readFileSync(this.data.background, 'base64');
    this.setData({
      background: 'data:image/png;base64,' + base64
    })
    var param = {
      openid: app.globalData.openid,
      status: options.status
    }
    var that = this
    util.commonAjax('/api/selectGameinfoByOpenid', 0, param)
      .then(function (resolve) {
        // 这里自然不用解释了，这是接口返回的参数  
        if (resolve.data.state === 0) {
          // 成功  
          that.setData({
            openid: app.globalData.openid,
            gamelist: resolve.data.data.gamelist
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
  
  
  openCurrentGame: function(event) {
    let num = event.currentTarget.dataset.gid
    let iscreater = event.currentTarget.dataset.iscreater
    let gname = event.currentTarget.dataset.gname
    let pattern = event.currentTarget.dataset.pattern
    wx.redirectTo({
      url: '../match/match?num=' + num + '&iscreater=' + iscreater + '&gname=' + gname + "&pattern=" + pattern
    })
  },
})