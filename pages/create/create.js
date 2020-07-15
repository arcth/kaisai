var util = require('../../utils/util.js');
const app = getApp()
// pages/create/create.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
	  isShow:false,
    index: 4,
    date: util.getNowFormatDate(),
    imgList: [],
    tipsDialogvisible: false,
    oneButton: [{text: '确定'}],
    dialogmsg:'',
    picker: ['1v1','2v2','3v3','4v4','5v5'],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var type = options.type
   // console.log('gametype =' + type)
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
  handleHideModal(e) {
	  // debugger;
	
    this.setData({
      modalName: null
    })
  },

  formSubmit: function (e) {

    //判断是否登录
	// debugger;
    if (!(app.globalData.userInfo && app.globalData.openid)) {
    
      this.setData({
        modalName: 'login',
		isShow:true
      })
      let pages = getCurrentPages() //页面栈    
      pages.onLoad
      return
    }
    
    var gamename =  e.detail.value.gamename
    var pattern = parseInt(e.detail.value.pattern)+1
    var etime =  e.detail.value.etime
    var prop = e.detail.value.prop
    var describe = e.detail.value.describe

    //console.log(pattern)
    if (gamename.length === 0) {
        wx.showToast({
          title: '请输入比赛名称',
          icon: 'none',
          duration: 2000
        })
		return;
    }
	if(gamename.length > 20){
		wx.showToast({
		  title: '比赛名称请勿超过20个字',
		  icon: 'none',
		  duration: 2000
		})
		return;
	}
	  
      var data ={
        gamename: gamename,
        pattern: pattern,
        etime: etime,
        prop: prop,
        describe: describe,
        openid: app.globalData.openid,
        num : null
      }
      let that = this
      util.commonAjax('/api/creategame', 0, data)
        .then(function (resolve) {
          if (resolve.data.state === 0) {
            var game = resolve.data.data.game
             wx.redirectTo ({ 
               url: '../initial/initial?gameinfo=' + encodeURIComponent(JSON.stringify(game)) + '&source=create' + '&introducer=' + app.globalData.openid 
             })
          } else if(resolve.data.state === 2){
            // 检查失败
            var errmsg =   resolve.data.data.errmsg
            that.setData({
              tipsDialogvisible: true,
              dialogmsg : errmsg
            })
          }
        })
    
  },
  
  // bindgetuserinfo: function(e) {
    
  //   app.globalData.userInfo = e.detail.userInfo
  //   debugger;
  //   this.setData({
  //     userInfo: e.detail.userInfo,
  //     hasUserInfo: true
  //   }) 

  //   var data = { 
  //     encryptedData: e.detail.encryptedData, 
  //     iv: e.detail.iv, 
  //     code: app.globalData.code,
  //     userinfo: JSON.stringify(e.detail.userInfo)
  //     } 
  //   util.commonAjax('/api/login', 0, data) 
  //     .then(function (resolve) {
  //       if (resolve.data.state === 0) {
  //         // 成功  
  //         app.globalData.openid = resolve.data.data.open_id
  //         wx.setStorageSync('userInfo', resolve.data.data)
  //         wx.setStorageSync('openid', resolve.data.data.open_id)
  //         typeof cb == "function" && cb(app.globalData.userInfo)
  //       } else {
  //         console.log('/api/login 失败' )  
  //       }
  //     })
    
  // },
})