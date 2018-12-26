const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        category_logo_url: '',
        order_detail: [],
        userinfo: [],
        mycollect: [],
        orthor: {},
        total: {            // 合计
            use_silver: 0,    // 银贝
            freight: 0,       // 运费
            price: 0,         // 现金
            gold: 0,          // 金贝
            copper: 0,        // 铜贝
            subtotal: 0,      // 商品小计
            activity: 0      // 活动优惠
        },
        aftersale: [],      // 售后
        ordertype: '',
        order_id: '',
        order_status: app.config.order_status,
        disable: true,      // 判断售后物流信息 是否可以填写
        logistics: '',
        logistics_id: ''
    },

    onLoad: function (optinos) {

        wx.showLoading();
        let {order_id, business_id, ordertype, info_id, logistics_id, logistics} = optinos;
        let {total, disable}  = this.data;
        if (ordertype == 'aftersale') {     // 售后详情
            app.post('Myorder/exceptionLogistics', {
                order_id,
                info_id
            }, (res)=> {

                let aftersale = res.data;

                let json = [{
                    business_name: aftersale.business_name,
                    goods_info: [aftersale]
                }];

                if (aftersale.payment == 0) { // 非活动
                    if (aftersale.type == -1) {
                        total.price = aftersale.g_price * aftersale.g_num || 0;
                    } else {
                        total.use_silver = aftersale.use_silver || 0;
                    }

                    total.freight = aftersale.freight || 0;
                } else {  // 活动
                    if (aftersale.payment == 1) {
                        total.price = aftersale.ac_price * aftersale.g_num || 0;
                    } else if (aftersale.payment == 2) {
                        total.gold = aftersale.ac_gold_price || 0;
                        total.copper = aftersale.ac_copper_price || 0
                    } else if (aftersale.payment == 3) {
                        total.use_silver = aftersale.ac_price * aftersale.g_num || 0
                    }
                }

                logistics_id = aftersale.logistics_id;
                logistics = aftersale.logistics;
                disable = aftersale.logistics_id ? true : false;
                this.setData({
                    order_detail: json,
                    ordertype,
                    aftersale,
                    total,
                    disable,
                    logistics: logistics== undefined ? '': logistics,
                    logistics_id: logistics_id == undefined? '': logistics_id,
                    category_logo_url: res.category_logo_url
                });

                setTimeout(function () {
                    wx.hideLoading();
                }, 300);

            })
        } else {
            app.post('Order/clientOrderdetail', {
                order_id,
                business_id,
                ordertype
            }, (res) => {

                let {order_detail, userinfo, mycollect, orthor} = res.data;

                for (let store of order_detail) {
                    for (let goods of store.goods_info) {
                        if (goods.payment == 0) {
                            if (goods.g_type == -1) {
                                total.price += +goods.g_price;
                            } else {
                                total.use_silver += goods.use_silver;
                            }
                        } else {
                            if (goods.payment == 1) {
                                total.price += +goods.balance;
                                total.price += +goods.cash;
                                total.gold += goods.gold;
                            } else if (goods.payment == 2) {
                                total.gold += goods.gold;
                                total.copper += goods.copper;
                            } else if (goods.payment == 3) {
                                total.use_silver += goods.silver;
                            }
                        }
                        total.freight += +goods.freight;
                        if(store.goods_info[0].option == 1) {
                            store.g_price = store.goods_info[0].g_price
                        }
                    }
                }

                this.setData({
                    order_detail,
                    userinfo,
                    mycollect,
                    orthor,
                    total,
                    ordertype,
                    order_id,
                    category_logo_url: res.category_logo_url
                });

                setTimeout(function () {
                    wx.hideLoading();
                }, 300);

            })
        }

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    // 申请售后
    openPage: function (e) {

        let {info_id} = e.currentTarget.dataset;
        let {order_id} = this.data;
        app.openPage(`mine/allOrder/choiceType/choiceType?info_id=${info_id}&order_id=${order_id}`);

    },

    // 跳转详情
    openPageDetail: function (e) {

        let {info_id} = e.currentTarget.dataset;
        app.openPage(`shopCart/goodsDetail/goodsDetail?gid=${info_id}`);

    },

    // 复制快递订单号
    copy: function (e) {

        let {logistics_id} = e.currentTarget.dataset;
        wx.setClipboardData({
            data: logistics_id
        })

    },

    // 获取input
    logInfo: function (e) {

        let {type} = e.currentTarget.dataset;
        let {logistics, logistics_id} = this.data;

        if (type == 'order') {
            logistics_id = e.detail.value;
        } else {
            logistics = e.detail.value;
        }

        this.data.logistics_id = logistics_id;
        this.data.logistics = logistics;

    },

    // 提交物流订单号
    submit: function (e) {

        let {exc_id} = e.currentTarget.dataset;
        let {logistics_id, logistics} = this.data;
        if (!logistics_id || !logistics) return app.alert('请填写信息！', 'none');

        app.post('Order/afterSaleLogisticsInfo', {
            exc_id,
            logistics_id,
            logistics
        }, (res) => {
            if (res.code == 200) {
                app.alert('提交成功！', 'success');
                this.setData({
                    logistics_id,
                    logistics,
                    disable: true
                })
            } else {
                app.alert(res.info, 'none');
            }
        });

    }
});