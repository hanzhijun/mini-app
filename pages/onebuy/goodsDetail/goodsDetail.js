const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        loading: 0, // loading加载提示框
        toast: 0, // 提示文字
        title: '一元购',
        toastTxt: '',
        imgs_url: [],
        id: "",
        goods: {},
        goodsInfo: {},
        height: app.config.height,
        toPage: 'goods', //  滚动到哪里
        tabType: 'goods',
        // 规格json
        spec: {
            first: {}, // id1: value
            second: {} // id2: value
        },
        // 当前选中的
        current_info: {
            first_attr_id: 0,
            second_attr_id: 0,
            first_attr_name: '',
            second_attr_name: '',
            base_return: 0,               // 返回金贝
            sale_price: 0,                // 价格
            silver_price: 0,              // 银贝价格
            copper_price: 0,              // 铜贝
            gold_price: 0,                // 金贝价格 活动商品使用
            nums: 0,                      // 库存
            spec_id: 0,                   // 规格id
            num: 1                        // 选择数量
        },
        buy_limit: '',
        bought: 0,
        is_active: 0,     // 判断是否是活动商品 1：是 0：不是
        // 规格
        sepc_id_info: {},
        surplus_goldshells: 0,
        hasFavorable: 0, // 是否已获得摇奖优惠 0 没有 1 有
        game_dice_record_id: '', // 记录id
        game_dice_record_status: '', //  //状态 -1参与者; 0-已结束  1-进行中 2-未领取  3-已领取
        tcBox: 0, // 弹窗 0关闭 1规格 2分享 3查看我的抢购 4正在抢购中商品数量

        formId: '',
        oneBuy: 0, // 是否已发起一元购 0否 1是
        bindTelBack: 0, // // 判断是否为绑定手机页返回 0否 1是
        launch_id: '',
        shareTitle: '',
        shareDesc: '',
        sharePath: '',
        shareImg: '', // 分享图片
        need_num: '', // 需助力人数
        gid: 0, // 商品id
        eid: '', // 一元购商品id
        onebuy_status: '', // 商品状态 0 参与中 1 参与成功 2 已购买 3 已过期
        discount_price: '', // 优惠价格
        user_spec_id: '',
        list_url:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let {gid, need_num, eid} = options;
        this.setData({
            gid,
            need_num,
            eid
        });
    },

    onShow: function () {
        let {bindTelBack} = this.data;
        if (bindTelBack == 1) {
            this.launchOnpurse();
        } else {
            this.init()
        }
    },

    init: function () {

        this.getDetailsinfo();

        this.getIconNum();

    },

    clientgoodsdetail: function () {

        let {eid, onebuy_status = null} = this.data;
        app.post('/onebuy/clientgoodsdetail', {
            id: eid,
            getspec: 0
        }, (res) => {

            let {user_spec_id, spec_info, list_url} = res.data;
            let {spec, current_info} = this.data;
            this.setData({
                onebuy_status: res.data.onebuy_status == null ? -1 : res.data.onebuy_status,
                launch_id: res.data.help_id,
                discount_price: (res.data.discount_price / 100).toFixed(2),
                user_spec_id,
                list_url
            });

            if(user_spec_id) {
                for(var i=0; i<spec_info.length; i++) {
                    if(user_spec_id == spec_info[i].spec_id) {
                        current_info.first_attr_id = spec_info[i].first_attr_id;
                        current_info.first_attr_name = spec_info[i].first_attr_value;
                        current_info.second_attr_id = spec_info[i].second_attr_id;
                        current_info.second_attr_name = spec_info[i].second_attr_value;
                        current_info.spec_id = spec_info[i].spec_id
                    }
                }
                this.setData({
                    current_info
                })
            }

            if(res.data.onebuy_status == 0) {
                this.setData({
                    shareTitle: '只要你帮我点一下！我就可以一元抢购这个心仪已久的东西！',
                    shareDesc: '贝划算，开始划算生活',
                    sharePath: 'pages/onebuy/oneInfo/oneInfo?launch_id=' + res.data.help_id,
                    shareImg: this.data.imgUrl + '/' + list_url
                })
            }

        }, (res) => {
            console.log(JSON.stringify(res))
        })
    },

    getDetailsinfo: function () {
        let {is_active, gid, eid} = this.data;
        let _this = this;
        app.post('/goods/goods/detailsinfo', {
            gid
        }, (res) => {
            if (res.code == 200) {
                let goods = res.data;
                is_active = goods.goods_activity_id && goods.activity_status == 1 ? 1 : 0;
                let {spec_info} = res.data;
                let {spec, sepc_id_info, imgs_url, current_info} = this.data;
                imgs_url = goods.imgs_url;

                for (let s of spec_info) {
                    spec.first[s.first_attr_id] = s.first_attr_value;
                    spec.second[s.second_attr_id] = s.second_attr_value;
                    sepc_id_info[`${s.first_attr_id}-${s.second_attr_id}`] = s;
                }

                let s = sepc_id_info[Object.keys(sepc_id_info)[0]];
                current_info = {
                    first_attr_id: s.first_attr_id,
                    second_attr_id: s.second_attr_id,
                    first_attr_name: s.first_attr_value,
                    second_attr_name: s.second_attr_value,
                    spec_id: s.spec_id,
                    sale_price: is_active ? s.price : s.sale_price,
                    silver_price: is_active ? s.price : s.silver_price,
                    gold_price: s.gold_price || 0,
                    copper_price: s.copper_price || 0,
                    base_return: s.base_return,
                    nums: is_active ? s.activity_nums || 0 : s.nums || 0,
                    num: 1,
                    extra_gold: s.extra_gold
                };

                this.setData({
                    goods: res.data,
                    gid,
                    spec,
                    sepc_id_info,
                    imgs_url,
                    current_info,
                    is_active,
                    buy_limit: res.data.buy_limit
                });

                if (res.data.buy_limit > 0) {
                    this.setData({
                        bought: res.data.bought
                    });
                }

                setTimeout(function () {
                    wx.hideLoading();
                }, 300);

                this.setData({
                    shareTitle: _this.data.goods.goods_name,
                    shareDesc: '贝划算，开始划算生活',
                    sharePath: '/pages/onebuy/goodsDetail/goodsDetail?gid=' + _this.data.gid + '&need_num=' + _this.data.need_num + '&eid=' + eid,
                    shareImg: _this.data.imgUrl + '/' + _this.data.list_url
                });

                this.clientgoodsdetail();

            } else if (res.code == 402) {
                app.alert(res.info, 'none');
                setTimeout(function () {
                    _this.goBack();
                }, 3000);
            } else {
                app.alert(res.info, 'none');
            }
        });
    },

    openPage: function () {

        wx.switchTab({
            url: '/pages/shopCart/shopCart',
            success: function (e) {
                var page = getCurrentPages().pop();
                if (page == undefined || page == null) return;
                page.onLoad();
            }
        })

    },

    switchPage: function (e) {

        this.setData({
            toPage: e.currentTarget.dataset.type
        })

    },

    // 数量操作
    checkNumber: function (e) {

        app.showToast(this, '活动商品每人限购一件');
        return;

        let {type} = e.currentTarget.dataset;
        let {current_info, goods} = this.data;
        if (this.data.buy_limit > 0) {
            if ((this.data.buy_limit - this.data.bought) <= current_info.num) {
                app.alert(' 您已达到购买上限~', 'none');
                return;
            }
        }
        current_info.num += +type;
        if (current_info.num > +current_info.nums) return current_info.num = +current_info.nums;
        else if (current_info.num < 1) return current_info.num = 1;

        this.setData({
            current_info
        })

    },

    // 选择规格
    checkSpec: function (e) {

        let {first_attr_id, second_attr_id, first_attr_name, second_attr_name} = e.currentTarget.dataset;
        let {current_info, sepc_id_info, is_active, goods} = this.data;

        first_attr_id && (current_info.first_attr_id = first_attr_id);
        second_attr_id && (current_info.second_attr_id = second_attr_id);
        first_attr_name && (current_info.first_attr_name = first_attr_name);
        second_attr_name && (current_info.second_attr_name = second_attr_name);

        // 得到规格key
        let id = `${current_info.first_attr_id}-${current_info.second_attr_id}`;

        try {
            let info = sepc_id_info[id];
            // 初始化
            current_info.spec_id = info.spec_id;
            current_info.num = 1;
            if (is_active) {  // 活动商品
                current_info.nums = +info.activity_nums;
                if (goods.payment == 1) {   // 金贝+现金
                    current_info.sale_price = info.price;
                } else if (goods.payment == 2) { // 金贝+铜贝
                    current_info.gold_price = info.gold_price;
                    current_info.copper_price = info.copper_price;
                } else if (goods.payment == 3) { // 银贝
                    current_info.silver_price = info.price
                }
            } else {
                current_info.sale_price = info.sale_price;
                current_info.silver_price = info.silver_price;
                current_info.base_return = info.base_return;
                current_info.nums = +info.nums;
            }
            current_info.extra_gold = +info.extra_gold
        } catch (e) {

        }
        this.setData({
            current_info
        });

    },

    pay: function () {

        let {current_info, gid, is_active} = this.data;
        if (!current_info.first_attr_id || !current_info.second_attr_id) {
            return app.alert('请选择规格！', 'none');
        } else if (!current_info.nums) {
            return app.alert('库存不足！', 'none');
        } else if (!gid || !current_info.spec_id) {
            return app.alert('请选择规格！', 'none');
        }

        let json = {
            is_use_gold: 1,
            is_use_balance: 0
        };

        let spec_json = {
            goods_id: gid,
            spec_id: current_info.spec_id,
            num: current_info.num,
            is_active,
            cid: 0
        };

        json.param = [spec_json];
        json.share = 0;

        app.setStorageSync({
            ginfo: json
        });

        app.openPage(`onebuy/order/order?gid=${gid}`);

    },

    //滚动监听
    scroll: function (e) {

        if (e.detail.scrollTop > 630) {
            this.setData({
                tabType: 'msg'
            });
        } else {
            this.setData({
                tabType: 'goods'
            });
        }

    },

    goBack: function () {

        wx.switchTab({
            url: '/pages/index/index'
        });

    },

    /**
     * 获取金贝银贝数量
     */
    getIconNum(){

        app.post('Dispatch/getUsergold', {}, (res) => {
            if (res.code = 200) {
                this.setData({
                    surplus_goldshells: res.data.gold
                })
            }
        });

    },

    gotoYao: function () {

        let {id, game_dice_record_id} = this.data;
        wx.navigateTo({
            url: '/pages/game/yao/yao?id=' + id + "&dice_record_id=" + game_dice_record_id
        });

    },

    imageLoad: function () {

    },

    loginevent: function () {

        setTimeout(() => {
            this.init();
        }, 1000)

    },

    /**
     * 发起活动
     * @param e
     */
    launchOnpurse(e) {

        let {current_info, bindTelBack, formId, gid, need_num, goods, imgUrl, list_url} = this.data;
        if (bindTelBack == 0) {
            formId = e.detail.formId;
            this.setData({
                formId
            })
        }
        this.setData({
            bindTelBack: 0
        });
        let _this = this;
        app.post('onebuy/launchOnpurse', {
            produc_id: gid,
            spec_id: current_info.spec_id,
            form_id: formId,
            num: 1,
            need_num: need_num,
            produc_name: goods.goods_name
        }, (res) => {
            if (res.code == 200) {
                this.setData({
                    launch_id: res.data.onpurse_id,
                    tcBox: 2,
                    oneBuy: 1,
                    shareTitle: '只要你帮我点一下！我就可以一元抢购这个心仪已久的东西！',
                    shareDesc: '贝划算，开始划算生活',
                    sharePath: 'pages/onebuy/oneInfo/oneInfo?launch_id=' + res.data.onpurse_id,
                    shareImg: imgUrl + '/' + list_url,
                    onebuy_status: 0
                })
            } else if (res.info == '未绑定手机号') {
                app.openPage('mine/accoutManage/bindTel/bindTel?history=onebuy')
            } else if(res.code == 402) {
                app.showToast(_this, res.info)
            } else {
                console.log(res.info)
            }
            this.setData({
                loading: 0
            })
        })
    },
    /**
     * 关闭弹窗
     */
    closeSpecBox() {
        this.setData({
            tcBox: 0
        })
    },
    /**
     * 邀请好友助力
     */
    btnShare: function () {
        let _this = this;
        setTimeout(function () {
            _this.setData({
                tcBox: 3
            })
        }, 500);
    },
    /**
     * 立即查看我的抢购
     */
    lookMyBuy: function () {
        this.setData({
            tcBox: 0
        });
        wx.redirectTo({
            url: '/pages/onebuy/oneInfo/oneInfo?launch_id=' + this.data.launch_id
        })
    },
    /**
     * 分享
     * @param res
     * @returns {{title: string, desc: string, path: string, imageUrl: string}}
     */
    onShareAppMessage: function (res) {

        let {shareTitle, shareDesc, sharePath, shareImg} = this.data;
        if (res.from === 'button') {
        }
        return {
            title: shareTitle,
            desc: shareDesc,
            path: sharePath,
            imageUrl: shareImg
        }

    },
    /**
     * 底部按钮操作
     * @param e
     */
    listClick(e) {

        let {onebuy_status} = e.currentTarget.dataset;
        if (onebuy_status == 0) {
            let {launch_id} = this.data;
            app.openPage('onebuy/oneInfo/oneInfo?launch_id=' + launch_id)
        } else {
            let {gid, current_info} = this.data;
            if (current_info.nums <= 0) {
                app.showToast(this, '库存不足，正在备货中...');
                return;
            }
            let json = {
                is_use_gold: 1,
                is_use_balance: 0
            };
            let spec_json = {
                goods_id: gid,
                spec_id: current_info.spec_id,
                num: 1,
                is_active: 0,
                cid: 0
            };
            json.param = [spec_json];
            json.share = 0;
            app.setStorageSync({
                ginfo: json
            });
            app.openPage(`onebuy/order/order?gid=${gid}`);
        }

    }
});