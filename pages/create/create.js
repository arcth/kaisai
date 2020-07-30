var util = require('../../utils/util.js');
const app = getApp()
const api = app.globalData.api
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
    imgtype:'',
    iscover:false,
    cover: app.globalData.url + '/cover/default.jpg',
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
  Choosecover() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
          this.setData({
            cover: res.tempFilePaths,
            iscover:true
          })
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
    var publishtype = e.detail.value.publishtype
    var describe = e.detail.value.describe

    if(publishtype){
      publishtype = 'public'
    }else{
      publishtype = 'private'
    }

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
  this.init(gamename,pattern,etime,prop,publishtype,describe)
  },
  
  async init(gamename,pattern,etime,prop,publishtype,describe){
    let that = this
    await api.showLoading() // 显示loading
    if(this.data.iscover){
      await this.checkCover().then(function (resolve, reject) {
        var _data = JSON.parse(resolve.data)
        if(_data.state == 2){
          that.setData({
            tipsDialogvisible: true,
            dialogmsg : '上传图片含有违法违规内容!',
          })
          api.hideLoading() 
        }
        that.setData({
          imgtype:_data.data.imgtype
        })
      })
    }
    if(!that.data.tipsDialogvisible){
      await  that.creategame(gamename,pattern,etime,prop,publishtype,describe,that.data.imgtype)  
      await  api.hideLoading() 
    }
  
    // 等待请求数据成功后，隐藏loading
  },
  creategame:function(gamename,pattern,etime,prop,publishtype,describe,imgtype){
    return new Promise((resolve, reject) => {
      var data ={
        gamename: gamename,
        pattern: pattern,
        etime: etime,
        prop: prop,
        publishtype:publishtype,
        describe: describe,
        openid: app.globalData.openid,
        iscover:this.data.iscover,
        imgtype:imgtype
      }
      let that = this

        api.commonAjax('/api/creategame', 0, data)
        .then(function (resolve) {
          if (resolve.data.state === 0) {
            var game = resolve.data.data.game
            that.setData({
              game: game
            })
            if(that.data.iscover){
               that.uploadCover(game)
            }
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
            api.hideLoading() 
          }
        })
    }).then((res) => {
      resolve()
    }) .catch((err) => {
        console.error(err)
        reject(err)
    })
  },
  checkCover:function(){
    let that = this
    var promise = new Promise(function (resolve, reject, defaults) {
      wx.uploadFile({
        url: app.globalData.url + '/api/checkPicture',
        filePath: that.data.cover + '',
        name: 'file',
        header: {
          "Content-Type": "multipart/form-data"
        },
        success:  resolve
      })
    });
    return promise;
  },
  uploadCover:function(game){
    return new Promise((resolve, reject) => {
      let that = this
      wx.uploadFile({
        url: app.globalData.url + '/api/uploadPicture',
        filePath: that.data.cover + '',
        name: 'file',
        formData:{
            roundid : game.id,
            gamenum : game.id,
            index : '_cover',
            action : 'cover'
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
        },
        fail: function (err) {
          return
        }
      });
    }).then((res) => {
      resolve()
    }) .catch((err) => {
        console.error(err)
        reject(err)
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