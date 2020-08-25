const util = require('../../utils/util.js');
const app = getApp()
const api = app.globalData.api
Page({
	data:{
		CustomBar: app.globalData.CustomBar,
		isLogin:null,
		needLoginShow:false,
        userInfo:{},
        redteam:[],
        blueteam:[],
        reduser: null,
        blueuser: null
	},
	onLoad:function(options){
        let redteam  = JSON.parse(decodeURIComponent(options.redteam))
        let blueteam = JSON.parse(decodeURIComponent(options.blueteam))
        this.setData({
            redteam : redteam,
            blueteam : blueteam
        })
		
    },
    mvpSubmit(e){
       const eventChannel = this.getOpenerEventChannel()
       eventChannel.emit('mvpSubmit', {data:{reduser:this.data.reduser, blueuser:this.data.blueuser}});
       wx.navigateBack({
        delta: 1
       })
    },
    redmvpradiochange: function (e) {
        for (var value of this.data.redteam) {
            if (value.player === e.detail.value) {
             this.setData({ reduser: value.user });
             break;
            }
        }
      },
    bluemvpradiochange: function (e) {
        for (var value of this.data.blueteam) {
            if (value.player === e.detail.value) {
                this.setData({ blueuser: value.user });
             break;
            }
        }
        
    }
    
})