// pages/mine/mine.js
const app = getApp();


var interval = null //倒计时函数
Page({
    data: {
        date: '请选择日期',
        fun_id: 2,
        time: '获取验证码', //倒计时
        currentTime: 61,
        bindPhoneNum: '',
        code: '',
        history: ''
    },
    onLoad: function (e) {

        let {history} = e;
        this.data.history = history;

    },

    // 获取验证码倒计时
    getCode: function (options) {

        var that = this;
        var currentTime = that.data.currentTime;
        interval = setInterval(function () {
            currentTime--;
            that.setData({
                time: currentTime + '秒'
            });
            if (currentTime <= 0) {
                clearInterval(interval);
                that.setData({
                    time: '重新发送',
                    currentTime: 61,
                    disabled: false
                })
            }
        }, 1000)

    },

    getVerificationCode() {

        wx.showLoading();
        // 判断输入手机号
        let phoneNum = this.data.bindPhoneNum;
        if (this.data.disabled) return;
        if (!checkPhoneNum(phoneNum)) {
            return false;
        }
        var that = this;

        //   绑定手机发送验证码
        app.post('User/bindsendcode', {
            phone: phoneNum
        }, (res) => {
            if (res.code == 200) {
                app.alert('验证码发送成功！', 'success');
                that.setData({
                    disabled: true
                });
                this.getCode();
            } else {
                app.alert(res.info, 'none');
            }
            setTimeout(function () {
                wx.hideLoading();
            }, 300);
        });
        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    // 获取验证码
    code: function (e) {

        this.setData({
            code: e.detail.value
        })

    },

    // 获取输入的手机号
    bindPhoneNum: function (e) {

        this.setData({
            bindPhoneNum: e.detail.value
        })

    },

    // 绑定入库
    bindTel: function () {

        wx.showLoading();
        let {history, code} = this.data;
        let phoneNum = this.data.bindPhoneNum;

        if (!checkPhoneNum(phoneNum)) {
            return false;
        }
        app.post('User/bindphone', {
            phone: phoneNum,
            code: code
        }, (res) => {
            if (res.code == 200) {
                app.alert(res.info, 'success', () => {
                    if (history == 'order') {
                        app.openPage('shopCart/order/order');
                    } else if (history == 'onebuy') {
                        // wx.setStorageSync('onebuyTel', '1');
                        var pages = getCurrentPages(); // 获取页面栈
                        var prevPage = pages[pages.length - 2]; // 上一个页面
                        prevPage.setData({
                            bindTelBack: 1
                        });
                        wx.navigateBack({
                            bindTelBack: 1
                        })
                    } else {
                        wx.switchTab({
                            url: '/pages/mine/mine'
                        })
                    }
                })
            } else {
                app.alert(res.info, 'none');
            }
            setTimeout(function () {
                wx.hideLoading();
            }, 300);
        });
        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    }

});

function checkPhoneNum(phoneNum) {

    var myreg = /^1[345789]{1}\d{9}$/;
    if (phoneNum.length == 0) {
        wx.showToast({
            title: '手机号不能为空',
            icon: 'none'
        });
        return false;
    } else if (phoneNum.length < 11) {
        wx.showToast({
            title: '手机号长度有误！',
            icon: 'none'
        });
        return false;
    } else if (!myreg.test(phoneNum)) {
        wx.showToast({
            title: '手机号有误！',
            icon: 'none'
        });
        return false;
    }
    return true;

}