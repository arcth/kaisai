const util = require('../../utils/util.js');
const app = getApp()
const socket = require('../../utils/websocket.js')
const api = app.globalData.api
Page({
	data:{
		CustomBar: app.globalData.CustomBar,
		isLogin:null,
		needLoginShow:false,
		userInfo:{}
	},
	onLoad:function(options){
		if(app.globalData.userInfo && app.globalData.openid){
			this.setData({
				isLogin:true,
				userInfo:app.globalData.userInfo
			})
		}
		this.init()
	},
	async init(){
    await api.showLoading() // 显示loading
    await this.isloginedUser()  
    await api.hideLoading() // 等待请求数据成功后，隐藏loading
  },
	isloginedUser(){
    return new Promise((resolve, reject) => {
      
      var param = {
        id: app.globalData.openid
      }
      var that = this
        api.commonAjax('/api/getuser', 0, param)
          .then(function (resolve) {
            if (resolve.data.state === 0) {
              const obj = resolve.data.data.wxuser;
              if (typeof obj == "undefined" || obj == null || obj == "") {
                
              } else {
                that.setData({
                  isLogin: true
                })
                if(!app.globalData.isConnect){
                  socket.connectSocket();
                  app.globalData.isConnect = true
                }
              }
            } else {
            }
          }).then((res) => {
          resolve()
         }) .catch((err) => {
            console.error(err)
            reject(err)
          })
    })
  },
	showLogin:function(){
		this.setData({
			needLoginShow:true
		})
	},
	hideModal:function(){
			  // this.animation.opacity(0).step();
		this.setData({needLoginShow:false});
	},
	handleGetUserInfo:function(e){
			  // debugger;
		let vm = this;
			  // console.log(vm);
		app.globalData.userInfo = e.detail.userInfo;
		var data = {
			encryptedData: e.detail.encryptedData, 
			iv: e.detail.iv, 
			code: app.globalData.code,
			userinfo: JSON.stringify(e.detail.userInfo)
		} 
		vm.setData({needLoginShow:false})
		util.commonAjax('/api/login', 0, data) 
			.then(function (resolve) {
			    if (resolve.data.state === 0) {
						console.log(resolve)
			        // 成功  
			        app.globalData.openid = resolve.data.data.open_id
			        wx.setStorageSync('userInfo', resolve.data.data)
			        wx.setStorageSync('openid', resolve.data.data.open_id)
					vm.setData({
						isLogin:true,
						userInfo: e.detail.userInfo,
					})
			        typeof cb == "function" && cb(app.globalData.userInfo)
			      } else {
			        console.log('/api/login 失败' )  
			      }
			    })
	},
	create:function(){
    wx.navigateTo({
      url: '../create/create'
    })
  }
})