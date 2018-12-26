
const app = getApp();
var interval = null //倒计时函数
Page({
  data: {
    date: '请选择日期',
    fun_id: 2,
    time: '获取验证码', //倒计时 
    currentTime: 60,
    newPhone: '',//新手机号
    code: ''  //验证code
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
    // 判断输入手机号
    let phone = this.data.newPhone;
    if (this.data.disabled) return;
    if (!checkPhoneNum(phone)) {
      return false;
    }
    var that = this;

    //   绑定手机发送验证码
    app.post('User/modifyuserphonesendcode', {
      phone: phone,
    }, (res) => {
      if (res.code == 200) {
        app.alert('验证码发送成功！', 'success');
        that.setData({
          disabled: true
        })
        this.getCode();
      } else {
        app.alert(res.info, 'none');
      }
    })

  },

  // 获取验证码
  code: function (e) {
    this.setData({
      code: e.detail.value
    })
  },

  // 获取手机号
  newPhone: function (e) {
    this.setData({
      newPhone: e.detail.value
    })
  },


  // 绑定入库
  bindTel: function () {
    let { code } = this.data;
    let phone = this.data.newPhone;

    if (!checkPhoneNum(phone)) {
      return false;
    }
    app.post('User/bindnowphone', {
      phone: phone,
      code: code
    }, (res) => {
      if (res.code == 200) {
        wx.showToast({
          title: '绑定成功',
          icon: 'success',
          success: function () {
            setTimeout(function () {
              wx.switchTab({
                url: '/pages/mine/mine'
              })
            }, 2000) //延迟时间
          }
        })
      } else {
        app.alert(res.info, 'none');
      }
    })
  },

})

function checkPhoneNum(phoneNum) {
  var myreg = /^1[345789]{1}\d{9}$/;
  if (phoneNum.length == 0) {
    wx.showToast({
      title: '手机号不能为空',
      icon: 'none',
    })
    return false;
  } else if (phoneNum.length < 11) {
    wx.showToast({
      title: '手机号长度有误！',
      icon: 'none',
    })
    return false;
  } else if (!myreg.test(phoneNum)) {
    wx.showToast({
      title: '手机号有误！',
      icon: 'none',
    })
    return false;
  }
  return true;
}