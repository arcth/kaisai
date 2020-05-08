

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


/**  
 * request请求封装  
 * url   传递方法名  
 * types 传递方式(1,GET,2,POST)  
 * data  传递数据对象  
 */
function commonAjax(url, types, data) {

  // 获取公共配置  
  var app = getApp()

  // 公共参数（一般写接口的时候都会有些公共参数，你可以事先把这些参数都封装起来，就不用每次调用方法的时候再去写，）  
  var d = {
    token: '123456789',
  }

  // 合并对象(公共参数加传入参数合并对象) mergeObj对象在下面  
  var datas = mergeObj(d, data)

  // 这是es6的promise版本库大概在1.1.0开始支持的，大家可以去历史细节点去看一下，一些es6的机制已经可以使用了  
  var promise = new Promise(function (resolve, reject, defaults) {
    // 封装reuqest  
    wx.showLoading({
      title: '加载中...',
    })

    /*wx.showToast({
      title: '成功',
      icon: 'success',
      duration: 2000 关闭时间
    }*/
    wx.request({
      url: app.globalData.url + url,
      data: data,
      method: (types === 1) ? 'GET' : 'POST',
      header: (types === 1) ? { 'content-type': 'application/json' } : { 'content-type': 'application/x-www-form-urlencoded' },
      success: resolve,
      fail: reject,
      //complete: defaults,
      complete: () => {
        wx.hideLoading()
      } 
    })
  });
  return promise;
}

/**  
 * object 对象合并  
 * o1     对象一  
 * o2     对象二  
 */
function mergeObj(o1, o2) {
  for (var key in o2) {
    o1[key] = o2[key]
  }
  return o1;
}  
function formatTime(date) {  
  var year = date.getFullYear()  
  var month = date.getMonth() + 1  
  var day = date.getDate()  
  
  var hour = date.getHours()  
  var minute = date.getMinutes()  
  var second = date.getSeconds()  
  
  
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')  
}  

function formatTimeOnly(date) {  
  var year = date.getFullYear()  
  var month = date.getMonth() + 1  
  var day = date.getDate()  
  
  var hour = date.getHours()  
  var minute = date.getMinutes()  
  var second = date.getSeconds()  
  
  
  return [hour, minute, second].map(formatNumber).join(':')  
}  

function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate() ;
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (month > 12){
    month = "01"
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}

function isBlank(str) {
  if (Object.prototype.toString.call(str) === '[object Undefined]') {//空
    return true
  } else if (
    Object.prototype.toString.call(str) === '[object String]' ||
    Object.prototype.toString.call(str) === '[object Array]') { //字条串或数组
    return str.length == 0 ? true : false
  } else if (Object.prototype.toString.call(str) === '[object Object]') {
    return JSON.stringify(str) == '{}' ? true : false
  } else {
    return true
  }
}

function checklogin(openid){
  let param = {
    code: openid
  }
  this.commonAjax('/api/getParticipants', 0, param)
    .then(function (resolve) {
      if (resolve.data.state === 0) {
        // 成功  
        return true
      } else {
        // 失败  
      }
    })
}


module.exports = {
  formatTime: formatTime,
  commonAjax: commonAjax,
  getNowFormatDate: getNowFormatDate,
  formatTimeOnly: formatTimeOnly,
  isBlank: isBlank
  
}  