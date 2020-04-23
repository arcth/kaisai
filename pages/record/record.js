// pages/record/record.js
const util = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    redteam: null,
    blueteam: null,
    redshows: null,
    blueshows: null,
    pattern: '',
    num: '',
    winner: [],
    loser: [],
    imgList: []

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    let redteam = JSON.parse(decodeURIComponent(options.redteam))
    let blueteam = JSON.parse(decodeURIComponent(options.blueteam))
    let pattern = options.pattern
    this.setData({
      redteam: redteam,
      blueteam: blueteam,
      pattern: pattern,
      num:options.num
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

  ChooseImage() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '召唤师',
      content: '确定要删除吗？',
      cancelText: '再看看',
      confirmText: '確定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },
  teamradiochange: function(e){
    let team = e.detail.value
    switch(team){
      case 'RED':
        this.setData({
          winner: this.data.redteam,
          loser: this.data.blueteam
        })
      break;
      case 'BLUE':
        this.setData({
          winner: this.data.blueteam,
          loser: this.data.redteam
        })
        break;
    }
  },
  redmvpradiochange: function (e) {
    this.setData({
      redshows: e.detail.value
    })
  },
  bluemvpradiochange: function (e) {
    this.setData({
      blueshows: e.detail.value
    })
  },
  

  formSubmit: function (e) {
    
    let winner = JSON.stringify(this.data.winner)
    let loser = JSON.stringify(this.data.loser)
    let param = {
      winners: winner,
      losers: loser,
      mvp: this.data.redshows + '|' + this.data.blueshows,
    }
    var that = this
    util.commonAjax('/api/record', 0, param)
      .then(function (resolve) {
        console.log('record.js 跳转到match页的时候 pattern参数 =' + that.data.pattern)
        if (resolve.data.state === 0) {
          wx.redirectTo({
            url: '../match/match?num=' + that.data.num + '&iscreater=' + true + '&pattern=' + that.data.pattern
          })
        } else {
          // 失败  
        }
      })
  }
})