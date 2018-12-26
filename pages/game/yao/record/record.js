// pages/game/yao/record/record.js
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        host: app.config.host,
        loading: 1, // loading加载提示框
        toast: 0, // 提示文字
        title: '摇骰子PK记录',
        toastTxt: '',
        game_host: app.config.game_host, //活动图片地址
        id: '',
        dice_record_id: '',
        total: 0,
        per_page: 20,
        current_page: 0,
        last_page: 1,
        isGetting: 0, // 是否正在请求数据 0 没有 1 正在
        pkList: [],
        goodsInfo: [],
        minute: -1,
        second: -1,
        benefit_type: '',
        benefit_name: '',
        benefit_value: '',
        benefit_level: '',
        timer: '',
        timer2: '',
        pageShow: 0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let {dice_record_id} = options;
        this.setData({
            dice_record_id
        });
    },
    onShow: function () {
        this.setData({
            pkList: [],
            total: 0,
            per_page: 20,
            current_page: 0,
            last_page: 1,
            isGetting: 0,
            loading: 1
        });
        this.getpkrecord();
        this.getdiceshareinfo(); // 首次查询
    },
    /**
     * 获取商品详情
     * @param id
     */
    getGoodsdetail: function (id) {
        var _this = this;
        app.post('/game/clientgoodsdetail', {
            id
        }, (res) => {
            if (res.code == 200) {
                _this.setData({
                    goodsInfo: res.data[id]
                });
                _this.getbenefit();
            } else {
                console.log(res.info);
                _this.setData({
                    loading: 0
                })
            }
        });
    },
    /**
     * 获取摇一摇详细信息
     */
    getdiceshareinfo: function () {
        let {dice_record_id} = this.data;
        var _this = this;
        app.post('/game/getdiceshareinfo', {
            dice_record_id
        }, (res) => {
            if (res.code == 200) {
                let {sponsor_record} = res.data;
                _this.setData({
                    sponsor_record
                });
                _this.getGoodsdetail(sponsor_record.reward_id);
                _this.lunXunTime();
                _this.setData({
                    pageShow: 1
                });

            } else {
                console.log(res.info);
                _this.setData({
                    loading: 0
                })
            }
        });
    },
    /**
     * 获取PK记录
     */
    getpkrecord: function () {
        let {dice_record_id, current_page, isGetting} = this.data;
        if (!dice_record_id) return;
        if (isGetting == 1) return;
        let _this = this;
        this.data.isGetting = 1;
        app.post('/game/getpkrecord', {
            dice_record_id,
            current_page: current_page + 1
        }, (res) => {
            if (res.code == 200) {
                let {total, current_page, last_page, data} = res.data;
                let {pkList} = _this.data;
                for (var i = 0; i < data.length; i++) {
                    pkList.push(data[i])
                }
                _this.setData({
                    total,
                    current_page,
                    last_page,
                    pkList,
                    isGetting: 0
                });
            } else {
                _this.setData({
                    isGetting: 0,
                    loading: 0
                });
            }
        });
    },
    /**
     * 计算游戏局剩余时间
     */
    lunXunTime: function () {
        let _this = this;
        clearInterval(_this.data.timer);
        _this.data.timer = setInterval(function () {
            let timestamp = Date.parse(new Date()) / 1000;
            let laveTime = _this.data.sponsor_record.create_at * 1 + 600;

            if (laveTime == '' || laveTime < timestamp) {
                _this.setData({
                    minute: '',
                    second: ''
                });
                clearInterval(_this.data.timer);
            } else {
                let second = (laveTime - timestamp) % 60;
                if (second * 1 < 10) {
                    second = '0' + second;
                }
                _this.setData({
                    minute: Math.floor((laveTime - timestamp) / 60),
                    second
                });
            }
        }, 1000);
    },
    /**
     * 获取优惠详情
     */
    getbenefit: function () {
        let {goodsInfo, sponsor_record} = this.data;
        if (sponsor_record.game_won > 0) {
            let level = sponsor_record.game_won > 4 ? 5 : sponsor_record.game_won;
            let list = goodsInfo.benefit_info[level];
            this.setData({
                benefit_type: list.benefit_type,
                benefit_name: list.name,
                benefit_value: list.benefit_value,
                benefit_level: list.benefit_level
            });
        }
        this.setData({
            loading: 0
        });
    },
    /**
     * 领取摇骰子奖励
     */
    getdicereward: function () {
        this.setData({
            loading: 1
        });
        let {dice_record_id, sponsor_record} = this.data;
        if (sponsor_record.status == 3) return;
        var _this = this;
        app.post('/game/getdicereward', {
            dice_record_id
        }, (res) => {
            if (res.code == 200) {
                _this.data.sponsor_record.status = 3;
                let {reward_id, goods_id, share_dice_id, result, game_num, first_num, second_num, game_won, open_id, form_id, create_at, cur_winning_streak} = _this.data.sponsor_record;
                let obj = {
                    reward_id,
                    goods_id,
                    share_dice_id,
                    result,
                    game_num,
                    first_num,
                    second_num,
                    game_won,
                    open_id,
                    form_id,
                    status: 3,
                    create_at,
                    cur_winning_streak
                };
                _this.setData({
                    sponsor_record: obj
                });
            } else {
                console.log(res.info);
            }
            _this.setData({
                isGetting: 0,
                loading: 0
            });
        });
    },
    /**
     * 去使用
     */
    goToUse: function () {
        let {goodsInfo} = this.data;
        wx.navigateTo({
            url: '/pages/game/goodsDetail/goodsDetail?id=' + goodsInfo.id + '&gid=' + goodsInfo.goods_id
        });
    },
    /**
     * 再摇一次
     */
    goToYao: function () {
        let {goodsInfo, dice_record_id} = this.data;
        wx.navigateTo({
            url: '/pages/game/yao/yao?id=' + goodsInfo.id + '&dice_record_id='/* + dice_record_id*/
        });
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        clearInterval(this.data.timer);
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        clearInterval(this.data.timer);
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let {current_page, last_page} = this.data;
        if (last_page > current_page) {
            this.getpkrecord();
        }
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
            console.log("来自按钮分享")
        }
        let {goodsInfo, dice_record_id} = this.data;
        return {
            title: '摇骰pk最高免费领商品！帮我摇一摇，助我得优惠！',
            path: `/pages/game/yao/yao?id=${goodsInfo.id}&dice_record_id=${dice_record_id}`,
            imageUrl: 'https://img.duishangbao.cn/upload/game/yao.jpg',
            success: function () {
                console.log('分享成功')
            }
        }
    }
});