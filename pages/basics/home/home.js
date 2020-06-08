Component({
  properties: {
    background: String,
  },
  options: {
    addGlobalClass: true,
  },
  data: {
    TabCur: 0,
    scrollLeft: 0,
    tabNav: ['定制比赛', '我的比赛'],
    createBackground: "/images/createFive.png",
  },
  onLoad:function(){
    let base64 = wx.getFileSystemManager().readFileSync(this.data.createBackground, 'base64');
    this.setData({
      createBackground:'data:image/png;base64,' + base64,
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
    create: function (e) {
      wx.navigateTo({
        url: '../create/create?type=' + e.currentTarget.dataset.type,
      })
    }

  }
})
