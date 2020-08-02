const util = require('../../utils/util.js');
const app = getApp()
Page({
	data:{
		isLogin:false,
		needLoginShow:false,
	},
	onLoad:function(options){
		var that = this;
		if(app.globalData.userInfo && app.globalData.openid){
			this.setData({
				isLogin:true
			})
		}
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
			        // 成功  
			        app.globalData.openid = resolve.data.data.open_id
			        wx.setStorageSync('userInfo', resolve.data.data)
			        wx.setStorageSync('openid', resolve.data.data.open_id)
					vm.setData({isLogin:true})
			        typeof cb == "function" && cb(app.globalData.userInfo)
			      } else {
			        console.log('/api/login 失败' )  
			      }
			    })
	}
})