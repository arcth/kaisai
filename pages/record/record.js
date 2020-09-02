// pages/record/record.js
const util = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    index: 0,
    round:null,
    redteam: null,
    blueteam: null,
    redshows: null,
    blueshows: null,
    pattern: '',
    num: '',
    winner: [],
    winnerTeamName: '',
    winnerTeam:'',
    loser: [],
    mvps:'',
    tipsDialogvisible: false,
    oneButton: [{text: '确定'}],
    dialogmsg:'',
    imgList: [],
    vsImg:'/images/vs-banner.png',
    vsImgBase64:''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
     let pattern = options.pattern
     let round = JSON.parse(decodeURIComponent(options.round))
    let basePng = wx.getFileSystemManager().readFileSync(this.data.vsImg,'base64');

    this.setData({
       pattern: pattern,
       num:options.num,
       round:round,
      vsImgBase64:'data:image/png;base64,'+ basePng
    })
     this.getCurRoundREC(round)

  },
  getCurRoundREC(round){
    let that = this
    var parameter= {
      id: round.id
    }
    util.commonAjax('/api/getCurRoundREC', 0, parameter)
      .then(function(resolve) {
        if (resolve.data.state === 0) {
          let redteam = resolve.data.data.RED
          let blueteam = resolve.data.data.BLUE
          that.setData({
            redteam: redteam,
            blueteam: blueteam,
          })
        } else {
          // 失败  
        }
    })
  },
  tapDialogButton(e) {
	  this.setData({
	    tipsDialogvisible: false,
	   })
	},
	showTips:function(e){
		this.setData({
		    tipsDialogvisible: true
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
    let team = e.currentTarget.dataset.target
    switch(team){
      case 'RED':
        this.setData({
          winnerTeam: 'red',
          winner: this.data.redteam,
          loser: this.data.blueteam
        })
      break;
      case 'BLUE':
        this.setData({
          winnerTeam: 'blue',
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
  jumpToTeamList(){
    let that = this
    wx.navigateTo({
      url: '../matchResultTeam/matchResultTeam?redteam=' + JSON.stringify(this.data.redteam) 
      + '&blueteam=' + JSON.stringify(this.data.blueteam),
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        acceptDataFromOpenedPage: function(data) {
          console.log(data)
        },
        mvpSubmit: function(e) {
          that.setData({
            mvps : e.data
          })
        }
      }
    })
  },

  formSubmit: function (e) {
    
    let winner = JSON.stringify(this.data.winner)
    let loser = JSON.stringify(this.data.loser)
    if( this.data.winner == '' ){
      this.setData({
        tipsDialogvisible: true,
        dialogmsg : '请选择获胜队伍'
      }) 
      return
    }


    let redmvp = this.data.mvps.reduser == null ? '' : this.data.mvps.reduser.openid
    let bluemvp = this.data.mvps.blueuser == null ? '' : this.data.mvps.blueuser.openid
    let mvps = redmvp + "|" + bluemvp
    let param = {
      winners: winner,
      losers: loser,
      mvp: mvps
    }
    var that = this
    if (that.data.imgList != 0) {
      for (var index in that.data.imgList) {
        var filePath = that.data.imgList[index];
        wx.uploadFile({
          url: app.globalData.url + '/api/uploadPicture',
          filePath: filePath + '',
          name: 'file',
          formData:{
              roundid : that.data.redteam[0].id,
              gamenum : that.data.redteam[0].num,
              index : '_' + index,
              action : 'result'
          },
          header: {
            "Content-Type": "multipart/form-data"
          },
          success: function (res) {
            console.log(res)
            if( res.statusCode != 200){
              that.setData({
                tipsDialogvisible: true,
                dialogmsg : '上传图片含有违法违规内容！'
              })
              return
            }
            util.commonAjax('/api/record', 0, param)
            .then(function (resolve) {
              if (resolve.data.state === 0) {
                wx.redirectTo({
                  url: '../match/match?num=' + that.data.num + '&iscreater=' + true + 
                  '&pattern=' + that.data.pattern + '&isovergame=' + 0
                })
              } else {
                // 失败  
              }
            })
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
            return
          }
        });
      }
    }else{
      util.commonAjax('/api/record', 0, param)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          // wx.redirectTo({
          //   url: '../match/match?num=' + that.data.num + '&iscreater=' + true + 
          //   '&pattern=' + that.data.pattern + '&isovergame=' + 0
          // })
          wx.redirectTo({
              url: '../matchResult/matchResult?gamenum='+ that.data.num + '&roundid='+ that.data.round.id
            })
        } else {
          // 失败  
        }
      })
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
  submitWinnerTeam(e){
    switch(this.data.winnerTeam){
      case 'red':
        this.setData({
          winnerTeamName: '红队'
        })
      break;
      case 'blue':
        this.setData({
          winnerTeamName: '蓝队'
        })
        break;
    }
    this.hideModal(e)
  }

})