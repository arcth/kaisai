// pages/roundResult/roundRresult.js
const app = getApp()
const util = require('../../utils/util.js')
const api = app.globalData.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    imageBaseUrl:'',
    top : '',
    top_field : '',
    totalfield : '',
    totalmvp : '',
    win:'',
    lose:'',
    gname:'',
    resultimg : '',
    staticimgurladdress: app.globalData.url + '/',
    vsImg:'/images/vs-banner.png',
    vsImgBase64:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let basePng = wx.getFileSystemManager().readFileSync(this.data.vsImg,'base64');
    this.setData({
      imageBaseUrl:app.globalData.imageUrl,
      vsImgBase64:'data:image/png;base64,'+ basePng,
      num:options.num,
      rounds:options.rounds,
      roundid:options.roundid,
      gname:options.gname,
      isovergame:options.isovergame
    })
    this.getThatTimeTop()
    this.getRoundResult()
    this.getRound()
  },
  getRound(){
    let param = {
      id: this.data.roundid,
      isovergame : this.data.isovergame
    }
    let that = this
    api.commonAjax('/api/getRoundinfoByID', 0, param)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          var round = resolve.data.data.round
          that.setData({
            resultimg : round.resultimg
          })
        }else {
          // 失败  
        }
      })
  },
  getThatTimeTop(){
    return new Promise((resolve, reject) => {
    let parameter = {
      num: this.data.num,
      rounds: this.data.rounds,
      isovergame : this.data.isovergame
    }
    let that = this      
      api.commonAjax('/api/getTop', 0, parameter)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
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
        }else {
          // 失败  
        }
      }).then((res) => {
        resolve()
      })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  },
  
  getRoundResult(){
    return new Promise((resolve, reject) => {
    let parameter = {
      num: this.data.num,
      rounds: this.data.rounds,
      isovergame : this.data.isovergame
    }
    let that = this      
      api.commonAjax('/api/getRoundResult', 0, parameter)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          let win = resolve.data.data.win
          let lose = resolve.data.data.lose
         
          that.setData({
            win:win,
            lose : lose
          })
        }else {
          // 失败  
        }
      }).then((res) => {
        resolve()
      })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  },
  ViewImage(e) {
    wx.previewImage({
      urls: [this.data.staticimgurladdress + this.data.resultimg],
      current: e.currentTarget.dataset.url
    });
  }


})