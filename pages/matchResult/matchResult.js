// pages/match/match.js
const app = getApp()
const util = require('../../utils/util.js')

Page({
	data:{
		CustomBar: app.globalData.CustomBar,
		imageBaseUrl:'',
	},
	onLoad:function(options){
		this.setData({
			imageBaseUrl:app.globalData.imageUrl,
		})
	},
	fanCard:function(e){
		
	}
})