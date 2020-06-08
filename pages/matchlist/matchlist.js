// pages/matchlist/matchlist.js
const app = getApp()
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    gamelist: {},
    collageTeamlist : {},
    endTime: '2020-06-05 22:40:30', //2018/11/22 10:40:30这种格式也行
    background: "/images/wzry1.jpg"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    let base64 = wx.getFileSystemManager().readFileSync(this.data.background, 'base64');
    this.setData({
      background: 'data:image/png;base64,' + base64
    })
    var param = {
      openid: app.globalData.openid,
      status: options.status
    }
    var that = this
    util.commonAjax('/api/selectGameinfoByOpenid', 0, param)
      .then(function (resolve) { 
        if (resolve.data.state === 0) {
          // 成功  
          that.setData({
            openid: app.globalData.openid,
            gamelist: resolve.data.data.gamelist
          })
          var gamelist = that.data.gamelist
          for (var i = 0; i < gamelist.length; i++) {
            var lack_num = gamelist[i].create_num - gamelist[i].current_num
            gamelist[i].lack_num = lack_num
          }
          that.setData({
            groupon: gamelist
          })
          var data = that.data.groupon
          //列表获取到数据进行遍历
           for (var i = 0; i < data.length; i++) {
            var end_time = data[i].etime.replace(/-/g, '/')
           that.grouponcountdown(that,end_time, i)
           }
          /**that.data.gamelist.forEach(function (item, index) {
            that.setData({
               ['gamelist['+(index)+'].text'] : that.countDown('2020-06-05 10:40:30')
            })
          })**/
        } else {
          // 失败  
        }
      })

  },


  //封装的倒计时方法
  //批量倒计时
  grouponcountdown: function (that, end_time, param) {
    var EndTime = new Date(end_time).getTime()
     //console.log(EndTime);
    var NowTime = new Date().getTime();
    var total_micro_second = EndTime - NowTime;
    var groupons = that.data.groupon;
    // console.log(groupons);
    groupons[param].endtime = that.dateformats(total_micro_second);
    if (total_micro_second <= 0) {
      groupons[param].endtime = "已结束"
    }
    that.setData({
      groupon: groupons
    })
    setTimeout(function () {
      that.grouponcountdown(that, end_time, param);
    }, 1000)
  },

  // 时间格式化输出，每1s都会调用一次
  dateformats: function (micro_second) {
    // 总秒数
    var second = Math.floor(micro_second / 1000);
    // 天数
    var day = Math.floor(second / 3600 / 24);
    // 小时
    var hr = Math.floor(second / 3600 % 24);
    var hrStr = hr.toString();
    if (hrStr.length == 1) hrStr = '0' + hrStr;

    // 分钟
    var min = Math.floor(second / 60 % 60);
    var minStr = min.toString();
    if (minStr.length == 1) minStr = '0' + minStr;

    // 秒
    var sec = Math.floor(second % 60);
    var secStr = sec.toString();
    if (secStr.length == 1) secStr = '0' + secStr;

    if (day <= 1) {
      return "剩 " + hrStr + " 小时 " + ":" + minStr + ":" + secStr;
    } else {
      return "剩 " + day + " 天 " + hrStr + " 小时 "+ ":" + minStr + ":" + secStr;
    }
  },
  //end

  openCurrentGame: function (event) {
    let num = event.currentTarget.dataset.gid
    let iscreater = event.currentTarget.dataset.iscreater
    let gname = event.currentTarget.dataset.gname
    let pattern = event.currentTarget.dataset.pattern
    wx.redirectTo({
      url: '../match/match?num=' + num + '&iscreater=' + iscreater + '&gname=' + gname + "&pattern=" + pattern
    })
  },


})