let app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        hiddenLoading: false,
        types: '',        // 支付 || 兑换
        status: 0,        // 200:成功  其他code:失败
        btn_json: {       // 按钮根据这个字段显示
            1: ['查看套餐', 0],
            2: ['回到首页', 1],
            3: ['查看订单', 0]
        },
        btn: [],
        order_id: '',
        business_id: '',
        ordertype: '',
        pay_msg: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        // buy_type 判断线上支付(online)取order_id || 线下支付(offline)取order_no
        let {types, status, btn, order_id = 0, business_id = 0, ordertype = 0, buy_type, order_no=0} = options;

        app.post('Order/paySeccussReturn', {
            order_id: buy_type == 'online' ? order_id : order_no,
            type: buy_type
        }, (res) => {
            if (res.code == 200) {
                this.setData({
                    types,
                    status,
                    pay_msg: res.data,
                    btn: btn.split(','),
                    order_id, business_id, ordertype, buy_type,
                    hiddenLoading: true
                })
            }

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    openPage: function (e) {

        let {btn_json, order_id, business_id, ordertype, pay_msg} = this.data;
        let {index} = e.currentTarget.dataset;
        if (index == 1) {
            app.openPage(`mine/package/packageDetail/packageDetail?id=${order_id}&type=unused`)
        } else if (index == 2) {
            wx.switchTab({
                url: '/pages/index/index',
            })
        } else if (index == 3) {
            app.openPage(`mine/allOrder/finishDetail/finishDetail?order_id=${order_id}&business_id=${business_id}&ordertype=${ordertype}`)
        }

    }

});