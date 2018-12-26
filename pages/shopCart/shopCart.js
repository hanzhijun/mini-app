const app = getApp();

Page({
    data: {
        cart_msg: {
            /*
             store_id: {
             business_id: 0,       // 商户id
             business_name: '',    // 商户名字
             goods_info: {         // 商品信息
             cid: {

             }
             }
             }
             */
        },
        category_logo_url: '',
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        my_collect: {},
        option: 'no',           // 编辑商品  shopcart：购物车   edit：编辑   no: 购物车为空
        allCheck: false,              // 底部全选
        pay: {                        // 结算
            silver_num: 0,              // 银贝
            get_goldshells: 0,          // 返金贝
            price: 0,                   // 价格
            copper_price: 0,            // 铜贝
            gold_price: 0              // 金贝
        },
        store_ids: [],                // 选中的店铺id
        ids: [],                      // 选中的商品
        ids_len: 0,                   // 选中的ids个数
        spec_ids: {                   // 规格id
            /*
             商品id: 规格id
             */
        },
        idarr: [/*gid:format*/],                      // 加入我的收藏使用
        carid: [],                                    // 加入收藏使用
        address: '',
        myCollectList: [],
        surplus_goldshells: 0, // 用户拥有的金贝数
        userInfo: {},
        sliverInfo: 0
    },

    onLoad: function () {
        this.getIconNum()
    },


    onShow: function () {

        this.init();
        app.clearStorageSync();
        app.getaddress((res) => {
            let address_json = res.address_component;
            this.setData({
                address: `${address_json.city}${address_json.district}`
            })
        });

    },

    onPullDownRefresh: function () {

        this.init();
        app.clearStorageSync();
        app.getaddress((res) => {
            let address_json = res.address_component;
            this.setData({
                address: `${address_json.city}${address_json.district}`
            })
        });
        wx.stopPullDownRefresh();

    },

    init: function () {

        let that = this.selectComponent("#loginBox");

        wx.showLoading();
        if (!wx.getStorageSync('token')) {

            if (that) {
                that.setData({
                    hidden: false
                });
            }
            wx.hideLoading();
            return;
        } else {
            if (that) {
                that.setData({
                    hidden: 'hidden'
                });
            }
        }

        let {cart_msg, category_logo_url, option, myCollect, ids_len, ids, store_ids, idarr, allCheck} = this.data;
        cart_msg = {};
        myCollect = {};

        allCheck = false;
        app.post('Car/carList', {}, (res) => {
            let {car_list, mycollect_list} = res.data;
            let carlist = car_list;
            let myclect = mycollect_list;

            for (let store of carlist) {
                if (!cart_msg[store.business_id]) {
                    cart_msg[store.business_id] = {
                        business_id: store.business_id,
                        business_name: store.business_name,
                        goods_info: {}
                    }
                }

                let goods_info = cart_msg[store.business_id].goods_info;

                for (let goods of store.goods_info) {
                    if (!goods_info[goods.cid]) {
                        goods_info[goods.cid] = goods;
                    }
                }
            }

            category_logo_url = res.category_logo_url;
            (Object.keys(cart_msg).length > 0) && (option != 'edit') && (option = 'shopcart');
            this.setData({
                cart_msg,
                category_logo_url,
                option,
                myCollect,
                allCheck,
                spec_ids: {},
                ids_len: 0,
                ids: [],
                store_ids: [],
                idarr: []
            });

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        });

        this.attached();

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);

    },

    attached: function () {

        let _this = this;
        app.post('Car/myCollectList', {
            opt: 'goods',
            page: 1
        }, (res) => {
            if (res.code == 200) {
                this.setData({
                    myCollectList: res.data.list.slice(0, 4)
                })
            }
        })

    },

    changeNum: function (e) {

        let {cid, num, store_id} = e.currentTarget.dataset;
        let {cart_msg} = this.data;
        let goods = cart_msg[store_id].goods_info[cid];

        goods.num += +num;
        goods.num <= 1 && (goods.num = 1);
        app.post('Car/modifynum', {
            gid: goods.gid,
            format: goods.format,
            num: goods.num,
            cid: goods.cid
        }, (res) => {
            if (res.code == 200) {
                this.dealIds();
            }
        })

    },

    // 编辑商品
    switchPage: function (e) {

        let {option, store_ids, ids} = this.data;
        option = (option == 'shopcart' ? 'edit' : 'shopcart');

        this.data.option = option;
        this.init();
        this.setData({
            store_ids,
            ids,
            option
        });
        this.dealIds();

    },

    // 去结算
    pay: function (e) {

        let {ids, cart_msg, store_ids, spec_ids} = this.data;
        if (!ids.length) return app.alert('未选择商品', 'none');
        let param = [];
        for (let key in cart_msg) {
            let store = cart_msg[key].goods_info;
            for (let key1 in store) {
                let goods = store[key1];
                if (spec_ids[goods.cid]) {
                    param.push({
                        goods_id: goods.goods_id,
                        spec_id: goods.spec_id,
                        num: goods.num,
                        cid: goods.cid,
                        is_active: goods.is_activity
                    })
                }
            }
        }

        let ginfo = {
            is_use_gold: 1,
            is_use_balance: 0,
            param
        };
        app.setStorageSync({
            ginfo
        });
        app.openPage('shopCart/order/order')

    },

    /**
     * 根据店铺id和商品id  决定那些checkbox需要选中
     */
    dealIds: function () {

        let {cart_msg, store_ids, ids, allCheck, pay, ids_len, idarr} = this.data;
        pay.silver_num = 0;
        pay.get_goldshells = 0;
        pay.price = 0;
        idarr = [];

        for (let storeKey in cart_msg) {
            let store = cart_msg[storeKey];
            store.checked = store_ids.indexOf(store.business_id) > -1 ? true : false;
            for (let goodsKey in store.goods_info) {
                let goods = store.goods_info[goodsKey];
                if (ids.indexOf(goods.cid) > -1) {
                    goods.checked = true;

                    idarr.push(`${goods.goods_id}:${goods.spec_id}`)
                    // 计算价格
                    if (goods.is_show && goods.is_activity) { // 活动商品
                        if (goods.payment == 1) { // 现金
                            pay.price += goods.price * goods.num;
                            pay.get_goldshells += +goods.base_return * goods.num;
                        } else if (goods.payment == 2) {  // 金贝 + 铜贝
                            pay.gold_price += +goods.gold_price * goods.num;
                            pay.copper_price += +goods.copper_price * goods.num;
                        } else if (goods.payment == 3) { // 银贝
                            pay.silver_num += +goods.price * goods.num;
                        }
                    } else {  // 非活动商品
                        if (goods.type == -1) { // 现金
                            pay.price += +goods.sale_price * goods.num;
                            pay.get_goldshells += +goods.base_return * goods.num;
                        } else {  // 银贝
                            pay.silver_num += +goods.silver_price * goods.num;
                        }
                    }
                } else {
                    goods.checked = false;
                }
            }
        }

        pay.price = pay.price / 100;
        pay.silver_num = pay.silver_num || 0;
        pay.get_goldshells = pay.get_goldshells || 0;
        pay.copper_price = pay.copper_price || 0;
        pay.gold_price = pay.gold_price || 0;
        // 底部全选
        allCheck = store_ids.length >= Object.keys(cart_msg).length ? true : false;
        ids_len = ids.length;
        this.setData({
            cart_msg,
            allCheck,
            pay,
            ids_len,
            idarr
        })

    },

    // 商户全选
    checkAll: function (e) {

        let {ids, store_ids, cart_msg, spec_ids} = this.data;
        ids = JSON.parse(JSON.stringify(ids));
        store_ids = JSON.parse(JSON.stringify(store_ids));
        spec_ids = JSON.parse(JSON.stringify(spec_ids));

        let storeId = e.currentTarget.dataset.store_id;   // 商户id
        let len = e.detail.value.length;

        let goods_info = cart_msg[storeId].goods_info;

        len ? store_ids.push(storeId) : (store_ids = app.arrayRemove(store_ids, storeId));
        for (let key in goods_info) {
            let goods = goods_info[key];
            if (len) {
                ids.push(goods.cid);
                spec_ids[goods.cid] = goods.spec_id;
            } else {
                ids = app.arrayRemove(ids, goods.cid);
                delete spec_ids[goods.cid];
            }
        }

        this.data.store_ids = store_ids;
        this.data.ids = ids;
        this.data.spec_ids = spec_ids;
        this.dealIds();

    },

    // 单个选择
    checked: function (e) {

        let {cart_msg, spec_ids} = this.data;
        var ids = this.data.ids.length == 0 ? [] : this.data.ids;
        var store_ids = this.data.store_ids.length == 0 ? [] : this.data.store_ids;
        let {store_id, goods_id, spec_id} = e.currentTarget.dataset;   // 商户id
        if (e.detail.value.length) {
            ids.push(goods_id);
            spec_ids[goods_id] = spec_id;
        } else {
            ids = app.arrayRemove(ids, goods_id);
            delete spec_ids[goods_id]
        }

        let goods_info = cart_msg[store_id].goods_info;

        for (let key in goods_info) {
            let goods = goods_info[key];
            if (ids.indexOf(goods.cid) <= -1) {
                store_ids = app.arrayRemove(store_ids, store_id);
                break;
            } else {
                store_ids.indexOf(store_id) <= -1 && store_ids.push(store_id);
            }
        }

        this.data.store_ids = store_ids;
        this.data.ids = ids;
        this.data.spec_ids = spec_ids;
        this.dealIds();

    },

    // 底部全选
    check: function (e) {

        let {cart_msg, store_ids, ids, spec_ids} = this.data;
        store_ids = [];
        ids = [];
        spec_ids = {};

        if (e.detail.value.length) {
            for (let storeKey in cart_msg) {
                let store = cart_msg[storeKey];
                store_ids.push(store.business_id);
                for (let goodsKey in store.goods_info) {
                    ids.push(store.goods_info[goodsKey].cid);
                    spec_ids[store.goods_info[goodsKey].cid] = store.goods_info[goodsKey].spec_id;
                }
            }
        }

        this.data.store_ids = store_ids;
        this.data.ids = ids;
        this.data.spec_ids = spec_ids;
        this.dealIds();

    },

    // 购物车删除
    deleteCart: function () {

        let {ids, ids_len} = this.data;
        let _this = this;
        app.confirm(`确认删除已选中的${ids_len}件商品`, function (e) {
            if (!e) {  // 确认
                app.post('Car/delCarGoodsById', {
                    cidarr: ids
                }, (res) => {
                    if (res.code == 200) {
                        app.alert('删除成功', 'success', () => {
                            _this.init();
                        });

                    }
                })
            }
        })

    },

    // 移入收藏夹
    joinCollect: function (e) {

        let {idarr, ids_len, ids} = this.data;
        let _this = this;
        app.confirm(`确认收藏已选中的${ids_len}件商品`, function (e) {
            if (!e) {  // 确认
                app.post('Car/addmycollect', {
                    carid: ids,
                    opt: 'goods',
                    idarr
                }, (res) => {
                    if (res.code == 200) {
                        app.alert('添加收藏成功', 'success', () => {
                            _this.init();
                        });
                    }
                })
            }
        })

    },

    openPageCollect: function (e) {
        let { gid, type } = e.currentTarget.dataset;
        app.openPage(`shopCart/goodsDetail/goodsDetail?gid=${gid}&type=${type}`);
    },

    /**
     * 登录成功回执
     */
    loginevent: function () {
        // this.init();
    },

    /**
     * 获取金贝银贝数量
     */
    getIconNum() {
        app.post('User/detial', {}, (res) => {
            if (res.data.length != 0) {
                this.setData({
                    userInfo: res.data.user_info,
                    sliverInfo: res.data.user_info.surplus_silvershells + res.data.user_info.surplus_business_silvershells,
                    surplus_goldshells: res.data.user_info.surplus_goldshells
                })
            }
        });

    }

});
