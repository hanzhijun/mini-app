// pages/game/myYaoRecord/myYaoRecord.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        host: app.config.host,
        loading: 1, // loading加载提示框
        toast: 0, // 提示文字
        title: '我的摇一摇',
        toastTxt: '',
        total: 1, // 总条数
        per_page: 20, // 每页显示
        current_page: 0, // 当前页码
        last_page: '', // 最大页码
        data: [],
        status: 1, // 状态 0-已结束 1-进行中 2-未领取 3-已领取 默认1

        userInfo: "",
        sliverInfo: "",
        surplus_goldshells: "",

        imgUrl: app.config.host + '/upload/game/',
        lingIndex: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        this.init();
        this.getIconNum();
    },
    /**
     * 页面初始化
     */
    init: function () {
        this.setData({
            total: 1,
            per_page: 20,
            current_page: 0,
            last_page: 1,
            data: [],
            status: 1,
            loading: 1
        });
        this.getdicelist();
    },
    /**
     * 切换标签
     * @param e
     */
    navClick: function (e) {
        let {state} = e.currentTarget.dataset;
        let {status} = this.data;
        if (state == status) return;
        this.setData({
            total: 1,
            per_page: 20,
            current_page: 0,
            last_page: 1,
            data: [],
            status: state,
            loading: 1
        });
        this.getdicelist();
    },
    /**
     * 获取我的摇骰子列表
     * status 状态 0-已结束 1-进行中 2-未领取 3-已领取 默认1
     */
    getdicelist: function () {
        let {current_page, last_page, status} = this.data;
        if (current_page >= last_page) return;
        var _this = this;
        app.post('/game/getdicelist', {
            status,
            page: current_page + 1
        }, (res) => {
            if (res.code == 200) {
                let {total, per_page, current_page, last_page, data} = res.data;
                let thisData = _this.data.data;
                for (var i = 0; i < data.length; i++) {
                    thisData.push(data[i]);
                }
                _this.setData({
                    total,
                    per_page,
                    current_page,
                    last_page,
                    data: thisData
                });
            }
            _this.setData({
                loading: 0
            });
        });
    },
    /**
     * 领取摇骰子奖励
     * @param e
     */
    getdicereward: function (e) {
        let {diceid, index} = e.currentTarget.dataset;
        this.setData({
            lingIndex: index,
            loading: 1
        });
        var _this = this;
        app.post('/game/getdicereward', {
            dice_record_id: diceid
        }, (res) => {
            if (res.code == 200) {
                let {lingIndex} = _this.data;
                let {data} = _this.data;
                let newData = [];
                for (var i = 0; i < data.length; i++) {
                    if (i == lingIndex) {
                        var obj = {
                            game_dice_record_id: data[i].game_dice_record_id,
                            reward_id: data[i].reward_id,
                            goods_id: data[i].goods_id,
                            game_num: data[i].game_num,
                            first_num: data[i].first_num,
                            second_num: data[i].second_num,
                            game_won: data[i].game_won,
                            status: 3,
                            create_at: data[i].create_at,
                            benefit_info: data[i].benefit_info,
                            goods_info: data[i].goods_info
                        };
                        newData.push(obj)

                    } else {
                        newData.push(data[i])
                    }
                }
                _this.setData({
                    data: newData
                });
            }
            _this.setData({
                loading: 0
            })
        });
    },
    /**
     * 去摇摇首页
     * @param e
     */
    gotoPk: function (e) {
        let {id, diceid} = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/game/yao/yao?id=${id}&dice_record_id=${diceid}`
        });
    },
    /**
     * 去详情
     * @param e
     */
    gotoDetail: function (e) {
        let {id, goodsid} = e.currentTarget.dataset;
        wx.navigateTo({
            url: '/pages/game/goodsDetail/goodsDetail?id=' + id + '&gid=' + goodsid
        });
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        console.log("触底事件");
        let {current_page, last_page} = this.data;
        if (current_page >= last_page) return;
        this.getdicelist();
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
    }
});