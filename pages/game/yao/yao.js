const app = getApp();

Page({
    data: {
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        loading: 1, // loading加载提示框
        toast: 0, // 提示文字
        title: '摇一摇',
        toastTxt: '',
        isStartYao: false, // 摇一摇
        game_host: app.config.game_host, //活动图片地址
        id: '', // 商品id
        dice_record_id: '', // 记录ID
        isLogin: 0, // 是否登录
        // 摇
        gaiDou: 0, // 抖
        gaiMove: 0, // 移
        resultTc: 0, // pk结果弹窗
        yaoInfo: {
            game_result: '',
            game_num: '',
            first_num: '',
            second_num: '',
            sponsor_avatar_url: ''
        },
        minute: -1,
        second: -1,
        // 商品详情
        goodsInfo: {},
        // pk记录
        pkList: [],
        gameInfo: "",
        type: '', // 类型 1-发起者; 2-参与者已摇；3-参与者未摇
        sponsor_record: '', // 发起者数据
        join_record: '',
        total: 0,  // pk记录总条数
        per_page: 20,
        current_page: 0, // pk记录当前页码
        last_page: 1,  // pk记录总页数
        isGetting: 0, // 是否正在请求数据 0 没有 1 正在
        data: [], // pk记录

        userInfo: "",
        sliverInfo: "",
        surplus_goldshells: "",

        benefit_type: '',
        benefit_name: '',
        benefit_value: '',
        benefit_level: '',

        formId: '',
        tsText: '',
        tcTs: 0,

        timer: '',
        timer2: '',
        is_alert_pop: 0,
        pageShow: 0
    },

    onLoad: function (options) {

        let {id, dice_record_id} = options;
        this.setData({
            id,
            dice_record_id
        });
        if (!dice_record_id) {
            this.setData({
                type: 1
            });
        }

    },

    onShow: function () {
        let that = this.selectComponent("#loginBox");
        if (!wx.getStorageSync('token')) {
            if (that) {
                that.setData({
                    hidden: false
                });
            }
        } else {
            if (that) {
                that.setData({
                    hidden: 'hidden'
                });
            }
            this.setData({
                pkList: [],
                total: 0,
                per_page: 20,
                current_page: 0,
                last_page: 1,
                isGetting: 0,
                isLogin: 1
            });
            this.init();
        }
    },

    init: function () {

        this.setData({
            isStartYao: false,
            loading: 1
        });

        let {dice_record_id} = this.data;

        if (dice_record_id) {
            this.getGoodsdetail(this.data.id, 1);
            this.getIconNum();
            this.getdiceshareinfo();

        } else {
            this.setData({
                type: 1,
                pageShow: 1,
                minute: '',
                second: ''
            });
            this.getGoodsdetail(this.data.id, 2);
            this.getIconNum();
        }

    },

    // 摇的结果
    yaoResult: function () {
        this.setData({
            isStartYao: false
        });
        if (this.data.type == 1) {
            this.lunXunTime();
        }
    },

    // 1. 获取商品详情
    getGoodsdetail: function (id, type) {
        var _this = this;
        app.post('/game/clientgoodsdetail', {
            id
        }, (res) => {
            if (res.code == 200) {
                _this.setData({
                    goodsInfo: res.data[id]
                });
            } else {
                console.log(res.info);
            }
            if (type == 2) {
                this.setData({
                    loading: 0
                });
            }
        });
    },

    // 2. 获取摇一摇详细信息
    getdiceshareinfo: function () {
        let {dice_record_id} = this.data;
        var _this = this;
        app.post('/game/getdiceshareinfo', {
            dice_record_id
        }, (res) => {
            if (res.code == 200) {
                let {type, sponsor_record, join_record} = res.data;

                if (type == 1) { // 类型 1-发起者; 2-参与者已摇；3-参与者未摇
                    _this.setData({
                        type,
                        sponsor_record
                    });
                    setTimeout(function () {
                        if (sponsor_record.status) {
                            _this.setData({
                                gaiDou: 0,
                                gaiMove: 1
                            });
                        }
                    }, 300);
                } else if (type == 2) {
                    let obj = {
                        game_result: join_record.result,
                        game_num: join_record.game_num,
                        first_num: join_record.first_num,
                        second_num: join_record.second_num,
                        sponsor_avatar_url: _this.data.yaoInfo.sponsor_avatar_url
                    };
                    _this.setData({
                        type,
                        sponsor_record,
                        join_record,
                        yaoInfo: obj,
                        gaiDou: 0,
                        gaiMove: 1
                    });


                } else {
                    _this.setData({
                        type,
                        sponsor_record
                    });
                }
                _this.lunXunTime();
                _this.setData({
                    pageShow: 1
                });
                _this.getpkrecord();
                _this.getbenefit();
            } else {
                _this.setData({
                    loading: 0
                });
            }
        });

    },

    // 3. 发起摇色子
    dicesponsor: function () {

        let {id, formId, isGetting} = this.data;
        if (isGetting == 1) return;
        var _this = this;
        _this.setData({
            isGetting: 1,
            minute: -1,
            second: -1
        });
        app.post('/game/dicesponsor', {
            reward_id: id,
            form_id: formId
        }, (res) => {
            if (res.code == 200) {
                let {game_num, first_num, second_num, dice_record_id} = res.data;
                _this.setData({
                    yaoInfo: {
                        game_result: '',
                        game_num,
                        first_num,
                        second_num,
                        sponsor_avatar_url: ''
                    },
                    dice_record_id,
                    pkList: [],
                    total: 0,
                    per_page: 20,
                    current_page: 0,
                    last_page: 1
                });
                _this.getdiceshareinfo();
                setTimeout(function () {
                    _this.setData({
                        isGetting: 0
                    });
                }, 300);

                setTimeout(function () {
                    // 移走盖子
                    _this.setData({
                        gaiDou: 0,
                        gaiMove: 1
                    });
                    _this.yaoResult();
                }, 1500);

            } else {
                // 停止摇动
                _this.setData({
                    gaiDou: 0,
                    gaiMove: 0,
                    isStartYao: false
                });
                _this.toast2(res.info, 5000)

            }

            console.log('发起3秒后');
            setTimeout(function () {
                _this.setData({
                    isGetting: 0
                });
            }, 3000);
        });
    },

    // 4. 参加摇色子
    dicejoin: function () {

        let {dice_record_id, formId, isGetting} = this.data;
        if (isGetting == 1) return;
        var _this = this;
        _this.setData({
            isGetting: 1
        });
        app.post('/game/dicejoin', {
            dice_record_id,
            form_id: formId
        }, (res) => {
            if (res.code == 200) {

                let {game_num, first_num, second_num, game_result='', sponsor_avatar_url} = res.data;
                _this.setData({
                    yaoInfo: {
                        game_result, // 1:输 2:平 3:赢
                        game_num,
                        first_num,
                        second_num,
                        sponsor_avatar_url
                    }
                });
                _this.getdiceshareinfo();
                setTimeout(function () {
                    _this.setData({
                        isGetting: 0
                    });
                }, 300);
                setTimeout(function () {
                    // 移走盖子
                    _this.setData({
                        gaiDou: 0,
                        gaiMove: 1,
                        isStartYao: false
                    });
                }, 1500);

                setTimeout(function () {
                    _this.setData({
                        resultTc: 1
                    });
                }, 2500);

            } else {
                // 移走盖子
                _this.setData({
                    gaiDou: 0,
                    gaiMove: 0,
                    isStartYao: false,
                    isGetting: 0
                });
                _this.toast2(res.info, 5000)

            }
        });
    },

    // 5. 获取PK记录
    getpkrecord: function () {

        this.setData({
            resultTc: 0,
            pkList: [],
            total: 0,
            per_page: 20,
            current_page: 0,
            last_page: 1,
            isGetting: 0
        });

        let {dice_record_id, current_page, isGetting} = this.data;
        if (isGetting == 1) return;

        var _this = this;
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
                    pkList
                });

            } else {
                console.log(res.info);
            }
            setTimeout(function () {
                _this.setData({
                    isGetting: 0,
                    loading: 0
                });
            }, 800)
        });

    },

    // 6. 领取摇骰子奖励
    getdicereward: function () {

        let {dice_record_id} = this.data;
        var _this = this;
        app.post('/game/getdicereward', {
            dice_record_id
        }, (res) => {
            if (res.code == 200) {
                _this.data.sponsor_record.status = 3;

                let {reward_id, goods_id, share_dice_id, result, game_num, first_num, second_num, game_won, open_id, form_id, create_at} = _this.data.sponsor_record;
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
                    create_at
                };
                _this.setData({
                    sponsor_record: obj
                });

            } else {
                console.log(res.info);
                _this.setData({
                    isGetting: 0
                });
            }
        });

    },

    // 7. 获取优惠详情
    getbenefit: function () {
        let {goodsInfo, sponsor_record} = this.data;

        if (sponsor_record.game_won > 0) {
            let level = sponsor_record.game_won > 4 ? 5 : sponsor_record.game_won;
            if(goodsInfo.benefit_info == undefined) return;
            let list = goodsInfo.benefit_info[level];
            this.setData({
                benefit_type: list.benefit_type,
                benefit_name: list.name,
                benefit_value: list.benefit_value,
                benefit_level: list.benefit_level
            });
        }
    },

    // 开始摇
    returnYao: function (e) {

        let {formId} = e.detail;

        this.setData({
            isStartYao: true,
            formId
        });

        wx.showToast({
            title: '请您摇一摇',
            icon: 'success',
            duration: 2000
        });

    },

    // 模拟摇一摇事件
    moniYaoyiYao: function (e) {
        let {formId} = e.detail;
        let {type, isGetting} = this.data;
        this.setData({
            formId,
            gaiDou: 1,
            gaiMove: 0
        });
        if (isGetting == 1) return;
        if (type == 1) {
            this.dicesponsor();
        } else {
            this.dicejoin();
        }
    },

    // 关闭result弹窗
    close: function () {
        this.setData({
            resultTc: 0,
            isGetting: 0
        });
    },
    close2: function () {
        this.setData({
            is_alert_pop: 0
        });
    },
    lookPk: function () {
        this.close2();
        this.goTopkList();
    },
    // 播放声音
    playShakeAudio: function () {
        let backgroundAudioManager = wx.getBackgroundAudioManager();
        backgroundAudioManager.title = '摇色子';
        backgroundAudioManager.src = app.config.host + '/upload/game/saizi1.mp3';
    },

    // 跳转我的PK记录
    goTopkList: function () {
        let {dice_record_id} = this.data;
        wx.navigateTo({
            url: '/pages/game/yao/record/record?dice_record_id=' + dice_record_id
        });
    },

    // 去使用
    goToUse: function () {
        let {goodsInfo} = this.data;
        wx.navigateTo({
            url: '/pages/game/goodsDetail/goodsDetail?id=' + goodsInfo.id + '&gid=' + goodsInfo.goods_id
        });
    },

    // 返回活动首页
    returnIndex: function () {
        this.setData({
            resultTc: 0
        });
        app.openPage('game/index');
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

        this.setData({
            goodsInfo: '',
            pkList: []
        });
        this.onShow();

    },

    /**
     * 登录成功回执
     */
    loginevent: function () {
        console.log("登录回执");
        this.init();
        this.setData({
            isLogin: 1
        });
    },

    /**
     * 获取金贝银贝数量
     */
    getIconNum(){

        app.post('User/detial', {}, (res) => {
            if (res.data.length != 0) {
                this.setData({
                    avatarUrl: res.data.user_info.avatarUrl,
                    surplus_goldshells: res.data.user_info.surplus_goldshells
                })
            }
        });

    },

    // 计算游戏局剩余时间
    lunXunTime: function () {

        let _this = this;
        clearInterval(_this.data.timer);
        _this.data.timer = setInterval(function () {
            let timestamp = Date.parse(new Date()) / 1000;
            let {laveTime='', sponsor_record} = _this.data;
            if (sponsor_record.create_at) {
                laveTime = _this.data.sponsor_record.create_at * 1 + 600;
            }

            if (laveTime == '' || laveTime < timestamp + 1) {
                _this.setData({
                    minute: '',
                    second: ''
                });
                clearInterval(_this.data.timer);

                let {reward_id, goods_id, share_dice_id, result, game_num, first_num, second_num, game_won, open_id, form_id, status, create_at, cur_winning_streak} = _this.data.sponsor_record;
                if (status == 1) {
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
                        status: 0,
                        create_at,
                        cur_winning_streak
                    };
                    _this.setData({
                        sponsor_record: obj,
                        gaiDou: 0,
                        gaiMove: 0
                    });
                }

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

    onShareAppMessage: function (res) {
        let _this = this;
        setTimeout(function () {
            _this.setData({
                is_alert_pop: 1
            });
        }, 1000);
        if (res.from === 'button') {
            console.log("来自按钮分享")
        }

        let {id, dice_record_id} = this.data;
        return {
            title: '摇骰pk最高免费领商品！帮我摇一摇，助我得优惠！',
            path: `pages/game/yao/yao?id=${id}&dice_record_id=${dice_record_id}`,
            imageUrl: 'https://img.duishangbao.cn/upload/game/yao.jpg',
            success: function (e) {
                console.log('分享成功'); // 可能获取不到
            },
            fail: function (e) {
                console.log('分享失败'); // 可能获取不到
            }
        }
    },
    // 提示弹窗
    toast2: function (value, time) {
        this.setData({
            tsText: value,
            tcTs: 1
        });
        let _this = this;
        setTimeout(function () {
            _this.setData({
                tsText: '',
                tcTs: 0
            });
        }, time == 'undefined' ? 3000 : time);
    }

});
