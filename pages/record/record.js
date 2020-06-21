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

  ChooseImage() {
    wx.chooseImage({
      count: 1, //默认9 最多可以选择的图片张数
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
      title: '亲爱的!',
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
    if (that.data.imgList != 0) {
      for (var index in that.data.imgList) {
        var filePath = that.data.imgList[index];
        wx.uploadFile({
          url: app.globalData.url + '/api/uploadPicture',
          // url : app.data.baseurl + 'baiduFaceAndCompare?sfzh=' + app.data.user.sfzh,
          filePath: filePath + '',
          name: 'file',
          formData:{
              roundid : that.data.redteam[0].id,
              gamenum : that.data.redteam[0].num,
              index : index
          },
          header: {
            "Content-Type": "multipart/form-data"
          },
          success: function (res) {
            var newlist = new Array();
            var oldlist = that.data.list;
            for (var obj in that.data.list){
              if (that.data.list[obj].id == e.currentTarget.dataset.id){
                 oldlist[obj].finish = true;
              }
            }
            that.setData({
              list: oldlist
            })
          },
          fail: function (err) {
            console.log(err)
          }
        });
      }
    }
     util.commonAjax('/api/record', 0, param)
      .then(function (resolve) {
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