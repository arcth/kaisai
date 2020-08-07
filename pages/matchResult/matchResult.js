// pages/match/match.js
const app = getApp()
const util = require('../../utils/util.js')
const api = app.globalData.api

Page({
	data:{
		isVictory:null,
		CustomBar: app.globalData.CustomBar,
		imageBaseUrl:'',
		winner:null,
		loser:null,
		winnerMvp:null,
		loserMvp:null,
		gamenum:'',
		game:'',
		iscreater:false,
		background:'',
		wolmarker:'',
		woltittle:'',
		wolteam:''
	},
	onLoad:function(options){

	
		this.getGameInfo(options.gamenum)
	//	this.getRoundRECInfo(options.roundid)
		this.init(options.roundid)

		this.setData({
			imageBaseUrl:app.globalData.imageUrl,
			gamenum:options.gamenum,
			roundid:options.roundid,
		})
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
  async init(roundid){
    await api.showLoading() // 显示loading
    await this.getRoundRECInfo(roundid)  
    await api.hideLoading() // 等待请求数据成功后，隐藏loading
  },
	getRoundRECInfo(roundid){
		return new Promise((resolve, reject) => {
    let parameter = {
			roundid:roundid
		}
		let that = this
		api.commonAjax('/api/getRoundResultByroundid', 0, parameter)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
					var losers = resolve.data.data.lose
          that.setData({
						winner: resolve.data.data.win,
						winnerMvp : resolve.data.data.winnerMvp,
						loser:losers,
						loserMvp:resolve.data.data.loserMvp,
						rounds:resolve.data.data.rounds,
					})
					
					losers.forEach(function (item, index) {
            if (item.openid == app.globalData.openid){
             that.setData({
							isVictory:false,
							background:that.data.imageBaseUrl + '/group1/M00/56/09/wKhmBV8mY0KAApLZAAPXOgGkTuU336.png',
							wolmarker:'../../images/fail.png',
							woltittle:'败方:',
							wolteam:losers
						 })
            }
					})
					if(that.data.isVictory == null){
						that.setData({
							isVictory:true,
							background:that.data.imageBaseUrl + '/group1/M00/4C/35/wKhmBV8T0omAO3DLAAPm-UdZRZ0194.png',
							wolmarker:'../../images/vb.png',
							woltittle:'胜方:',
							wolteam:that.data.winner
						 })
					}
        } else {
          // 失败  
        }
      }).then((res) => {
        resolve()
      })
        .catch((err) => {
          console.error(err)
          reject(err)
				})
			}) 
	},
	tomatchpage:function(e){
		wx.redirectTo({
      url: '../match/match?num=' + this.data.gamenum + '&iscreater=' + this.data.iscreater + '&gname=' + this.data.game.name +
       "&pattern=" + this.data.game.pattern + "&isovergame=0" 
    })
	}
})