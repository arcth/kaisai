// pages/match/match.js
const app = getApp()
const util = require('../../utils/util.js')

Page({
	data:{
		isVictory:false,
		CustomBar: app.globalData.CustomBar,
		imageBaseUrl:'',
		winner:'',
		loser:'',
		winnerMvp:'',
		loserMvp:'',
		gamenum:'',
		game:'',
		iscreater:false
	},
	onLoad:function(options){
		this.setData({
			imageBaseUrl:app.globalData.imageUrl,
			gamenum:options.gamenum,
			roundid:options.roundid,
		})
		this.getGameInfo(options.gamenum)
		this.getRoundRECInfo(options.roundid)
	},

	getGameInfo(gamenum){
    let num = gamenum
		let parameter = {
      num: num,
      isovergame : '0'
		}
		let that = this
     util.commonAjax('/api/getGameInfo', 0, parameter)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          that.setData({
            game: resolve.data.data.game,
          })
          if(app.globalData.openid == that.data.game.creater ){
            that.setData({
              iscreater : true
            })
          }
        } else {
          // 失败  
        }
      }) 
	},

	getRoundRECInfo(roundid){
    let parameter = {
			roundid:roundid
		}
		let that = this
		util.commonAjax('/api/getRoundResultByroundid', 0, parameter)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          that.setData({
						winner: resolve.data.data.win,
						winnerMvp : resolve.data.data.winnerMvp,
						loser:resolve.data.data.lose,
						loserMvp:resolve.data.data.loserMvp,
						rounds:resolve.data.data.rounds,
          })
        } else {
          // 失败  
        }
      }) 
	},
	tomatchpage:function(e){
		wx.redirectTo({
      url: '../match/match?num=' + this.data.gamenum + '&iscreater=' + this.data.iscreater + '&gname=' + this.data.game.name +
       "&pattern=" + this.data.game.pattern + "&isovergame=0" 
    })
	}
})