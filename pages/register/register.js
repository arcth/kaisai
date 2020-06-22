// pages/register/register.js
const util = require('../../utils/util.js');
const app = getApp()
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
    picker: ['随机匹配', 'ELO匹配', '手动抽签'],
    teammode : '0',
    options :'',
    round : '',
    num: ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    if (util.isBlank(options.round)) {
      return
    }
    this.setData({
      round: JSON.parse(decodeURIComponent(options.round))
    })
    let roundinfo = JSON.parse(decodeURIComponent(options.round))
    if (options.iscreater === 'true') {
      this.setData({
        iscreater: true
      })
    } else if (options.iscreater === 'false') {
      this.setData({
        iscreater: false
      })
    }
    let pattern = options.pattern
    let disable = true
    let num = roundinfo.num
    let curTime = util.formatTime(new Date())
    //如果启用签到时间限制
    if (roundinfo.istimecontrol == 1 ){
      if (curTime > roundinfo.opentime && curTime < roundinfo.closetime){
        disable = false
      }
    } else if (roundinfo.status == 1){
      disable = false
    }
    
    this.setData({
      disable: disable,
      pattern: pattern,
      options: options,
      num : num
    })

    let param = {
      id: roundinfo.id
    }
    let that = this
    util.commonAjax('/api/getPlayers', 0, param)
      .then(function (resolve) {
        if (resolve.data.state === 0) {
          // 成功  
          that.setData({
            players: resolve.data.data.players
          })
          var minparticipants = parseInt(pattern)*2;//最小参赛队员数
          if (that.data.players.length >= minparticipants && that.data.iscreater){
            that.setData({
              isDrawlots : true
            })
          }
          
        } else {
          // 失败  
        }
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