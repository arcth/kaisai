// pages/matchlist/matchlist.js
const app = getApp()
const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
	  isLogin:false,
    openid: '',
    gamelist: {},
    collageTeamlist : {},
    endTime: '2020-06-05 22:40:30', //2018/11/22 10:40:30这种格式也行
    imageBaseUrl:'',
    background: "/images/match_list_bg.png",
    isovergame: 0, //0 进行中的比赛 1已经完结的比赛
    groupon:[],
    pageNum: 1,
    totalPages:0, //后台调用存在异常 无法得到总数 comunity无异常 能够得到总数 应该是由于ID引起
    gamestatus: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
	if(app.globalData.userInfo && app.globalData.openid){
		this.setData({
			isLogin:true
		})
	}
    this.setData({
      imageBaseUrl:app.globalData.imageUrl,
      isovergame : options.status,
    })
    this.getGamePage(1,4)
  },
  getGamePage(pageNum,pageSize){
    var param = {
      openid: app.globalData.openid,
      status:this.data.isovergame,
      pageNum: 1, 
      pageSize: pageNum * pageSize
    }
    var that = this
    util.commonAjax('/api/selectGameinfoByOpenid', 0, param)
      .then(function (resolve) { 
        if (resolve.data.state === 0) {
          // 成功  
          that.setData({
            openid: app.globalData.openid,
            gamelist: resolve.data.data.pageResult.content,
            totalPages:resolve.data.data.pageResult.totalPages,
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
    if(that.data.isovergame == 0){ //提升比赛列表页性能 数据量过大会导致页面响应问题
       setTimeout(function () {
        that.grouponcountdown(that, end_time, param);
      }, 1000)
    }
    
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
      // return   hrStr + " 小时 " + minStr + "分" +  secStr + "秒";
      return   `${hrStr}小时${minStr}分${secStr}秒`;
    } else {
      // return   day + " 天 " + hrStr + " 小时 "+  minStr + "" + secStr;
	  return `${day}天${hrStr}小时${minStr}分${secStr}秒`;
    }
  },
  //end

  openCurrentGame: function (event) {
    let num = event.currentTarget.dataset.gid
    let iscreater = event.currentTarget.dataset.iscreater
    let gname = event.currentTarget.dataset.gname
    let pattern = event.currentTarget.dataset.pattern
    let gamestatus = event.currentTarget.dataset.gamestatus
    wx.redirectTo({
      url: '../match/match?num=' + num + '&iscreater=' + iscreater + '&gname=' + gname +
       "&pattern=" + pattern + "&isovergame=" + gamestatus
    })
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
  		  util.commonAjax('/api/login', 0, data) 
  		    .then(function (resolve) {
  		      if (resolve.data.state === 0) {
  		        // 成功  
  		        app.globalData.openid = resolve.data.data.open_id
  		        wx.setStorageSync('userInfo', resolve.data.data)
  		        wx.setStorageSync('openid', resolve.data.data.open_id)
  				wx.redirectTo({
  				  url: '../index/index'
  				})
  		      } else {
  		        console.log('/api/login 失败' )  
  		      }
  		    })
  },
    /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh({
      complete: (res) => {
        this.getGamePage(this.data.pageNum,4)
      },
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var curreachPage =   this.data.pageNum 
    if(curreachPage <= this.data.totalPages){
     this.setData({
       pageNum: this.data.pageNum + 1
      })
      this.getGamePage(this.data.pageNum,4)
    }
 },

})