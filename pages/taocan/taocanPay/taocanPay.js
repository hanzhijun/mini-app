const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        num: 1,
        res_data: {},
        id: 0,
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        total: 0,
        is_use_gold: 1,
        switchFlag: true,
        pay: 0           // 实付金额
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.showLoading();
        let {id} = options;
        let that = this;
        app.post('/Offline/confirmComboOrder', {
            package_id: id
        }, (res) => {

            app.setTitle(res.data.package_name);
            that.setData({
                res_data: res.data,
                total: res.data.price / 100,
                pay: res.data.price / 100,
                id
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

            let {total, res_data, pay} = that.data;
            let gold = res_data.surplus_goldshells;
            let [zhengshu, xiaoshu = ''] = total.toString().split('.');
            pay = zhengshu - gold < 0 ? 0 : zhengshu - gold;
            pay = +(pay + '.' + xiaoshu);
            that.setData({
                pay, total
            })

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    switch1Change: function (e) {

        let {total, res_data, pay, switchFlag} = this.data;
        switchFlag = e.detail.value;
        let gold = res_data.surplus_goldshells;
        let [zhengshu, xiaoshu = ''] = total.toString().split('.');
        if (switchFlag) {
            pay = zhengshu - gold < 0 ? 0 : zhengshu - gold;
            pay = +(pay + '.' + xiaoshu);
        } else {
            pay = total;
        }

        this.setData({
            pay, total, switchFlag
        })

    },

    // 支付
    pay: function () {

        wx.showLoading();
        let {pay, switchFlag, id, num} = this.data;
        app.post('Offline/createComboOrder', {
            package_id: id,
            num,
            is_use_gold: switchFlag ? 1 : 0,
            is_use_balance: 0
        }, (res) => {

            if (res.code == 200) {
                let {jasp_pay, package_order_no} = res.data;
                if (res.data.jasp_pay) {
                    wx.requestPayment({
                        timeStamp: jasp_pay.timeStamp + '',
                        nonceStr: jasp_pay.nonceStr,
                        package: jasp_pay.package,
                        signType: jasp_pay.signType,
                        paySign: jasp_pay.paySign,
                        success: function () {
                            app.alert('支付成功！', 'success', () => {
                                app.post('Offline/wxRefundSearch', {order_id: jasp_pay.order_id}, () => {
                                    app.openPage(`taocan/payStatus/payStatus?package_order_id=${res.data.package_order_id}&type=1&id=${id}`)
                                });
                            })
                        },
                        fail: function () {
                            app.post('/Offline/payfail', {order_no: package_order_no});
                            app.alert('支付失败', 'none', () => {
                                app.post('Order/payFail', {});
                                app.openPage(`taocan/payStatus/payStatus?package_order_id=${res.data.package_order_id}&type=0&id=${id}`)
                            })
                        }
                    })
                } else {  // 支付现金为0
                    app.alert('支付成功！', 'success', () => {
                        app.openPage(`taocan/payStatus/payStatus?package_order_id=${res.data.package_order_id}&type=1&id=${id}`)
                    })
                }
            } else {
                app.alert(res.info, 'none');
            }

            setTimeout(function () {
                wx.hideLoading();
            }, 300);
        })
    },

    checkNum(e) {

        let {type} = e.currentTarget.dataset;
        let {num, total, res_data} = this.data;
        num += +type;
        num <= 1 && (num = 1);
        total = res_data.price / 100 * num;
        return app.alert('只能购买一张！', 'none', () => {
            num = 1;
            total = res_data.price / 100;
            this.setData({
                num, total
            })
        })

    }
});