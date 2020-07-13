// pages/register/register.js
const util = require('../../utils/util.js');
const socket = require('../../utils/websocket.js');

const app = getApp()
const api = app.globalData.api
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: util.getNowFormatDate(),
    iscreater : false,
    isDrawlots: false,
    pattern : '0',
    players : [],
    btime: util.formatTimeOnly(new Date()),
    etime: util.formatTimeOnly(new Date()),
    disable : true,
    index: '0',
    picker: ['随机匹配'],
    teammode : '0',
    options :'',
    round : '',
    tipsDialogvisible: false,
    oneButton: [{text: '确定'}],
    dialogmsg:'',
    num: ''

  },
  onUnload: function (options) {
    //socket.closeSocket();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  // socket.closeSocket();
  // socket.connectSocket();
   
    if (util.isBlank(options.round)) {
      return
    }
    this.setData({
      num:options.num,
      pattern:options.pattern,
      options: options
    })
    if (options.iscreater === 'true') {
      this.setData({
        iscreater: true
      })
    } else if (options.iscreater === 'false') {
      this.setData({
        iscreater: false
      })
    }
    this.init()
        
  },
  async init () {
    await api.showLoading() // 显示loading
    await this.getRound()  
    await this.getPlayers()
    await api.hideLoading() // 等待请求数据成功后，隐藏loading
  },

  getRound(){
    return new Promise((resolve, reject) => {
    let parameter = {
      num: this.data.num,
      isovergame : 0
    }
    let that = this      
      api.commonAjax('/api/getRound', 0, parameter)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          var round = resolve.data.data.curRound
          var disable = true
          var curTime = util.formatTime(new Date())
          //如果启用签到时间限制
          if (round.istimecontrol == 1 ){
            if (curTime > round.opentime && curTime < round.closetime){
              disable = false
            }
          } else if (round.status == 1){
            disable = false
          }
          that.setData({
            round:round,
            disable:disable,
            num : round.num
          })
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
  getPlayers(){
    return new Promise((resolve, reject) => {
    let param = {
      id: this.data.round.id
    }
    var that = this
        api.commonAjax('/api/getPlayers', 0, param)
          .then(function (resolve) {
            if (resolve.data.state === 0) {
              // 成功  
              that.setData({
                players: resolve.data.data.players
              })
              var minparticipants = parseInt(that.data.pattern)*2;//最小参赛队员数
              if (that.data.players.length >= minparticipants && that.data.iscreater){
                that.setData({
                  isDrawlots : true
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

  onPullDownRefresh : function(){
    wx.stopPullDownRefresh({
      complete: (res) => {
        let param = {
          num: this.data.num,
          isovergame : 0
        }
        let that = this
        util.commonAjax('/api/getRound', 0, param)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          var round = resolve.data.data.curRound
          that.data.options.round = encodeURIComponent(JSON.stringify(round))
          getCurrentPages()[getCurrentPages().length - 1].onLoad(that.data.options)
        }else {
          // 失败  
        }
      })
      },
    })
  },
  
  DateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },

  TimeChangeB(e) {
    this.setData({
      btime: e.detail.value
    })
  },
  TimeChangeE(e) {
    this.setData({
      etime: e.detail.value
    })
  },
  PickerChange(e) {
    this.setData({
      index: e.detail.value
    })
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
    let round = this.data.round
    let iscreater = this.data.iscreater
    let pattern = this.data.pattern
    /*wx.redirectTo({
      url: '../register/register?round=' + encodeURIComponent(JSON.stringify(round)) + '&iscreater=' + iscreater + '&pattern=' + pattern
    })*/
    //刷新当前页面的数据
    this.options.round = encodeURIComponent(JSON.stringify(round)) 
    this.options.pattern = pattern
    this.options.iscreater = iscreater
    this.options.num = this.data.num
    getCurrentPages()[getCurrentPages().length - 1].onLoad(this.options)
  },
  
  formSubmit(e){ 
    let param = {
      id: this.data.round.id,
      num: this.data.round.num,
      rounds: this.data.round.rounds,
      date: e.detail.value.date,
      btime: e.detail.value.btime,
      etime: e.detail.value.etime,
      describe: e.detail.value.describe,
      teammode: e.detail.value.teammode,
      istimecontrol: e.detail.value.istimecontrol
    }
    let that = this
    util.commonAjax('/api/setupRound', 0, param)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          //设置保存成功
          that.options.round = encodeURIComponent(JSON.stringify(resolve.data.data.curRound))
          that.options.pattern = that.data.pattern
          that.options.iscreater = that.data.iscreater
          that.options.num = that.data.num
          that.setData({
            round: resolve.data.data.curRound
          })
          //刷新当前页面的数据
          
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2]
          pages[pages.length - 1].onLoad(that.options)
          if(prevPage.route == "pages/match/match"){
            prevPage.setData({ 
              round:that.data.round
            })
          }
          
        }else if(resolve.data.state === 2){
          // 检查失败
          var errmsg =   resolve.data.data.errmsg
          that.setData({
            tipsDialogvisible: true,
            dialogmsg : errmsg
          })
        } else {
          // 失败  
        }
      })

  },

  drawlots(e){
    let round = this.data.round
    let iscreater = this.data.iscreater
    let teammode = this.data.teammode
    let pattern = this.data.pattern
    let modeurl =''
    
    switch(teammode){
      case '0':
        modeurl = 'auto/auto'
      break;
      case '1':
        modeurl = 'auto/auto'
      break;
      case '2':
        modeurl = 'auto/auto'
      break;

    }
    wx.redirectTo({
      url: '../grouping/' + modeurl + '?round=' + encodeURIComponent(JSON.stringify(round)) + '&iscreater=' + iscreater + '&pattern=' + pattern
    })
  },

  register(e){
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
    
    var param = {
      player : app.globalData.openid, 
      round : JSON.stringify(this.data.round)
    }
    
    let that = this
    util.commonAjax('/api/register', 0, param)
      .then(function (resolve) {
        
        if (resolve.data.state === 0) {
        } else {
          // 失败  
        }
      })
  }
})