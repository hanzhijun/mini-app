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
        img_path: '',
        oneList: [],
        // 当前操作的商品信息
        overGoodsInfo: {
            goods_id: '', // 产品id
            need_num: '', // 需助力人数
            produc_name: '', // 产品名称
            price: '',
            discount_price: ''
        },
        tcBox: 0, // 弹窗 0关闭 1规格 2分享 3查看我的抢购 4正在抢购中商品数量
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
            base_return: 0,
            sale_price: 0,
            silver_price: 0,
            copper_price: 0,
            gold_price: 0,
            nums: 0,
            spec_id: 0,
            num: 1
        },
        sepc_id_info: {},
        imgs_url: '',
        bindTelBack: 0, // 判断是否为绑定手机页返回 0否 1是
        formId: '',
        launch_id: '',
        oneBuyNum: '', // 正在抢购中的活动商品数量
        firstLoad: 0,
        shareImageUrl: '' // 分享使用图片
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
    },
    onShow() {

        let {bindTelBack} = this.data;
        if (bindTelBack == 1) {
            this.launchOnpurse();
        } else {
            this.init()
        }
    },
    /**
     * 页面初始化
     */
    init() {
        this.setData({
            loading: 1
        });
        this.clientgoodslist('init')
    },
    /**
     * 获取活动商品数据
     */
    clientgoodslist(state) {
        app.post('onebuy/clientgoodslist', {}, (res) => {
            if (res.code == 200) {
                let {img_path, data, oneBuyNum = 0, newData=[]} = res.data;
                for(var i=0; i<data.length; i++) {
                    if(data[i].status == 0) {
                        oneBuyNum += 1
                    }
                    let obj = data[i];
                    if (data[i].success_expiry_time == null) {
                        obj['end_time'] = null
                    } else {
                        let d = new Date(data[i].success_expiry_time * 1000).format('dd') * 1;
                        let d2 = new Date().getDate();
                        if(d == d2 + 1) {
                            obj['end_time'] = '次日' + new Date(data[i].success_expiry_time * 1000).format('hh:mm') + '后失效'
                        } else if (d == d2) {
                            obj['end_time'] = new Date(data[i].success_expiry_time * 1000).format('hh:mm') + '后失效'
                        } else {
                            obj['end_time'] = new Date(data[i].success_expiry_time * 1000).format('yyyy-MM-dd hh:mm') + '失效'
                        }
                    }
                    newData.push(obj);
                }
                if (oneBuyNum > 0 && this.data.firstLoad == 0) {
                    this.setData({
                        tcBox: 4
                    });
                }
                this.setData({
                    img_path,
                    oneList: newData,
                    oneBuyNum,
                    firstLoad: 1
                });
            } else {
                console.log(res.info)
            }
            this.setData({
                loading: 0
            })
        })
    },
    /**
     * 商品整体区域触发
     * @param e
     * status状态 0参与中 1参与成功 2已购买，3已过期 null未参与
     */
    listClick(e) {
        let {status, goods_id, produc_name, price, need_num, spec_id, help_id, eid} = e.currentTarget.dataset;
        if (status == 0) { // 状态 0参与中(跳抢购页面)
            app.openPage('onebuy/oneInfo/oneInfo?launch_id=' + help_id)
        } else if (status == 1) { // 1参与成功(跳订单)

            let json = {
                is_use_gold: 1,
                is_use_balance: 0
            };
            let spec_json = {
                goods_id,
                spec_id,
                num: 1,
                is_active: 0,
                cid: 0
            };
            json.param = [spec_json];
            json.share = 0;
            app.setStorageSync({
                ginfo: json
            });
            app.openPage(`onebuy/order/order?gid=${goods_id}`);

        } else {
            app.openPage('onebuy/goodsDetail/goodsDetail?gid=' + goods_id + '&need_num=' + need_num + '&eid=' + eid)
        }
    },
    /**
     * 按钮区域触发
     * @param e
     */
    listClickBtn(e) {
        let {goods_id, need_num, produc_name, price, list_url, discount_price} = e.currentTarget.dataset;
        this.setData({
            overGoodsInfo: {
                goods_id,
                need_num,
                produc_name,
                price,
                discount_price
            },
            shareImageUrl: this.data.img_path + list_url
        });
        this.detailsinfo(goods_id)
    },
    /**
     * 发起活动
     * @param e
     */
    launchOnpurse(e) {

        let {overGoodsInfo, current_info, bindTelBack, formId} = this.data;
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
            produc_id: overGoodsInfo.goods_id,
            spec_id: current_info.spec_id,
            form_id: formId,
            num: 1,
            need_num: overGoodsInfo.need_num,
            produc_name: overGoodsInfo.produc_name
        }, (res) => {
            if (res.code == 200) {
                this.setData({
                    launch_id: res.data.onpurse_id,
                    tcBox: 2
                });
                this.clientgoodslist()
            } else if (res.info == '未绑定手机号') {
                app.openPage('mine/accoutManage/bindTel/bindTel?history=onebuy')
            } else if(res.code == 402) {
                // console.log(res.info)
                app.showToast(_this, res.info)
            }
            this.setData({
                loading: 0
            })
        })
    },
    /**
     * 获取活动商品规格数据
     * @param id
     */
    detailsinfo(id) {
        let _this = this;
        app.post('goods/goods/detailsinfo', {
            gid: id
        }, (res) => {
            if (res.code == 200) {

                _this.setData({
                    spec: {
                        first: {},
                        second: {}
                    },
                    current_info: {
                        first_attr_id: 0,
                        second_attr_id: 0,
                        first_attr_name: '',
                        second_attr_name: '',
                        base_return: 0,
                        sale_price: 0,
                        silver_price: 0,
                        copper_price: 0,
                        gold_price: 0,
                        nums: 0,
                        spec_id: 0,
                        num: 1
                    },
                    sepc_id_info: {}
                });
                let goods = res.data;
                let {spec_info} = res.data;
                let {spec, sepc_id_info, current_info} = _this.data;

                for (let s of spec_info) {
                    spec.first[s.first_attr_id] = s.first_attr_value;
                    spec.second[s.second_attr_id] = s.second_attr_value;
                    sepc_id_info[s.first_attr_id + '-' + s.second_attr_id] = s;
                }

                let s = sepc_id_info[Object.keys(sepc_id_info)[0]];
                current_info = {
                    first_attr_id: s.first_attr_id,
                    second_attr_id: s.second_attr_id,
                    first_attr_name: s.first_attr_value,
                    second_attr_name: s.second_attr_value,
                    spec_id: s.spec_id,
                    gold_price: s.gold_price || 0,
                    copper_price: s.copper_price || 0,
                    base_return: s.base_return,
                    num: 1,
                    extra_gold: s.extra_gold
                };

                this.setData({
                    goods: res.data,
                    spec,
                    sepc_id_info,
                    current_info,
                    tcBox: 1
                });
            }
            this.setData({
                loading: 0
            })
        })
    },
    /**
     * 选择规格
     * @param e
     */
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
    /**
     * 关闭弹窗
     */
    closeSpecBox() {
        this.setData({
            tcBox: 0
        })
    },

    gotoHome() {
      wx.switchTab({
        url: '/pages/index/index'
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
        app.openPage('onebuy/oneInfo/oneInfo?launch_id=' + this.data.launch_id)
    },
    /**
     * 分享
     * @param res
     */
    onShareAppMessage: function (res) {
        if (res.from === 'button') {}
        let {launch_id, shareImageUrl} = this.data;
        return {
            title: '只要你帮我点一下！我就可以一元抢购这个心仪已久的东西！',
            path: 'pages/onebuy/oneInfo/oneInfo?launch_id=' + launch_id,
            imageUrl: shareImageUrl,
            success: function () {}
        }
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.setData({
            bindTelBack: 0,
            tcBox: 0
        });
        this.init();
        wx.stopPullDownRefresh();
    },
    /**
     * 登录成功回执
     */
    loginevent: function () {
        this.setData({
            bindTelBack: 0
        });
        this.init();
    }
});