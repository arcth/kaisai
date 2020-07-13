// var util = require('../../utils/util.js');
import util from  '../../utils/util.js'
const app = getApp()

Component({
    properties: {
      // 这里定义了innerText属性，属性值可以在组件使用时指定
      isShow: {
        type: Boolean,
        value: false,
      }
    },
    data: {
      // 这里是一些组件内部数据
    //   animation:'',
      viewAnimation:null,
	  closeIconBase:'',
      someData: {}
    },
    lifetimes:{
        ready:function(){
         

        }
    },
    
    methods: {
  
      
	  hideModal:function(){
		  // this.animation.opacity(0).step();
		  this.setData({isShow:false});
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
		 vm.setData({
			 isShow:false
		 })
		  util.commonAjax('/api/login', 0, data) 
		    .then(function (resolve) {
		      if (resolve.data.state === 0) {
		        // 成功  
		        app.globalData.openid = resolve.data.data.open_id
		        wx.setStorageSync('userInfo', resolve.data.data)
		        wx.setStorageSync('openid', resolve.data.data.open_id)
		        typeof cb == "function" && cb(app.globalData.userInfo)
		      } else {
		        console.log('/api/login 失败' )  
		      }
		    })
	  }
    }
})