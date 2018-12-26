const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        host: app.config.host,
        loading: 1, // loading加载提示框
        toast: 0, // 提示文字
        title: '刮一刮记录',
        toastTxt: '',
        res_data: [],
        game_host: app.config.game_host, //活动图片地址
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {},
    onShow() {
        this.init()
    },
    init() {
        this.setData({
            res_data: [],
            loading: 1
        });
        this.getList()
    },
    getList() {
        let {res_data} = this.data;
        app.post('game/getmyscratchersreward', {}, (res) => {
            if (res.code == 200) {
                for (let val of res.data) {
                    val.create_at_format = new Date(val.create_at * 1000).format('yyyy-MM-dd hh:mm');
                    res_data.push(val);
                }
                this.setData({
                    res_data
                })
            }
            this.setData({
                loading: 0
            })
        })
    },
    /**
     * 去使用
     * @param e
     */
    gotoUse: function (e) {
        let {spec_id, goods_id, type} = e.currentTarget.dataset;
        if (type == 2) return;
        let json = {
            is_use_gold: 1,
            is_use_balance: 0
        };
        let spec_json = {
            goods_id: goods_id,
            spec_id: spec_id,
            num: 1,
            is_active: 0,
            cid: '',
            order_id: ''
        };
        json.param = [spec_json];
        app.setStorageSync({
            ginfo: json
        });
        app.openPage(`game/order/order?goods_id=${goods_id}`)
    },
    /**
     * 立即领取
     * @param e
     */
    receive: function (e) {
        let {record_id, index, type} = e.currentTarget.dataset;
        if (type == 2) return;
        this.setData({
            lingIndex: index
        });
        let _this = this;
        app.post('game/receivescratchersreward', {
            record_id: record_id
        }, () => {
            let {lingIndex} = _this.data;
            let {res_data} = _this.data;
            let newData = [];
            for (var i = 0; i < res_data.length; i++) {
                if (i == lingIndex) {
                    var obj = {
                        scratchcards_goods_name: res_data[i].scratchcards_goods_name,
                        scratchcards_img: res_data[i].scratchcards_img,
                        scratchcards_goods_type: res_data[i].scratchcards_goods_type,
                        goods_id: res_data[i].goods_id,
                        reward_id: res_data[i].reward_id,
                        record_id: res_data[i].record_id,
                        status: 2,
                        create_at: res_data[i].create_at,
                        scratchcards_img_path: res_data[i].scratchcards_img_path,
                        spec_id: res_data[i].spec_id,
                        create_at_format: res_data[i].create_at_format
                    };
                    newData.push(obj)
                } else {
                    newData.push(res_data[i])
                }
            }
            _this.setData({
                res_data: newData
            });
            wx.showToast({
                title: '已领取',
                icon: 'success',
                duration: 3000
            });
        });
    }
});