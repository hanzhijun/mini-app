const app = getApp();

Page({
    data: {
        num: 1,
        // 使用data数据对象设置样式名
        minusStatus: 'disabled',
        contactName: '',
        contactTel: '',
        note: '',
        date: '',
        time: ''
    },

    bindDateChange: function (e) {
        this.setData({
            date: e.detail.value
        })
    },
    bindTimeChange: function (e) {
        this.setData({
            time: e.detail.value
        })
    },


    /* 点击减号 */
    bindMinus: function () {

        var num = this.data.num;
        if (num > 1) {
            num--;
        }
        var minusStatus = num <= 1 ? 'disabled' : 'normal';
        // 将数值与状态写回
        this.setData({
            num: num,
            minusStatus: minusStatus
        });

    },

    /* 点击加号 */
    bindPlus: function () {

        var num = this.data.num;
        if (num >= 50) {
            num = 50;
            wx.showToast({
                title: '人数不能超过50人',
                icon: 'none'
            })
        } else {
            num++;
        }
        // 只有大于一件的时候，才能normal状态，否则disable状态
        var minusStatus = num < 1 ? 'disabled' : 'normal';
        // 将数值与状态写回
        this.setData({
            num: num,
            minusStatus: minusStatus
        });

    },

    /* 输入框事件 */
    bindManual: function (e) {

        var num = e.detail.value;
        // 将数值与状态写回
        this.setData({
            num: num
        });

    },

    onLoad: function () {

        // 获取到详情页图片内容标题
        let name = wx.getStorageSync('name');
        let logo = wx.getStorageSync('logo');
        let desc_info = wx.getStorageSync('desc_info');
        let logo_path = wx.getStorageSync('logo_path');
        this.setData({
            name: name,
            desc_info: desc_info,
            logo: logo,
            logo_path: logo_path
        });

        getNowTime(this);

    },

    // 获取联系人
    contactName: function (e) {

        this.setData({
            contactName: e.detail.value
        });
        if (this.data.contactName.length > 10) {
            wx.showToast({
                title: '联系人名称不能超过10字',
                icon: 'none'
            })
        }

    },

    // 获取联系电话
    contactTel: function (e) {

        this.setData({
            contactTel: e.detail.value
        });
        // 验证手机号
        var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
        if (this.data.contactTel.length == 0) {
            wx.showToast({
                title: '手机号不能为空',
                icon: 'none'
            });
            return false;
        } else if (this.data.contactTel.length < 11) {
            wx.showToast({
                title: '手机号长度有误！',
                icon: 'none'
            });
            return false;
        } else if (!myreg.test(this.data.contactTel)) {
            wx.showToast({
                title: '手机号有误！',
                icon: 'none'
            });
            return false;
        }

    },

    // 获取留言
    note: function (e) {

        this.setData({
            note: e.detail.value
        });
        if (this.data.note.length > 100) {
            wx.showToast({
                title: '留言不能超过100字',
                icon: 'none'
            });
        }
    },

    // 立即预约
    ImReservation: function () {

        wx.showLoading();
        let contactName = this.data.contactName;
        let contactTel = this.data.contactTel;
        let note = this.data.note;
        let numPeople = this.data.num;
        let times = app.formatTime(this.data.date + ' ' + this.data.time, 'num');
        let id = wx.getStorageSync('id');

        app.post('business/retentionadd', {
            business_offline_id: id,
            retention_at: times,
            contact_name: contactName,
            contact_tel: contactTel,
            remark: note,
            num_people: numPeople
        }, (res) => {
            
            if (res.code == 200) {
                wx.showToast({
                    title: '预约成功',
                    icon: 'none'
                })
            } else {
                wx.showToast({
                    title: res.info,
                    icon: 'none'
                })
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

//获取当前时间
function getNowTime(tempThis) {

    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    if (month < 10) {
        month = '0' + month;
    }
    if (day < 10) {
        day = '0' + day;
    }
    var h = now.getHours();
    var m = now.getMinutes();
    var s = now.getSeconds();
    var yearMonthDay = year + '-' + month + '-' + day;
    var currentTime = h + ':' + m;
    tempThis.setData({
        date: yearMonthDay,
        time: currentTime
    })

}

