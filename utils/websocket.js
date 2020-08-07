const util = require('../utils/util.js');
const app = getApp()

// socket已经连接成功
var socketOpen = false
// socket已经调用关闭function
var socketClose = false
// socket发送的消息队列
var socketMsgQueue = []
// 判断心跳变量
var heart = ''
// 心跳失败次数
var heartBeatFailCount = 0
// 终止心跳
var heartBeatTimeOut = null;
// 终止重新连接
var connectSocketTimeOut = null;
var i=1
const url = app.globalData.websocketUrl//socket链接地址，需要在微信后台配置
//const url = 'wss://ksai.nong12.com/server'


var webSocket = {
  connectSocket: function (socketId) {
    if ( socketId == "undefined" || socketId == null || socketId == ""){
      socketId =  wx.getStorageSync('openid')
      app.globalData.socketId = socketId
    }
    // wx.showLoading({
    //   title: '',
    //   mask: true,
    // })
    socketOpen = false
    socketClose = false
    socketMsgQueue = []
    wx.connectSocket({
      url: url+'/server/'+socketId,
      // header: { 'ticket': wx.getStorageSync('token')},
      success: function (res) {
        if (res) {
          // 成功回调

          console.log('connectSocket 回调 res = ')
          console.log(res)
          //options.success && options.success(res);
        }
      },
      fail: function (res) {
        if (res) {
          // 失败回调
          // options.fail && options.fail(res);
        }
      }
    })
  },
 
  /**
   * 通过 WebSocket 连接发送数据
   * @param {options}
   *   data    String / ArrayBuffer    是    需要发送的内容
   *   success    Function    否    接口调用成功的回调函数
   *   fail    Function    否    接口调用失败的回调函数
   *   complete    Function    否    接口调用结束的回调函数（调用成功、失败都会执行）
   */
  sendSocketMessage: function (options) {
    if (socketOpen) {
      wx.sendSocketMessage({
        data: options.msg,
        success: function (res) {
          if (options) {
            options.success && options.success(res);
          }
        },
        fail: function (res) {
          if (options) {
            options.fail && options.fail(res);
          }
        }
      })
    } else {
      socketMsgQueue.push(options.msg)
    }
  },
 
  /**
   * 关闭 WebSocket 连接。
   * @param {options}
   *   code    Number    否    一个数字值表示关闭连接的状态号，表示连接被关闭的原因。如果这个参数没有被指定，默认的取值是1000 （表示正常连接关闭）
   *   reason    String    否    一个可读的字符串，表示连接被关闭的原因。这个字符串必须是不长于123字节的UTF-8 文本（不是字符）
   *   fail    Function    否    接口调用失败的回调函数
   *   complete    Function    否    接口调用结束的回调函数（调用成功、失败都会执行）
   */
  closeSocket: function (options) {
    if (connectSocketTimeOut) {
      clearTimeout(connectSocketTimeOut);
      connectSocketTimeOut = null;
    }
    socketClose = true;
    var self = this;
    self.stopHeartBeat();
    wx.closeSocket({
      success: function (res) {
        console.log('WebSocket 已关闭！');
        if (options) {
          options.success && options.success(res);
        }
      },
      fail: function (res) {
        if (options) {
          options.fail && options.fail(res);
        }
      }
    })
  },
 
  // 收到消息回调
  onSocketMessageCallback: function (msg) {
   // console.log('msg = ' + msg)
      var info = JSON.parse(msg)
      var curpage = getCurrentPages()[getCurrentPages().length - 1]
      if (info.header =='STATUS UPDATE'){
        var pagelist = getCurrentPages()
        pagelist.forEach(function (page, index) {
         if (page.route == 'pages/match/match' && page.options.num == info.content){
           page.onLoad(page.options)
         }
         if (page.route == 'pages/register/register' && page.options.num == info.content){
            page.onLoad(page.options)
         }
       })
       if(curpage.route == 'pages/register/register' && info.status == 2){
        curpage.data.round.status =  info.status
        wx.redirectTo({
          url: '../grouping/auto/auto?round=' + encodeURIComponent(JSON.stringify(curpage.data.round)) + '&iscreater=' + curpage.data.iscreater + '&pattern=' + curpage.data.pattern + '&num=' + curpage.data.num,
        })
       }
       //当参赛者停留在atuo界面  创办者完成本轮比赛记录 开始下一轮新轮次时
       if(curpage.route == 'pages/grouping/auto/auto' && info.status == 0){
        curpage.data.round.status =  info.status
        // wx.redirectTo({
        //   url: '../../match/match?isovergame=0&iscreater=' + curpage.data.iscreater + '&pattern=' + curpage.data.pattern + '&num=' + curpage.data.round.num
        // })
        wx.redirectTo({
          url: '../../matchResult/matchResult?gamenum='+ curpage.data.round.num + '&roundid=' + curpage.data.round.id 
        })
       }
      
      }
      
      if(info.header =='REGISTER'){
        var pagelist = getCurrentPages()
        pagelist.forEach(function (page, index) {
         if (page.route == 'pages/register/register' && page.options.num == info.content){
            page.onLoad(page.options)
          }
          if (page.route == 'pages/grouping/auto/auto' && page.options.round.num == info.content){
            page.onLoad(page.options)
          }
        })
      }
      if(info.header == 'JOIN'){
        if( curpage.route == 'pages/initial/initial'&& curpage.options.gameinfo.num == info.content){
          curpage.onLoad(curpage.options);
        }
      }
    
  },
 
  // 开始心跳
  startHeartBeat: function () {
   // console.log('socket开始心跳')
    var self = this;
    heart = 'heart';
    self.heartBeat();
  },
 
  // 结束心跳
  stopHeartBeat: function () {
   // console.log('socket结束心跳')
    var self = this;
    heart = '';
    if (heartBeatTimeOut) {
      clearTimeout(heartBeatTimeOut);
      heartBeatTimeOut = null;
    }
    if (connectSocketTimeOut) {
      clearTimeout(connectSocketTimeOut);
      connectSocketTimeOut = null;
    }
  },
 
  // 心跳
  heartBeat: function () {
    var self = this;
    if (!heart) {
      return;
    }
    self.sendSocketMessage({
      msg: JSON.stringify({
        'toUserId':app.globalData.socketId//心跳
      }),
      success: function (res) {
      //  console.log('socket心跳成功');
        if (heart) {
          heartBeatTimeOut = setTimeout(() => {
            self.heartBeat();
          }, 60000);
        }
      },
      fail: function (res) {
        console.log('socket心跳失败');
        if (heartBeatFailCount > 2) {
          // 重连
          self.connectSocket();
        }
        if (heart) {
          heartBeatTimeOut = setTimeout(() => {
            self.heartBeat();
          }, 60000);
        }
        heartBeatFailCount++;
      },
    });
  }
}
 
// 监听WebSocket连接打开事件。callback 回调函数
wx.onSocketOpen(function (res) {
//  console.log('WebSocket连接已打开！')
  wx.hideLoading();
  // 如果已经调用过关闭function
  if (socketClose) {
    webSocket.closeSocket();
  } else {
    socketOpen = true
    for (var i = 0; i < socketMsgQueue.length; i++) {
      webSocket.sendSocketMessage(socketMsgQueue[i])
    }
    socketMsgQueue = []
    webSocket.startHeartBeat();
  }
})
 
// 监听WebSocket错误。
wx.onSocketError(function (res) {
  console.log('WebSocket连接打开失败，请检查！', res)
})
 
// 监听WebSocket接受到服务器的消息事件。
wx.onSocketMessage(function (res) {
//  console.log('收到服务器内容：' + res.data)
  if (res.data =='SUCCESS'){
     return;
  }
  webSocket.onSocketMessageCallback(res.data)
})
 
// 监听WebSocket关闭。
wx.onSocketClose(function (res) {
  console.log('WebSocket 已关闭!')
  //if (!socketClose) {
  let time = Math.pow(2, i)
  i++
  if (time==8){
    i=1
  }
    clearTimeout(connectSocketTimeOut)
    connectSocketTimeOut = setTimeout(() => {
      webSocket.connectSocket();
    }, time*1000);
  //}
})
 
module.exports = webSocket;