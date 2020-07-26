// pages/match/match.js
const app = getApp()
const util = require('../../utils/util.js')

Page({
	data:{
		a:1,
		istap:false,
		CustomBar: app.globalData.CustomBar,
	},
	onLoad:function(options){},
	fanCard:function(e){
		this.setData({
			istap:true
		})
	}
})