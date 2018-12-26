// pages/mine/mine.js
const app = getApp();


var interval = null //倒计时函数
Page({
  data: {
    date: '请选择日期',
    fun_id: 2,
    time: '获取验证码', //倒计时 
    currentTime: 60,
    previousCode: '' //验证code
  },


  onLoad: function (options) {
    this.getPhoneNum();
  },

  // 获取验证码倒计时
  getCode: function (options) {
    var that = this;
    var currentTime = that.data.currentTime
    interval = setInterval(function () {
      currentTime--;
      that.setData({
        time: currentTime + '秒'
      })
      if (currentTime <= 0) {
        clearInterval(interval)
        that.setData({
          time: '重新发送',
          currentTime: 61,
          disabled: false
        })
      }
    }, 1000)
  },
  getVerificationCode() {
    this.getCode();
    var that = this
    that.setData({
      disabled: true
    })

    //  验证原手机号发送验证码
    app.post('User/oldphonesendcode', {
    }, (res) => {
       wx.showToast({
         title: res.info,
         icon: 'succes',
         duration: 1000,
         mask: true
       })
    })

  },

  // 验证码code
  previousCode: function (e) {
    this.setData({
      previousCode: e.detail.value
    })
  },

  // 下一步
  next: function () {
    let previousCode = this.data.previousCode;
    app.post('User/checkoldphonecode', {
      code: previousCode
    }, (res) => {
      wx.showToast({
        title: res.info,
        duration: 1000,
        mask: true
      })
      if(res.code==200){
        wx.redirectTo({
          url: 'bindNewTel/bindNewTel'
        })
      }
    })
  },


// 获取手机号
  getPhoneNum(){
    app.post('User/detial', {}, (res) => {
      this.setData({
        userPhone: res.data.user_info.user_phone
      })
    })
  }

})