const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        loading: 1, // loading加载提示框
        toast: 0, // 提示文字
        toastTxt: '',
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        msg: '',
        order_id: 0,
        status: 0,
        gid: 0,
        pay_success_data: {},
        res_data: {},
        limitMax: 0 // 订单已超过最大每天最大分享次数
    },

    giveUp(){

        let {pay_success_data} = this.data;
        wx.showModal({
            title: `你确定放弃${pay_success_data.activity_indirect_return}金贝吗`,
            content: `再有${pay_success_data.limit_num}位好友帮助便可获得${pay_success_data.activity_indirect_return}金贝哦`,
            cancelText: "放弃机会",//默认是“取消”
            confirmText: "马上分享",//默认是“确定”
            success: function (res) {
                if (res.confirm) {

                } else if (res.cancel) {
                    app.openPage('mine/allOrder/allOrder?ordertype=dtake');
                }
            }
        })

    },

    onShareAppMessage: function () {

        let {res_data} = this.data;
        let shareImg = wx.getStorageSync('shareImg');
        if(this.data.limitMax == 1) return;
        if(shareImg) {
            return app.shareArgs(res_data.e_data, 'shareImg');
        } else {
            return app.shareArgs(res_data.e_data);
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let {status, order_id, gid} = options;
        let {msg} = this.data;
        app.setTitle(status == 200 ? '支付成功' : '支付失败');
        msg = status == 200 ? "成功" : '失败';
        if (status != 200) {
            return this.setData({
                msg, status, gid
            });
        }

        app.post('Order/paySeccussReturn', {
            order_id,
            type: 'online',
            share: 1
        }, (res) => {

            let {order_pay_msg} = res.data;
            this.setData({
                msg, status, order_id, gid,
                pay_success_data: order_pay_msg
            });
            this.share();

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    // 不在点击按钮是发请求，（因为不能异步）
    share() {

        let {res_data, pay_success_data} = this.data;
        app.post('share/getsharedata', {
            order_id: pay_success_data.oid
        }, (res) => {
            if(res.code == 200) {
                this.setData({
                    res_data: res.data
                });
            } else if(res.info == '订单已超过每天最大分享次数') {
                this.setData({
                    toastTxt: '订单已超过每天最大分享次数',
                    toast: 1,
                    limitMax: 1
                });
                setTimeout(function () {
                    wx.navigateBack({
                        delta: 1
                    })
                }, 2500)
            }
            setTimeout(function () {
                wx.hideLoading();
            }, 300);
        })

    },

    openPage(e){

        let {type} = e.currentTarget.dataset;
        let {gid} = this.data;
        if (type == 'order') {

        } else if (type == 'pay') {
            app.openPage('shopCart/order/order?gid=' + gid)
        }

    },

    goHome: function () {
      wx.switchTab({
        url: '/pages/index/index'
      })
    },

    goShare: function () {
      wx.redirectTo({
        url:"/pages/mine/share/share"
      })
    }
});