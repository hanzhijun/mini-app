const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        category_logo_url: '',
        defaultreceiver: {receiver_id: -1},      // 收货地址
        result: [],               // 商品信息
        user_account: {},         // 账户信息
        jinbei: false,            // 金贝优惠开关
        balance: false,           // 余额开关
        // 最终结算
        total: {
            'silver_price': 0,      // a类   银贝
            'price': 0,             // b类   金贝  商品总额
            'freight_frient': 0,    // 运费
            'copper_price': 0,      // 铜贝
            'gold_price': 0,        // 金贝
            'payment': 0            // 实付金额
        },
        total_price: 0,           // 记录没有优惠的商品总额
        // 店铺显示结果
        store_info: {
            /*
             store_id: {             // 店铺id
             silver_price: 0,      // 银贝
             price: 0,             // 现金    除以100
             freight_frient: 0     // 运费
             copper_price: 0,      // 铜贝
             gold_price: 0,        // 金贝
             }*/
        },
        id_info: {                // 后台参数
            /**
             * cid: leave_word      // cid: 留言
             */
        },
        is_gold_copper: 0,        // 判断是否显示铜贝优惠     金贝 + 铜贝的支付方式
        is_silver: 0,             // 判断是否显示银贝优惠     b类商品
        is_gold: 0,               // 是否显示金贝优惠
        is_yu: 0,                 // 是否显示余额
        alert_box: false,         // 控制是否显示弹窗
        alert_box_msg: 1,         // 1: 收货地址  403：获取手机验证码  2：绑定手机
        phone: 0,                 // 获取手机验证码使用
        count_down: 0,            // 倒计时时间
        code: '',                 // 验证码
        ginfo: {},
        gid: 0
    },

    onLoad: function (options) {

        this.getOrder(options);

    },

    getOrder(options) {

        wx.showLoading();
        this.data.id_info = {};
        this.data.store_info = {};
        this.data.ginfo = {};
        this.data.total = {
            'silver_price': 0,      // a类   银贝
            'price': 0,             // b类   金贝  商品总额
            'freight_frient': 0,    // 运费
            'copper_price': 0,      // 铜贝
            'gold_price': 0,        // 金贝
            'payment': 0            // 实付金额
        };

        let {receiver_id, receiver_address, receiver_name, receiver_phone, gid=0, order_id=''} = options;

        let {defaultreceiver, store_info, id_info, total, result, user_account, is_gold_copper, is_silver, ginfo, total_price, is_gold, is_yu} = this.data;

        if (wx.getStorageSync('ginfo')) {
            ginfo = wx.getStorageSync('ginfo');
        }

        let count_down = wx.getStorageSync('count_down');
        ginfo.receiver_id = defaultreceiver.receiver_id;
        ginfo.game_buy = 1;

        app.post('Order/confirmOrder_new', ginfo, (res) => {
            if (res.code == 200) {
                let {defaultreceiver, is_can_buy, result, user_account, game_discount} = res.data;
                if (!game_discount) {
                    game_discount = {}
                }
                // 初始化id_info && 运费 && 银贝总额  && 金贝总额
                for (let store of result) {
                    let storeId = store.business_id;
                    if (!store_info[storeId]) {
                        store_info[storeId] = {
                            silver_price: 0,
                            price: 0,
                            freight_frient: 0,
                            copper_price: 0,
                            gold_price: 0
                        };
                    }

                    for (let goods of store.goods_info) {
                        id_info[goods.goods_id] = '';
                        store_info[storeId].freight_frient += +goods.freight_frient;
                        if (goods.is_active == 1) { // 活动商品
                            if (goods.payment == 1) {  // 金贝+现金
                                store_info[storeId].price += goods.price * goods.nums;
                                total.price += goods.price * goods.nums;
                                total.payment = +total.price;
                                is_gold = 1;
                            } else if (goods.payment == 2) {  // 金贝+铜贝;
                                store_info[storeId].gold_price += goods.gold_price * goods.nums;
                                store_info[storeId].copper_price += goods.copper_price * goods.nums;
                                total.gold_price += goods.gold_price * goods.nums;
                                total.copper_price += goods.copper_price * goods.nums;
                                is_gold_copper = 1;
                                is_gold = 1;
                            } else if (goods.payment == 3) { // 银贝
                                store_info[storeId].silver_price += goods.price * goods.nums;
                                total.silver_price += goods.silver_price * goods.nums;
                                is_silver = 1;
                            }
                        } else {
                            if (goods.goods_type == -1) {
                                store_info[storeId].price += goods.price * goods.nums;
                                total.price += goods.price * goods.nums;
                                total.payment = +total.price;
                                is_yu = 1;
                            } else {
                                store_info[storeId].silver_price += goods.silver_price * goods.nums;
                                total.silver_price += goods.silver_price * goods.nums;
                                is_silver = 1;
                            }
                        }

                        total.freight_frient += +goods.freight_frient;
                        total.payment += +total.freight_frient;
                    }
                }

                // 修改收货地址
                if (receiver_id && receiver_address && receiver_name && receiver_phone) {
                    defaultreceiver = {
                        receiver_id,
                        receiver_address,
                        receiver_name,
                        receiver_phone
                    }
                }
                total_price = total.price;
                is_yu = total_price ? 1 : 0;
                this.setData({
                    defaultreceiver,
                    store_info,
                    result,
                    total,
                    user_account,
                    is_gold_copper,
                    is_silver,
                    ginfo,
                    total_price,
                    gid,
                    is_yu,
                    is_gold,
                    category_logo_url: res.category_logo_url,
                    jinbei: true,
                    balance: false,
                    game_discount
                });

                setTimeout(function () {
                    wx.hideLoading();
                }, 300);

                if (is_gold_copper) return;

                if (total.price < 100) return this.setData({
                    jinbei: false,
                    balance: false
                });

                var s_price = total.price;
                if (game_discount.reward_discount) { // 活动奖励折扣
                    s_price = s_price * game_discount.reward_discount / 100
                }
                if (game_discount.reward_gold) { // 活动奖励金贝
                    s_price -= game_discount.reward_gold * 100;
                }

                if (s_price / 100 > user_account.surplus_goldshells) {
                    s_price = (s_price - user_account.surplus_goldshells * 100) / 100
                } else if (s_price % 100 != 0) {
                    s_price = s_price % 100 / 100
                } else {
                    s_price = 0
                }

                s_price = s_price * 100;
                total.payment = (s_price + total.freight_frient).toFixed(2) * 1;
                if(game_discount.game_type == 1 && game_discount.reward_type == 1) {
                    total.payment = 0
                }
                this.setData({
                    total,
                    ginfo
                });

            } else {
                app.alert(res.info, 'none', () => {
                    // app.openPage(`shopCart/goodsDetail/goodsDetail?gid=${gid}`, 1);
                });
            }
        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    onShow: function () {

        let _this = this;
        let changeAddress = wx.getStorageSync('changeAddress');

        if (changeAddress) {
            let {receiver_id, receiver_address, receiver_name, receiver_phone} = JSON.parse(changeAddress);
            let defaultreceiver = {
                receiver_id,
                receiver_address,
                receiver_name,
                receiver_phone
            };
            _this.setData({
                defaultreceiver
            });
            defaultreceiver.order_id = 0;
            defaultreceiver.gid = 0;
            this.getOrder(defaultreceiver);
            wx.removeStorageSync('changeAddress')
        }

    },

    // 滑动选项
    checkSwitch: function (e) {

        let {ginfo} = this.data;
        let {type, num} = e.currentTarget.dataset;
        let flag = e.detail.value ? 1 : 0;
        let {total, total_price, game_discount} = this.data;
        if (!game_discount) {
            game_discount = {}
        }
        let {price} = total;
        if (price < 100 && flag) return this.setData({
            jinbei: true,
            balance: false
        });

        if (type == 'jinbei') { // 金贝
            ginfo.is_use_gold = flag;
        } else if (type == 'yue') {
            ginfo.is_use_balance = flag;
            num = num / 100;
        }

        if (flag) {
            if (game_discount.reward_discount) { // 活动奖励折扣
                price = price * game_discount.reward_discount / 100
            }
            if (game_discount.reward_gold) { // 活动奖励金贝
                price -= game_discount.reward_gold * 100
            }
            // price = price / 100 - num < 0 ? 0 : (price - num * 100) / 100;

            if (price / 100 > num) {
                price = (price - num * 100) / 100
            } else if (price % 100 != 0) {
                price = price % 100 / 100
            } else {
                price = 0
            }

            price = price * 100;
        } else {
            if (game_discount.reward_discount) { // 活动奖励折扣
                price = total_price * game_discount.reward_discount / 100
            }
            if (game_discount.reward_gold) { // 活动奖励金贝
                price = total_price - game_discount.reward_gold * 100
            }
        }
        // total.price = price;
        total.payment = (price + total.freight_frient).toFixed(2) * 1;
        this.setData({
            total,
            ginfo
        })

    },

    // 关闭弹窗
    closeBox: function () {

        this.setData({
            alert_box: false
        })

    },

    openPage: function () {

        let {alert_box_msg} = this.data;
        if (alert_box_msg == 1) {
            app.openPage('mine/adress/adress?history_page=')
        } else if (alert_box_msg == 2) {
            app.openPage('mine/accoutManage/bindTel/bindTel?history=order')
        }

    },

    openPageAddress: function () {

        app.openPage('mine/adress/adress?history_page=order&type=game')

    },

    // 处理留言
    dealMsg: function (e) {

        let {id_info} = this.data;
        let {cid} = e.currentTarget.dataset;
        id_info[cid] = e.detail.value;

    },

    // 获取短信验证码
    getCode: function () {

        wx.showLoading();
        app.post('Order/sendAccountCode', {}, (res) => {

            if (res.code == 200) {
                this.data.count_down = 60;
                this.setTime();
                app.alert('验证码已发送！', 'none');
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

    // 倒计时调用这个方法
    setTime: function () {

        let {count_down} = this.data;
        //  如果倒计时不为0
        if (count_down > 0) {
            let time = setInterval(() => {
                if (count_down <= 0) {
                    clearInterval(time);
                    count_down = 0;
                } else {
                    count_down -= 1;
                }

                this.setData({
                    count_down
                });
                app.setStorageSync({
                    count_down
                });
            }, 1000)
        } else {
            this.setData({
                count_down: 0
            });

            app.setStorageSync({
                count_down: 0
            });
        }

    },

    // 验证验证码  确认按钮
    checkCode: function () {

        wx.showLoading();
        let code = this.data.code;
        app.post('Order/chenkAccountCode', {
            code
        }, (res) => {
            if (res.code == 200) {
                wx.removeStorageSync('count_down');
                app.alert('验证成功', 'success', () => {
                    this.pay();
                });
            } else {
                app.alert(res.info, 'none')
            }

            this.setData({
                alert_box: false
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);
        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    editCode: function (e) {

        this.setData({
            code: e.detail.value
        })

    },

    // 去支付
    pay: function () {

        wx.showLoading();
        let {defaultreceiver, result, user_account, jinbei, id_info, ginfo, gid} = this.data;
        let receiver_id = defaultreceiver.receiver_id;
        ginfo.receiver_id = receiver_id;
        ginfo.game_buy = 1;
        // 整理数据
        for (let goods of ginfo.param) {
            goods.leave_word = id_info[goods.goods_id];
        }

        if (!ginfo.param.length) return app.alert('该商品已下架！', 'none');

        // 支付成功的情况
        function pay_success(order_id, flag) {
            /* start */
            flag && app.post('/Order/wxQueryorder', {order_id: order_id});// 后台让请求的 不知道什么用
            /* end */
            wx.removeStorageSync('gid');
            wx.removeStorageSync('spec_id');
            let str = +ginfo.share ? 'shopCart/paySuccess/paySuccess' : 'shopCart/pay/pay';
            app.openPage(`${str}?types=支付&status=200&btn=3,2&order_id=${order_id}&business_id=${result[0].business_id}&ordertype=dtake&buy_type=online&gid=${gid}`, `close`);
        }

        // 支付失败的情况
        function pay_error(order_id) {
            let str = +ginfo.share ? 'shopCart/paySuccess/paySuccess' : 'shopCart/pay/pay';
            app.post('Order/payFail', {});
            app.openPage(`${str}?types=支付&status=0&btn=3,2&order_id=${order_id}&business_id=${result[0].business_id}&ordertype=dpay&buy_type=online&gid=${gid}`, `close`);
        }

        app.post('Order/goToPayOrder', ginfo, (res) => {
            let {jasp_pay, order_id} = res.data;

            if (res.code == 200) {
                if (jasp_pay) {
                    wx.requestPayment({
                        'timeStamp': jasp_pay.timeStamp.toString(),
                        'nonceStr': jasp_pay.nonceStr,
                        'package': jasp_pay.package,
                        'signType': jasp_pay.signType,
                        'paySign': jasp_pay.paySign,
                        'success': function (e) {
                            pay_success(order_id, 1);
                        },
                        'fail': function () {
                            pay_error(order_id);
                        }
                    })
                } else {
                    pay_success(order_id);
                }

            } else if (res.code == 403) {        // 获取手机验证码
                if (res.data.phone) {
                    // this.setTime();
                    // !wx.getStorageSync('count_down') && this.getCode();

                    // this.setData({
                    //   alert_box_msg: 403,
                    //   phone: res.data.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
                    //   alert_box: true
                    // })
                } else {                        // 没绑定手机号
                    this.setData({
                        alert_box: true,
                        alert_box_msg: 2
                    })
                }

            } else {
                app.alert(res.info, 'none', () => {
                    !jasp_pay && pay_error(order_id);
                });
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