// api/ajax.js.js
const regeneratorRuntime = require('../lib/regenerator-runtime/runtime.js')
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
  // 这是es6的promise版本库大概在1.1.0开始支持的，大家可以去历史细节点去看一下，一些es6的机制已经可以使用了  
  var promise = new Promise(function (resolve, reject, defaults) {
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
    })
  });
  return promise;
}
  
// loading加载提示
const showLoading = () => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '加载中...',
      mask: true,
      success (res) {
        //console.log('显示loading')
        resolve(res)
      },
      fail (err) {
        reject(err)
      }
    })
  })
}

// 关闭loading
const hideLoading = () => {
  return new Promise((resolve) => {
    wx.hideLoading()
    //console.log('隐藏loading')
    resolve()
  })
}


module.exports = {
  commonAjax: commonAjax,
  showLoading:showLoading,
  hideLoading:hideLoading
}  