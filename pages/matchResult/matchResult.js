// pages/match/match.js
const app = getApp()
const util = require('../../utils/util.js')

Page({
	data:{
		CustomBar: app.globalData.CustomBar,
		imageBaseUrl:'',
		winner:'',
		loser:'',
		mvps:''
	},
	onLoad:function(options){
		this.setData({
			imageBaseUrl:app.globalData.imageUrl,
			winner:JSON.parse(options.winner),
			loser:JSON.parse(options.loser),
			mvps:options.mvps
		})
	},
	fanCard:function(e){
		
	}
})