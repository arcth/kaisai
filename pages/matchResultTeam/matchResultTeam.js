const util = require('../../utils/util.js');
const app = getApp()
const api = app.globalData.api
Page({
	data:{
		CustomBar: app.globalData.CustomBar,
		isLogin:null,
		needLoginShow:false,
        userInfo:{},
        redTeam:[
            {value: '1', name: '老大',avatar:'/images/login-logo.png',checked:'true'},
            {value: '2', name: '老二',avatar:'/images/login-logo.png'},
            {value: '2', name: '老老三',avatar:'/images/login-logo.png'}
        ]
	},
	onLoad:function(options){
		
    },
    RedradioChange(e){
        let val = e.detail.val;
        let items = this.data.redTeam;
        for(let item of items){
            items.checked = item.value === val;
        }
        this.setData(items);
    }
	
})