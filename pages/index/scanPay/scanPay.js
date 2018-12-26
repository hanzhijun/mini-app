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
        business_offline_id: 0,
        business_name: '',
        money: 0,           // 输入的价格
        user_info: {},
        is_gold: 0,         // 是否开启金贝优惠
        is_balance: 0,      // 是否开启余额优惠
        youhui: 0,          // 优惠价格
        pay: 0,              // 支付价格
        discount: '', // 商家折扣
        back_gold_ratio: '', // 反金贝比例
        afterPrice: '', // 优惠后价格
        gold: '', // 拥有金贝数
        useGold: '', // 使用金贝数
        returnGold: '' // 返金贝数
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        let {business_offline_id = 0, business_name = ''} = options || {};
        this.setData({
            business_offline_id, business_name
        });

    },

    onShow() {
        let that = this.selectComponent("#loginBox");
        let _this = this;
        if (!wx.getStorageSync('token')) {
            if (that) {
                that.setData({
                    hidden: false
                });
            }
        } else {
            if (that) {
                that.setData({
                    hidden: 'hidden',
                });
            }
            _this.init();
        }
    },

    init() {
        this.getUserMsg();
        this.offlinegetdetailed();
    },

    // 输入价格
    checkPrice(e) {

        this.data.money = e.detail.value * 1;
        this.calc();

    },

    getUserMsg() {

        app.post('/User/detial', {}, (res) => {
            this.setData({
                user_info: res.data.user_info,
                gold: res.data.user_info.surplus_goldshells,
                balance: res.data.user_info.balance,
                is_gold: false,
                is_balance: false
            });
            setTimeout(function () {
                wx.hideLoading();
            }, 300);
        })

    },

    offlinegetdetailed() {
        let {business_offline_id} = this.data;
        app.post('/business/offlinegetdetailed', {
            business_offline_id
        }, (res) => {
            this.setData({
                business_name: res.data.name,
                discount: res.data.discount,
                back_gold_ratio: res.data.back_gold_ratio,
                loading: 0
            });
        })
    },

    loginevent: function (e) {
        setTimeout(() => {
            this.init();
        }, 300)
    },

    calc: function () {

        let {
            is_gold, // 是否使用金贝
            money, // 输入的价格
            gold, // 拥有金贝数
            pay, // 支付价格
            discount, // 商家折扣
            back_gold_ratio, // 反金贝比例
            returnGold, // 返金贝数
            useGold, // 使用金贝数
            afterPrice
        } = this.data;
        // 计算折后价格
        if(discount > 0 && discount < 100) {
            afterPrice = Math.floor(money * discount) / 100;
        } else {
            afterPrice = money
        }
        // 计算返金贝数
        if(back_gold_ratio) {
            returnGold = Math.floor(money * back_gold_ratio / 100)
        } else {
            returnGold = 0
        }
        // 计算使用金贝数
        if(is_gold && gold) {
            if(gold < afterPrice) {
                useGold = gold
            } else {
                useGold = Math.floor(afterPrice)
            }
        } else {
            useGold = 0
        }
        // 计算支付价格
        pay = (afterPrice * 1000 - useGold * 1000) / 1000;
        this.setData({
            afterPrice,
            returnGold,
            useGold,
            pay
        });

    },

    switch1Change: function (e) {

        let {type} = e.currentTarget.dataset;
        let {user_info} = this.data;
        let flag = e.detail.value;
        if (type == 'gold') {
            this.data.is_gold = flag
        } else {
            this.data.is_balance = flag
        }

        this.calc();

    },

    pay: function () {

        wx.showLoading();
        let {business_offline_id, money, is_gold, is_balance} = this.data;
        if (money <= 0) return app.alert('价格不能为0！');
        app.post('/Offline/createDownOrder', {
            business_id: business_offline_id,
            cash: money,
            is_use_gold: is_gold,
            is_use_balance: false
        }, (res) => {
            let {jasp_pay, package_order_no} = res.data;
            if (res.code == 200) {
                if (jasp_pay) {
                    wx.requestPayment({
                        'timeStamp': jasp_pay.timeStamp.toString(),
                        'nonceStr': jasp_pay.nonceStr,
                        'package': jasp_pay.package,
                        'signType': jasp_pay.signType,
                        'paySign': jasp_pay.paySign,
                        'success': function (e) {
                            app.openPage();
                            // app.openPage(`shopCart/pay/pay?types=支付&status=200&btn=2&order_no=${package_order_no}&business_id=${business_offline_id}&buy_type=offline`);
                            wx.redirectTo({
                                url: `/pages/shopCart/pay/pay?types=支付&status=200&btn=2&order_no=${package_order_no}&business_id=${business_offline_id}&buy_type=offline`
                            })
                        },
                        'fail': function () {
                            // app.openPage(`shopCart/pay/pay?types=支付&status=500&btn=2&order_no=${package_order_no}&business_id=${business_offline_id}&buy_type=offline`);
                            wx.redirectTo({
                                url: `/pages/shopCart/pay/pay?types=支付&status=500&btn=2&order_no=${package_order_no}&business_id=${business_offline_id}&buy_type=offline`
                            })
                        }
                    })
                } else {
                    // app.openPage(`shopCart/pay/pay?types=支付&status=200&btn=2&order_no=${package_order_no}&business_id=${business_offline_id}&buy_type=offline`);
                    wx.redirectTo({
                        url: `/pages/shopCart/pay/pay?types=支付&status=200&btn=2&order_no=${package_order_no}&business_id=${business_offline_id}&buy_type=offline`
                    })
                }
            } else if (res.code == 403) {

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