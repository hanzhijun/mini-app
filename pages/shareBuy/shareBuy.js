// pages/shareBuy/shareBuy.js
const app = getApp();
let T;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        start_x: 0,       // 控制进度条
        showPop: false,     //关闭弹框
        imgUrl: app.config.imgUrl,
        host: app.config.host,
        e_data: 0,
        click_type: '',       // 分享者: share || 参与者： join
        alert_data: {         // 参与者弹窗信息
            join_status: '',    // 参与成功 || 失败 || 人数已满
            get_gold: 0,        // 参与者获得的金贝
            gid: 0
        },
        res_data: {},
        time: [],             // [时,分,秒]
        s: 0,
        join_info: [],        // 加入者信息
        btnText: ['激活成功，立即捞得', 0],
        // goods_list: [],
        options: {},
        show_guize: false,
        tcType: -1, // 弹窗 -1关闭、1发起者成功、2参与者成功、3参与者失败、4规则弹窗
        joinGetCount: '',
        have_get: -1, // 参与者状态 //0参与人数已满、 2今日参与次数已达上限、1成功
        joinInfo: "" // 参与者错误提示
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let {e_data} = options;
        this.setData({
            options,
            e_data
        });
        let that = this.selectComponent("#loginBox");
        let _this = this;
        if (!wx.getStorageSync('token')) {
            if (that) {
                that.setData({
                    hidden: false
                });
            }
        } else {
            if (that) {
                that.setData({
                    hidden: 'hidden',
                });
            }
            _this.init();
        }
    },

    init: function () {
        wx.showLoading();
        let {e_data, alert_data} = this.data;
        app.post('share/checkshare', {
            order_id: e_data
        }, (res) => {
            if (res.data.is_first_click == 1 && res.data.click_type == 'join') {

                app.post('share/shareclick', {
                    order_id: e_data
                }, (res) => {

                    if (res.code == 200) {
                        alert_data.get_gold = res.data.get_gold;
                        alert_data.gid = res.data.goods_id;
                        alert_data.join_status = res.info;
                        this.setData({
                            tcType: 2,
                            alert_data,
                            showPop: true,
                            have_get: 1
                        });
                    } else if (res.info == '参与人数已满' || res.info == '活动已过期') {
                        this.setData({
                            tcType: 3,
                            have_get: 0
                        });
                    } else if (res.info == '今日参与次数已达上限') {
                        this.setData({
                            tcType: 3,
                            have_get: 2
                        });
                    } else {
                        this.setData({
                            tcType: 3,
                            have_get: 3
                        });
                    }

                    this.getDetail();

                })
            } else {
                this.setData({
                    have_get: 1
                });
                this.getDetail();
            }

            this.setData({
                click_type: res.data.click_type
            })
        });

        setTimeout(function () {
            wx.hideLoading();
        }, 3000);
    },

    moreGoods() {

        app.openPage(`newIndex/templateTwo/templateTwo?id=10036`);

    },

    loginevent: function (e) {
        setTimeout(() => {
            this.init();
        }, 500)
    },

    getDetail() {

        let {e_data, btnText} = this.data;
        app.post('share/getsharedetail', {
            order_id: e_data
        }, (res) => {
            clearInterval(T);
            if (res.code == 200) {
                let res_data = res.data;
                let s = res_data.dead_time - parseInt(new Date().getTime() / 1000);
                this.setData({
                    s
                });
                if (s > 0) {
                    T = setInterval(() => {
                        s--;
                        this.formatTime(s);
                        if (s <= 0) {
                            clearInterval(T);
                            this.setData({
                                s: -1
                            });
                            this.onLoad(this.data.options);
                        }
                    }, 1000)
                }
            }

            if (res.data.is_get) btnText = ['领取成功，已获得', 1];
            this.setData({
                res_data: res.data,
                btnText,
                start_x: res.data.have_get / res.data.all_gold * 630
            });

            var join_info = res.data.join_info, newJoinInfo = [];
            for (var m = 0; m < join_info.length; m++) {
                newJoinInfo.push(join_info[m])
            }
            var obj = {
                gold: '',
                nickname: '',
                avatarUrl: app.config.host + '/upload/sharePay/touxiang.png'
            };
            if (join_info.length < res.data.limit_num) {
                for (var j = 0; j < (res.data.limit_num - join_info.length); j++) {
                    newJoinInfo.push(obj)
                }
            }

            this.setData({
                join_info: newJoinInfo
            });
            if (this.data.click_type == 'join') {
                this.setData({
                    joinGetCount: Math.floor(res.data.all_gold / res.data.limit_num)
                })
            }

            setTimeout(function () {
                wx.hideLoading();
            }, 300);

        })

    },

    // 格式化时间
    formatTime(s) {

        var secondTime = parseInt(s);// 秒
        var minuteTime = 0;// 分
        var hourTime = 0;// 小时
        if (secondTime > 60) {//如果秒数大于60，将秒数转换成整数
            minuteTime = parseInt(secondTime / 60);
            secondTime = parseInt(secondTime % 60);
            if (minuteTime > 60) {
                hourTime = parseInt(minuteTime / 60);
                minuteTime = parseInt(minuteTime % 60);
            }
        }

        this.setData({
            time: [hourTime, minuteTime, secondTime]
        })

    },

    getGold() {

        let {e_data, btnText} = this.data;
        if (btnText[1]) return;
        app.post('share/getindirectgold', {order_id: e_data}, (res) => {
            /*if (res.code == 200) app.alert('领取成功！', 'success', () => {
             /!*this.setData({
             btnText: ['领取成功，已获得', 1]
             })*!/
             });
             else app.alert('领取失败', 'none');*/
            if (res.code == 200) {
                // 领取成功
                this.setData({
                    btnText: ['领取成功，已获得', 1],
                    tcType: 1
                })
            } else {
                // 领取失败
                app.alert('领取失败', 'none');
            }
        })

    },

    openPage() {
        app.openPage(`shopCart/goodsDetail/goodsDetail?gid=` + this.data.res_data.goods_id);
    },

    gotoHome() {
        wx.switchTab({
            url: '/pages/index/index'
        })
    },

    openRule() {
        this.setData({
            tcType: 4
        })
    },

    isee() {
        this.setData({
            tcType: -1
        })
    },

    /**
     * 分享
     * @param res
     * @returns {{title: string, path: string, imageUrl: string, success: success}}
     * {{res_data.img_url}}{{res_data.list_path}}{{res_data.g_pic}} {{res_data.g_name}}
     */
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
        }
        let {e_data, res_data} = this.data;
        return {
            title: res_data.g_name,
            path: `pages/shareBuy/shareBuy?e_data=` + e_data,
            imageUrl: res_data.img_url + res_data.list_path + res_data.g_pic,
            success: function () {
            }
        }
    },

    // 下拉
    onPullDownRefresh() {
        this.setData({
            have_get: -1,
            tcType: -1,
            joinGetCount: "",
            joinInfo: ""
        });
        this.init();
    }
});