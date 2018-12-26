const app = getApp();
import Scratch from '../../components/scratch/scratch.js'

Page({
    data: {
        host: app.config.host,
        loading: 1, // loading加载提示框
        toast: 0, // 提示文字
        title: '刮一刮记录',
        toastTxt: '',
        isStart: false,
        txt: '刮一刮 看手气',
        use_num: 0, // 已刮次数
        total_num: 0, // 可刮总次数
        remain_num: 0, // 剩余可刮数
        game_host: app.config.game_host, //活动图片地址
        is_alert_pop: 0,
        count_three: 0,
        count_ten: 0,
        isLogin: 0,
        toView: '',
        active_time: {},
        formId: '',
        closePrize: 0,
        showCanvas: 0,
        id: '',
        yyy_id: '',
    },

    onLoad(options) {
        let {share_userId} = options;
        // 分享页面打开次数统计
        if (share_userId) {
            app.post('game/pageOpen', {
                invitid: share_userId
            }, (res) => {
            });
        } else {
            share_userId = ""
        }
        this.setData({
            share_userId
        });
        this.record(); // 记录pv
    },

    onShow: function () {
        this.setData({
            loading: 1
        });
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
                isLogin: 1
            });
            this.init();
        }
    },

    init: function () {

        this.setData({
            loading: 1
        });
        this.turnApi();
        let _this = this;
        _this.scratch = null;
        let w = wx.getSystemInfoSync().windowWidth;
        _this.scratch = new Scratch(this, {
            canvasWidth: Math.floor(w * 535 / 750),
            canvasHeight: Math.floor(w * 230 / 750),
            imageResource: app.config.host + '/upload/game/gua-bg.jpg',
            maskColor: 'red',
            r: 60,
            awardTxt: '刮奖区',
            awardTxtColor: '#3985ff',
            awardTxtFontSize: '2px',
            callback: () => {
                // 确认刮一刮奖励
                app.post('game/confirmscratchersreward', {
                    record_id: _this.data.record_id
                }, (res) => {
                    if (res.code == 200) {
                        var goods_type = _this.data.result.scratchcards_goods_type;
                        if (goods_type == 0) {
                            _this.setData({
                                is_alert_pop: 1,
                                closePrize: 1
                            })
                        } else if (goods_type == 1) {
                            _this.setData({
                                is_alert_pop: 1,
                                closePrize: 2
                            })
                        } else if (goods_type == 2) {
                            _this.setData({
                                is_alert_pop: 1,
                                closePrize: 3
                            })
                        }
                        _this.setData({
                            showCanvas: 0
                        })
                    }
                });
            }
        });
        _this.setData({
            isStart: false,
            showCanvas: 0
        });
        _this.getCount(); // 获取刮一刮活动次数
        _this.getIconNum(); // 获取金贝银贝数量

    },
    // Dispatch/turnApi
    /**
     * 获取刮刮列表，摇摇列表
     */
    turnApi() {
        app.post('Dispatch/turnApi', {}, (res) => {
            if (res.code = 200) {
                console.info(res);
                let {yyy_data, ggl_data, web_url, yyy_save_path, ggl_save_path} = res.data;
                this.setData({
                    yyy_data,
                    ggl_data,
                    web_url,
                    yyy_save_path,
                    ggl_save_path,
                    yyy_id: yyy_data[0].id,
                    loading: 0
                });
            }
        })
    },
    /**
     * 记录pv
     */
    record() {
        app.post('Gamepv/insertGamePv', {}, (res) => {})
    },
    /**
     * 获取金贝银贝数量
     */
    getIconNum() {
        // app.post('Dispatch/getUsergold', {}, (res) => {
        //     if (res.code = 200) {
        //         this.setData({
        //             surplus_goldshells: res.data.gold
        //         })
        //     }
        // });
        app.post('User/detial', {}, (res) => {
            if (res.code = 200) {
                if (res.data.length != 0) {
                    this.setData({
                        userInfo: res.data.user_info,
                        sliverInfo: res.data.user_info.surplus_silvershells + res.data.user_info.surplus_business_silvershells,
                        surplus_goldshells: res.data.user_info.surplus_goldshells
                    })
                }
            }
        });
    },
    /**
     * 获取刮一刮活动次数
     */
    getCount() {
        app.post('game/getscratchersnum', {}, (res) => {
            if (res.code = 200) {
                this.setData({
                    count: res.data,
                    use_num: res.data.use_num
                })
            }
        });
    },
    /**
     * 点击刮一刮
     * @param e
     */
    onStart(e) {
        let {share_userId, isStart} = this.data;
        let {formId} = e.detail;
        this.setData({
            formId,
            loading: 1
        });
        if (isStart) {
            this.scratch.start();
            this.setData({
                txt: '重新开始',
                isStart: false,
                showCanvas: 1
            })
        } else {
            this.scratch.restart();
            this.setData({
                prizeName: '',
                showCanvas: 1
            });
        }
        let _this = this;
        // 点击刮一刮 获取刮一刮奖励
        app.post('game/getscratchersreward', {
            share_id: share_userId,
            form_id: formId
        }, (res) => {
            if (res.code = 200) {
                _this.setData({
                    result: res.data,
                    record_id: res.data.record_id,
                    loading: 0
                });
                // 如果成功则可能会有商品或者金贝
                var goods_type = _this.data.result.scratchcards_goods_type;
                if (res.code == 200) {
                    if (goods_type == 0) {
                        _this.setData({
                            prizeName: "未中奖"
                        })
                    }
                    if (goods_type == 1) {
                        _this.setData({
                            prizeName: res.data.scratchcards_goods_name
                        })
                    }
                    if (goods_type == 2) {
                        _this.setData({
                            prizeName: res.data.scratchcards_gold_num
                        })
                    }
                }
            }
        });
    },
    /**
     * 无刮刮次数
     */
    nullStart() {
        this.init();
        if (this.data.use_num >= 10) { // 返回10次数已用完
            this.setData({
                is_alert_pop: 1,
                count_three: 0,
                count_ten: 1,
                showCanvas: 0,
                closePrize: 0
            })
        } else if (this.data.count.remain_num == 0) { // 返回3次数已用完
            this.setData({
                is_alert_pop: 1,
                count_three: 1,
                count_ten: 0,
                showCanvas: 0,
                closePrize: 0
            })
        }
    },
    /**
     * 页面跳转
     * @param e
     */
    openPage(e) {
        let _this = this;
        setTimeout(function () {
            _this.setData({
                showCanvas: 0
            })
        }, 500);
        let {
            type
        } = e.currentTarget.dataset;
        if (type == 'index') {
            wx.switchTab({
                url: '/pages/index/index'
            })
        } else if (type == "yaoRecord") {
            app.openPage('game/myYaoRecord/myYaoRecord');
        } else if (type == "guaRecord") {
            app.openPage('game/gua/guaList/guaList');
        }
    },
    /**
     * 关闭弹框
     */
    close: function () {
        this.init();
        this.setData({
            is_alert_pop: 0,
            showCanvas: 0,
            count_three: 0,
            count_ten: 0
        })
    },
    /**
     * 立即领取
     * @param e
     */
    receive: function (e) {
        let {
            record_id
        } = e.currentTarget.dataset;
        let {
            result
        } = this.data;
        let json = {
            is_use_gold: 1,
            is_use_balance: 0
        };
        let spec_json = {
            goods_id: result.goods_id,
            spec_id: result.spec_id,
            num: 1,
            is_active: 0,
            cid: '',
            order_id: ''
        };
        json.param = [spec_json];
        app.setStorageSync({
            ginfo: json
        });
        app.post('game/receivescratchersreward', {
            record_id: record_id
        }, () => {
            app.openPage(`game/order/order?record_id=${record_id}`)
        });
        this.setData({
            is_alert_pop: 0,
            showCanvas: 1
        })
    },
    /**
     * tab点击切换
     * @param e
     */
    navbarTap: function (e) {
        let {id} = e.currentTarget.dataset;
        if(id != this.data.yyy_id) {
            this.setData({
                yyy_id: id
            })
        }
    },
    /**
     * 立即使用
     */
    jumpTo: function () {
        wx.pageScrollTo({
            scrollTop: 2450
        });
        this.setData({
            is_alert_pop: 0,
            showCanvas: 0
        });
        this.close();
    },
    /**
     * 跳转商品详情
     * @param e
     */
    gotoDetail: function (e) {
        let {id, gid} = e.currentTarget.dataset;
        app.openPage(`game/goodsDetail/goodsDetail?id=${id}&gid=${gid}`)
    },
    /**
     * 解锁更多刮奖机会
     */
    btnShare: function () {
        let _this = this;
        setTimeout(function () {
            _this.setData({
                showCanvas: 0
            })
        }, 500);
    },
    /**
     * 分享
     * @param res
     * @returns {{title: string, path: string, imageUrl: string, success: success}}
     */
    onShareAppMessage: function (res) {
        if (res.from === 'button') {}
        // 分享收集接口
        app.post('game/shareCount', {
            is_page: 0
        }, (res) => {
        });
        let {
            userInfo
        } = this.data;
        return {
            title: '中奖率超高的刮刮乐！你也来试试吧~',
            path: `pages/game/index?share_userId=${userInfo.user_id}`,
            imageUrl: app.config.host + '/upload/game/gua.jpg',
            success: function () {}
        }
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.onShow();
        wx.stopPullDownRefresh();
    },
    /**
     * 登录成功回执
     */
    loginevent: function () {
        this.init();
        this.setData({
            isLogin: 1,
        });
    },


});