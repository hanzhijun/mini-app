const app = getApp();

Page({
    data: {
        category_logo_url: '',
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        page: 1,
        nums: 0,
        alert_msg: [                      // 取消订单提示信息
            {name: '我不想买了', value: '我不想买了', checked: true},
            {name: '信息填写错误，重新拍', value: '信息填写错误，重新拍'},
            {name: '其他原因', value: '其他原因'}
        ],
        cancel_msg: {                             // 取消订单原因    [reason, order_id, business_id]
            reason: '我不想买了',
            order_id: 0,
            business_id: 0
        },
        show_alert: false,                        // 显示取消订单提示框  
        order_list: {                             // 订单数据
            /*
             order_id: {
             business_id: 0,               // 商户id
             business_name: '',            // 商户名字
             sharedata: '',                // 是否是分享商品
             goods_info: {                 // 商品信息
             cid: {

             }
             }        
             }
             */
        },
        goods_info_len: {/*订单id: 数量*/},       // 订单数量        
        order_status: app.config.order_status,  // 订单状态
        btns: {
            1: '取消订单',
            2: '立即付款',
            3: '查看详情',
            4: '查看物流',
            5: '确认收货',
            6: '删除订单',
            7: '重新购买'
        },
        ordertype: '',                    // 当前选中的订单状态
        order_info: {                     // 每个店铺价格
            /*
             order_id: {
             gold: 0,                      // 金贝 
             price:0                       // 现金
             freight: 0,                   // 运费 
             use_silver: 0,                // 银贝价格
             copper:0                      // 铜贝
             }
             */
        },
        orders: [],                        // 选中的订单号
        ids: [],                          // 选中的info_id
        goods_ids: [],                    // 选中的goods_id
        spec_id: [],                       // 立即款使用
        text: "因国庆放假，10月1日-10月7日暂停发货，节日期间订单将于10月8日陆续发货，祝您国庆愉快，万事如意。",
        marqueePace: 1,//滚动速度
        marqueeDistance: 0,//初始滚动距离
        marquee_margin: 30,
        size: 14,
        interval: 20, // 时间间隔
        shareImg: '',
        shareTitle: '',
        e_data: ''

    },

    onLoad: function (options) {

        let {ordertype} = options;
        this.setData({
            ordertype
        });
        this.initData();

    },

    onShow: function () {
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

        let {nums, page, order_list} = this.data;
        if (Object.keys(order_list).length >= nums) return;
        this.data.page += 1;
        this.initData();

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

        this.setData({
            order_list: {},
            page: 1,
            order_info: {},
            orders: [],
            ids: [],
            goods_ids: [],
            spec_id: []
        });
        this.initData();
        wx.stopPullDownRefresh();

    },

    // 全选
    checkAll: function (e) {

        let {order_id} = e.currentTarget.dataset;
        let {orders, ids, order_list, goods_ids} = this.data;
        let checked = e.detail.value.length ? 1 : 0;
        checked ? orders.push(order_id) : (orders = app.arrayRemove(orders, order_id));
        let goodsInfo = order_list[order_id].goods_info;
        for (let key in goodsInfo) {
            let goods = goodsInfo[key];
            if (checked) {
                ids.push(+goods.info_id);
                goods_ids.push(+goods.goods_id)
            } else {
                ids = app.arrayRemove(ids, +goods.info_id);
                goods_ids = app.arrayRemove(goods_ids, +goods.goods_id)
            }
        }

        this.data.orders = orders;
        this.data.ids = ids;
        this.setIds();

    },

    // 选择单个商品
    check: function (e) {

        let {order_id, id, goods_id} = e.currentTarget.dataset;
        let {orders, ids, order_list, goods_ids} = this.data;
        let checked = e.detail.value.length ? 1 : 0;

        if (checked) {
            ids.push(+id);
            goods_ids.push(+goods_id)
        } else {
            ids = app.arrayRemove(ids, +id);
            goods_ids = app.arrayRemove(goods_ids, +goods_id)
        }

        let goodsInfo = order_list[order_id].goods_info;
        for (let key in goodsInfo) {
            let goods = goodsInfo[key];
            if (ids.indexOf(goods.info_id) <= -1) {
                orders = app.arrayRemove(orders, order_id);
                break;
            } else {
                orders.indexOf(order_id) <= -1 && orders.push(order_id);
            }
        }

        this.data.orders = orders;
        this.data.ids = ids;
        this.data.goods_ids = goods_ids;
        this.setIds();

    },

    setIds: function () {

        let {orders, ids, order_list, spec_id} = this.data;
        spec_id = [];
        for (let key in order_list) {
            let order = order_list[key];
            orders.indexOf(key) > -1 ? (order.checked = true) : (order.checked = false);
            for (let gkey in order.goods_info) {
                let goods = order.goods_info[gkey];
                if (ids.indexOf(+gkey) > -1) {
                    goods.checked = true;
                    spec_id.push({
                        goods_id: goods.goods_id,
                        spec_id: goods.spec_id,
                        num: goods.g_num,
                        is_active: goods.is_active,
                        cid: 0,
                        order_id: goods.order_id
                    });
                } else {
                    goods.checked = false;

                }
            }
        }

        this.setData({
            orders, ids, order_list, spec_id
        })

    },

    // 选择取消原因
    getVal: function (e) {

        let {cancel_msg} = this.data;
        cancel_msg.reason = e.detail.value;

    },

    // 取消订单 
    hide: function (e) {

        let {type} = e.currentTarget.dataset;
        let {cancel_msg, ordertype} = this.data;

        if (type == 'finish') {       // 完成按钮
            app.post('Order/cancelOrder', cancel_msg, (res) => {
                if (res.code == 200) {
                    app.alert('取消订单成功！', 'success');
                } else {
                    app.alert('取消订单失败！', 'none')
                }
                this.setData({
                    show_alert: false,
                    order_list: {},
                    page: 1
                });
                this.initData();
            })
        } else {                       // 直接隐藏
            this.setData({
                show_alert: false
            });
        }

    },

    // 切换订单列表
    switchTab: function (e) {

        let {ordertype} = e.currentTarget.dataset;
        this.setData({
            ordertype,
            order_list: {},
            page: 1,
            order_info: {},
            orders: [],
            ids: [],
            goods_ids: [],
            spec_id: []
        });
        this.initData();

    },

    // 初始化数据
    initData: function () {

        wx.showLoading();
        let {order_info, order_list, goods_info_len, page, ordertype, nums} = this.data;
        // order_list = {};
        app.post('Myorder/myOrderListByStatus', {
            ordertype,
            page
        }, (res) => {

            if (res.code == 200) {
                let {orderlist} = res.data;

                // 初始化数据
                for (let order of orderlist) {
                    if (!order_info[order.order_id]) order_info[order.order_id] = {
                        gold: 0,
                        price: 0,
                        freight: 0,
                        use_silver: 0,
                        copper: 0
                    };

                    let orderList1 = {
                        business_id: order.business_id,
                        business_name: order.business_name,
                        order_id: order.order_id,
                        sharedata: '',
                        goods_info: {},
                        activity: order.activity,
                        discount: order.discount,
                        game_concession_record_id: order.game_concession_record_id,
                        total_amount: order.total_amount,
                        amount_payable: order.amount_payable,
                        goods_num: order.goods_num,
                        gold: order.gold,
                        option: ''
                    };

                    /*
                     activity:"",
                     amount_payable:"",
                     discount:"",
                     game_concession_record_id:"",
                     total_amount:""*/

                    let orderInfo = order_info[order.order_id];

                    goods_info_len[order.order_id] = order.goods_info.length;
                    for (let goods of order.goods_info) {

                        orderList1.goods_info[goods.info_id] = goods;
                        if (goods.except_status == 0) {                   // 正常订单
                            if (goods.pay_status == 1) {                    // 未支付
                                orderList1.ordertype = 'dpay';
                            } else {                                        // 已支付
                                if (goods.deliver_status == 1) {              // 待发货
                                    orderList1.ordertype = 'dtake';
                                } else if (goods.deliver_status == 2) {        // 待收货
                                    orderList1.ordertype = 'dcollect';
                                } else if (goods.deliver_status == 3) {       // 已完成
                                    orderList1.ordertype = 'finish';
                                }
                            }
                        } else {                                          // 售后
                            orderList1.ordertype = 'aftersale';
                        }

                        orderList1.sharedata = goods.sharedata;
                        orderList1.option = order.goods_info[0].option;
                        if (order_list[order.order_id]) {
                            for (let s in orderList1.goods_info) {
                                order_list[order.order_id].goods_info[s] = orderList1.goods_info[s];
                            }
                        } else {
                            order_list[order.order_id] = orderList1;
                        }

                        if (goods.payment == 0) {  // 非活动
                            if (goods.g_type == -1) {
                                orderInfo.price += +goods.g_price;
                            } else {
                                orderInfo.use_silver += goods.use_silver / goods.g_num
                            }
                        } else {                  // 活动
                            if (goods.payment == 1) {
                                orderInfo.price += parseInt(+goods.balance + +goods.cash) || 0;
                                orderInfo.gold += goods.gold;
                            } else if (goods.payment == 2) {
                                orderInfo.gold += goods.gold;
                                orderInfo.copper += goods.copper;
                            } else if (goods.payment == 3) {
                                orderInfo.use_silver += +goods.ac_price
                            }
                        }

                        orderInfo.freight += +goods.freight;

                    }
                }

                this.setData({
                    order_list,
                    order_info,
                    ordertype,
                    goods_info_len,
                    nums: res.data.allnum,
                    category_logo_url: res.category_logo_url
                })

            } else {
                // this.setData({
                //   order_list: {}
                // })
            }

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    // 立即付款 || 合并支付
    pay: function () {

        let {spec_id} = this.data;
        app.setStorageSync({
            ginfo: {
                is_use_gold: 1,
                is_use_balance: 0,
                param: spec_id
            }
        });
        app.openPage('shopCart/order/order');

    },


    // 所有按钮调用该方法统一处理
    getBtn: function (event) {

        let {key, order_id, business_id, game_concession_record_id, option} = event.currentTarget.dataset;
        let {cancel_msg, spec_id, ids, order_list, goods_ids, ordertype} = this.data;

        let thisGoodsId = '', thisSpecId = '', isGame = '';

        let info_id = 0;
        if (key == 3 || key == 5 || !key) {
            let goods_info = order_list[order_id].goods_info;
            for (let goods in goods_info) {
                info_id = goods_info[goods].info_id
            }
        }

        switch (key) {
            case 1:                 // 取消订单 
                cancel_msg.order_id = order_id;
                cancel_msg.business_id = business_id;
                this.setData({
                    show_alert: true,
                    cancel_msg
                });
                break;
            case 2:                 // 立即付款
                let goodsInfo = order_list[order_id].goods_info;
                spec_id = [];
                goods_ids = [];

                for (let key in goodsInfo) {
                    let goods = goodsInfo[key];
                    spec_id.push({
                        goods_id: goods.goods_id,
                        spec_id: goods.spec_id,
                        num: goods.g_num,
                        is_active: goods.is_active,
                        cid: 0,
                        order_id: goods.order_id
                    })
                }

                this.data.spec_id = spec_id;
                if(game_concession_record_id) {
                    let json = {
                        is_use_gold: 1,
                        is_use_balance: 0
                    };
                    let spec_json = {
                        goods_id: spec_id[0].goods_id,
                        spec_id: spec_id[0].spec_id,
                        num: 1,
                        is_active: 0,
                        cid: '',
                        order_id: ''
                    };
                    json.param = [spec_json];
                    app.setStorageSync({
                        ginfo: json
                    });
                    app.openPage(`game/order/order?gid=` + spec_id[0].goods_id);
                } else if (option == 1) {
                    let json = {
                        is_use_gold: 1,
                        is_use_balance: 0
                    };
                    let spec_json = {
                        goods_id: spec_id[0].goods_id,
                        spec_id: spec_id[0].spec_id,
                        num: 1,
                        is_active: 0,
                        cid: '',
                        order_id: ''
                    };
                    json.param = [spec_json];
                    app.setStorageSync({
                        ginfo: json
                    });
                    app.openPage(`onebuy/order/order?gid=` + spec_id[0].goods_id);
                } else {
                    this.pay(order_id);
                }
                break;
            case 5:     // 确认收货
                let _this = this;
                app.post('Myorder/confirmCollectGoods', {
                    info_id,
                    order_id
                }, (res) => {
                    if (res.code == 200) {
                        app.alert('收货成功！', 'success');
                    } else {
                        app.alert(res.info, 'none');
                    }
                    this.setData({
                        page: 1,
                        order_list: {}
                    });
                    _this.initData(ordertype);
                });
                break;
            default:
                app.openPage(`mine/allOrder/finishDetail/finishDetail?order_id=${order_id}&business_id=${business_id}&ordertype=${ordertype}&info_id=${info_id}`);
                break;
        }

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (e) {

        if (e.from == 'button') { }
/*        let {e_data, shareImg, shareTitle} = this.data;
        return {
            title: shareTitle,
            path: 'pages/shareBuy/shareBuy?e_data=' + e_data,
            imageUrl: shareImg,
            success: function () {}
        }*/
    },
    /**
     * 再次分享
     */
    shareAgain: function (e) {
        console.log(JSON.stringify(e));
        let {e_data} = e.currentTarget.dataset;
        app.openPage('shareBuy/shareBuy?e_data=' + e_data);
        // let {imgUrl, category_logo_url} = this.data;
        // if(!index) return;
        // let {goods_info} = this.data.order_list[index];
        // for (let key in goods_info) {
        //     let goods = goods_info[key];
        //     this.setData({
        //         shareImg: imgUrl + '/' + category_logo_url + goods.g_pic,
        //         shareTitle: goods.g_name,
        //         e_data
        //     });
        //     break;
        // }
    }
});
