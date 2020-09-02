// pages/grouping/auto/auto.js
const util = require('../../../utils/util.js');
const app = getApp()
const api = app.globalData.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    index: 0,
    imgList: [],
    pattern: '',
    round:null,
    redteam: null,
    blueteam: null,
    uncheckteam: null,
    notlotinteam: null,//未参与
    confirm: false,
    iscreater: false,
    iscomplete: false, //对决队伍完整，经过编辑队列  还未重新抽签 则为 false
    isshorthanded: false, //缺人
    game:null,
    removeUserId:'',
    removeReason:{},
    removeReasonId:null,
    interval: "",      //定时器
    onlytoHome:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
    let roundinfo = JSON.parse(decodeURIComponent(options.round))
    this.startpollingUser(roundinfo)
    this.websocketCheck()
    let pattern = options.pattern
    // console.log("111111111111 options.source" + options.source)
    // console.log(options.source== 'subscribe')
    // console.log(options.source== 'shara')
    if(options.source == 'shara' || options.source == 'subscribe'){
      this.setData({
        onlytoHome : true
      })
    }
    this.setData({
      pattern: pattern,
    })
    this.initdata(roundinfo)
  },
  async initdata(roundinfo){
    await api.showLoading() // 显示loading
    await this.getEliminateDic()
    await this.getGameInfo(roundinfo.num)
    await this.getRound(roundinfo)  
    await api.hideLoading() // 等待请求数据成功后，隐藏loading
  },
  websocketCheck(){
    var fields = {
      socketid:app.globalData.openid
    }
    api.commonAjax('/api/onlinejudge', 0, fields)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          console.log('auto.page onlinejudge : ' + app.globalData.openid + '  '+ resolve.data.data.isconnect )
          if(!resolve.data.data.isconnect){
            socket.connectSocket();
            app.globalData.isConnect = true
          }
        } else {
          // 失败  
        }
      })
  },
  getGameInfo(num){
    return new Promise((resolve, reject) => {
      var parameter = {
        num: num,
        isovergame : 0
      }
      let that = this
       api.commonAjax('/api/getGameInfo', 0, parameter)
        .then(function (resolve) {
          // 这里自然不用解释了，这是接口返回的参数  
          if (resolve.data.state === 0) {
            // console.log(" match = " + resolve.data.data.statusdes)
            // 成功  
            that.setData({
              game: resolve.data.data.game
            })
            if(app.globalData.openid == that.data.game.creater ){
              that.setData({
                iscreater : true
              })
            }
          } else {
            // 失败  
          }
        }).then((res) => {
          resolve()
        }).catch((err) => {
          console.error(err)
          reject(err)
        })
      })
  },

  getRound(roundinfo){
    return new Promise((resolve, reject) => {
    let parameter = {
      num: roundinfo.num,
      isovergame : 0
    }
    let that = this      
      api.commonAjax('/api/getRound', 0, parameter)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          var round = resolve.data.data.curRound
          //判断 如果是分享页进入 当前轮次已经不是分享页带入的轮次
          if(roundinfo.rounds != round.rounds){
              wx.redirectTo({
                url: '../../matchResult/matchResult?gamenum='+ roundinfo.num + '&roundid='+ roundinfo.id
              })
              return
          }

          //status =2 已分组 status =3 重新分组
          if(round.status == 2 || round.status == 3){
            //取分组结果
            that.getCurRoundREC(round)
          }
          //status =0 创建 status =1 开启签到
          if(round.status == 0 || round.status == 1 ){
            //进行分组
            that.getGroupingResult(round,'')
          }
          that.getUserWhodidnotSignin(round)
        }else {
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
  /**
   * 获取字典 -- 删除理由
   */
  getEliminateDic(){
    return new Promise((resolve, reject) => {
      let that = this
      api.commonAjax('/api/getEliminateDic', 0, "")
      .then(function(resolve) {
        if (resolve.data.state === 0) {
          let reason = resolve.data.data.cache        
          that.setData({
            removeReason : reason
          })
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
  
  getGroupingResult(roundinfo,mode){
    return new Promise((resolve, reject) => {
      let that = this
      let param = {
        id: roundinfo.id,
        teammode:roundinfo.teammode,
        pattern: this.data.pattern,
        mode:mode
      }

      util.commonAjax('/api/getGroupingResult', 0, param)
      .then(function(resolve) {
        if (resolve.data.state === 0) {
          that.setData({
            redteam: resolve.data.data.RED,
            blueteam: resolve.data.data.BLUE,
            uncheckteam: resolve.data.data.UNCHECK,
            round: roundinfo,
            iscomplete : true,
            confirm:false
          })
        } else {
          // 失败  
        }
      }).then((res) => {
        resolve()
      }) .catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  },
  getUserWhodidnotSignin(roundinfo){
    let that = this
    let param = {
      id: roundinfo.id,
      num:roundinfo.num,
    }
    util.commonAjax('/api/getUserWhodidnotSignin', 0, param)
      .then(function(resolve) {
        if (resolve.data.state === 0) {
          that.setData({
            notlotinteam: resolve.data.data.players
          })
        } else {
          // 失败  
        }
      })
  },
  getCurRoundREC(roundinfo){
    let that = this
    var parameter= {
      id: roundinfo.id
    }
    util.commonAjax('/api/getCurRoundREC', 0, parameter)
      .then(function(resolve) {
        if (resolve.data.state === 0) {
          let redteam = resolve.data.data.RED
          let blueteam = resolve.data.data.BLUE
          let uncheck = resolve.data.data.UNCHECK 
          if(redteam.length == that.data.pattern && blueteam.length ==  that.data.pattern){
              that.setData({
                iscomplete : true
              })
           }else if((redteam.length + blueteam.length + uncheck.length) < that.data.pattern * 2){
                 //剔除 人员后 可能存在 签到人数不足 无法分配
                that.setData({
                  isshorthanded: true,
                  iscomplete : false
                })
           }

          that.setData({
            redteam: resolve.data.data.RED,
            blueteam: resolve.data.data.BLUE,
            uncheckteam: resolve.data.data.UNCHECK,
            confirm : true,
            round: roundinfo
          })
          
        } else {
          // 失败  
        }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    if(e.from == "button"){
      var source = e.target.dataset.source
      if(source == "understaffedDialog"){
        return {
          title: '就差你了',
          desc: '分享页面的内容',
          // path: '/pages/register/register?round=' +this.data.round +'&num=' + this.data.round.num 
          // + '&pattern=' + this.data.pattern + '&iscreater=false'   // 路径，传递参数到指定页面。
          path: '/pages/initial/initial?gameinfo=' + encodeURIComponent(JSON.stringify(this.data.game))  + '&source=auto' +
          '&introducer=' + app.globalData.openid
        }
      }
      if(this.data.confirm && source == "buttonshare"){
        return {
          title: '生而无畏，战至终章',
          desc: '分享页面的内容',
          path: '/pages/grouping/auto/auto?round=' + encodeURIComponent(JSON.stringify(this.data.round))
           + '&iscreater=' + this.data.iscreater + '&pattern=' + this.data.pattern + '&source=shara'
        }
    }
    }else if(e.from == "menu"){

    }
    
  },
  record: function() {
   
    let round =JSON.stringify( this.data.round)
    let redteam = JSON.stringify(this.data.redteam)
    let blueteam = JSON.stringify(this.data.blueteam)
    let uncheckteam = JSON.stringify(this.data.uncheckteam)
    let param = {
      round:round,
      redteam: redteam,
      blueteam: blueteam,
      uncheckteam: uncheckteam,
    }
    var that = this
    util.commonAjax('/api/groupingConfirm', 0, param)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          that.setData({
            confirm : true
          })
          console.log("round.id =" + that.data.round.id)
          console.log("round.num =" + that.data.round.num)
          that.pollingUser(that.data.round)
        } else {
          // 失败  
        }
      })

      //进行分享 通知
  },
  torecord: function() {
    wx.redirectTo({
      url: '../../record/record?num=' + this.data.round.num + "&pattern=" + this.data.pattern +
      '&round=' + JSON.stringify(this.data.round) 
    })
  },
  handleLongPress:function(e){ //长按显示底部弹窗，同时缓存长按的当前用户数据
    //e.currentTarget.dataset.user 
  
    if(this.data.confirm && this.data.iscreater && this.data.iscomplete){
      this.setData({
        modalName: e.currentTarget.dataset.target,
        removeUserId:e.currentTarget.dataset.user
  })
    }

  },
  hideModal:function(e) {
      this.setData({
        modalName: null
      })
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  showModalByModalName(modalName) {
    this.setData({
      modalName: modalName
    })
  },
  reasonRadioChange(e){ //点击单选框
	  console.log(e.detail.value);
	  this.setData({
		  removeReasonId:e.detail.value
	  })
  },
  reomveUser(){
	 //获取Id
   let _id = this.data.removeReasonId;
  //获取缓存的当前用户信息，
   let removeUserId = this.data.removeUserId
  //ajax删除抽取等操作
   

   let that = this
    var parameter= {
      id: this.data.round.id,
      reasonid: this.data.removeReasonId,
      player:removeUserId
    }
    util.commonAjax('/api/removePlayer', 0, parameter)
      .then(function(resolve) {
        if (resolve.data.state === 0) {
          that.setData({
            modalName: null,
            iscomplete:false
          })
          var curpage = getCurrentPages()[getCurrentPages().length - 1]
          curpage.options.round = encodeURIComponent(JSON.stringify(resolve.data.data.round)) 
          curpage.onLoad(curpage.options)
        } else {
          // 失败  
        }
    })
   
	//
  },

  drawAgain(){
    if(this.data.isshorthanded){
      //缺人 邀请签到
      this.showModalByModalName('understaffedDialog')
      return;
    }
    var curpage = getCurrentPages()[getCurrentPages().length - 1]
    let roundinfo = JSON.parse(decodeURIComponent(curpage.options.round))
    // if(roundinfo.status == 3){
    //   curpage.getGroupingResult(roundinfo)
    // }else{
    //   roundinfo.status = 3
    //   //curpage.data.confirm = false
    //   curpage.options.round =  encodeURIComponent(JSON.stringify(roundinfo))
    //   curpage.onLoad(curpage.options)
    // }
    curpage.getGroupingResult(roundinfo,'afresh')
   
  },
  showdiscardDialog(){
    this.showModalByModalName('discardDialog')
  },
  discard(){
    var data= {
      id: this.data.round.id,
      num: this.data.round.num
    }
    let that = this
    util.commonAjax('/api/discard', 0, data)
      .then(function(resolve) {
        if (resolve.data.state === 0) {
          wx.redirectTo({
            url: '/pages/match/match?num=' + that.data.round.num + '&iscreater=' + that.data.iscreater + '&gname=' + that.data.game.name +
             "&pattern=" + that.data.pattern + "&isovergame=0" 
          })
        } else {
          // 失败  
        }
    })
  },
     /**
     * 轮询计划
    */
   startpollingUser:function (round) {
    var that = this;
    that.init(that);          //这步很重要，没有这步，重复点击会出现多个定时器
    var interval = setInterval(function () {
          that.pollingUser(round);
    },1000)
    that.setData({
       interval:interval
    })
 },
  pollingUser:function (round){
    let that = this
    var parameter= {
      id: round.id
    }
    api.commonAjax('/api/getCurRoundREC', 0, parameter)
      .then(function(resolve) {
        if (resolve.data.state === 0) {
          let redteam = resolve.data.data.RED
          let blueteam = resolve.data.data.BLUE
          let uncheck = resolve.data.data.UNCHECK 
          that.setData({
            uncheckteam:uncheck
          })
          if((redteam.length + blueteam.length + uncheck.length) >=  that.data.pattern * 2){
            that.setData({
              isshorthanded:false
            })
          }
        } else {
          // 失败  
        }
    })
    let param = {
      id: round.id,
      num:round.num,
    }
    api.commonAjax('/api/getUserWhodidnotSignin', 0, param)
      .then(function(resolve) {
        if (resolve.data.state === 0) {
          that.setData({
            notlotinteam: resolve.data.data.players
          })
        } else {
          // 失败  
        }
      })
  },
  /**
     * 初始化数据
    */
   init: function (that) {
    var time = 60;
    var interval = ""
    that.clearTimeInterval(that)
    that.setData({
      interval: interval,
      })
   },
  /**
   * 清除interval
   * @param that
  */
  clearTimeInterval: function (that) {
    var interval = that.data.interval;
    clearInterval(interval)
  },
  /**
   * 生命周期函数--监听页面卸载
    * 退出本页面时停止计时器
   */
   onUnload:function () {
    var that = this;
    that.clearTimeInterval(that)
  },

    /**
     * 生命周期函数--监听页面隐藏
     * 在后台运行时停止计时器
    */
    onHide:function () {
        var that = this;
       // that.clearTimeInterval(that)
       // console.log("clearTimeInterval = onHide" )
    }



})