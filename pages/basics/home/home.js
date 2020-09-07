Component({
  properties: {
    background: String,
	  ongoing:Number, //进行中的比赛数量
    finished:Number, //完结的比赛数量
    imageBaseUrl:String
  },
  options: {
    addGlobalClass: true,
  },
  data: {
    TabCur: 0,
    scrollLeft: 0,
    tabNav: ['定制比赛', '我的比赛'],
    startBg:'/images/match_start_bg.png',
    finishBg:'/images/match_finished_bg.png',
    tipsDialogvisible:false,
    oneButton: [{text: '确定'}],
  },
  onLoad:function(options){
    let app = getApp();
    
    let startBgBase64 = wx.getFileSystemManager().readFileSync(this.data.startBg, 'base64');
    let finishBgBase64 = wx.getFileSystemManager().readFileSync(this.data.finishBg, 'base64');

    this.setData({
      startBg: 'data:image/png;base64,' + createBase64,
      finishBg: 'data:image/png;base64,' + finishBgBase64,
    })
  },
  methods: {
    //tab event事件捕获
    tabSelect(e) {
      //console.log(this.data.background);
      this.setData({
        TabCur: e.currentTarget.dataset.id,
        scrollLeft: (e.currentTarget.dataset.id - 1) * 60
      })
    },
	tapDialogButton(e) {
	        this.setData({
	            tipsDialogvisible: false,
	            
	        })
	},
	showTips:function(e){
		this.setData({
		    tipsDialogvisible: true
		})
	},
    create: function (e) {
      wx.navigateTo({
        url: '../create/create?type=' + e.currentTarget.dataset.type,
      })
    }

  }
})
