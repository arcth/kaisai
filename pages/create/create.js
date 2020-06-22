var util = require('../../utils/util.js');
const app = getApp()
// pages/create/create.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 4,
    date: util.getNowFormatDate(),
    imgList: [],
    picker: ['1v1','2v2','3v3','4v4','5v5'],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var type = options.type
   // console.log('gametype =' + type)
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

  DateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },

  PickerChange(e) {
    
    this.setData({
      index: e.detail.value
    })
   
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
  textareaAInput(e) {
    this.setData({
      textareaAValue: e.detail.value
    })
  },

  formSubmit: function (e) {
    
    var gamename =  e.detail.value.gamename
    var pattern = parseInt(e.detail.value.pattern)+1
    var etime =  e.detail.value.etime
    var prop = e.detail.value.prop
    var describe = e.detail.value.describe

    //console.log(pattern)
    if (gamename.length === 0) {
        
    }else{

      var data ={
        gamename: gamename,
        pattern: pattern,
        etime: etime,
        prop: prop,
        describe: describe,
        openid: app.globalData.openid,
        num : null
      }
      util.commonAjax('/api/creategame', 0, data)
        .then(function (resolve) {
          if (resolve.data.state === 0) {
            var game = resolve.data.data.game
             wx.redirectTo ({ 
               url: '../initial/initial?gameinfo=' + encodeURIComponent(JSON.stringify(game)) + '&source=create' + '&introducer=' + app.globalData.openid 
             })
          } else {
            // 失败  
          }
        })


    }
  }
})